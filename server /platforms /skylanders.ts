/**
 * Skylanders Portal of Power Protocol Handler
 * Handles USB HID communication for Skylanders portals
 * 
 * Protocol Details:
 * - Vendor ID: 0x1430 (RedOctane)
 * - Product ID: 0x0150
 * - Report Size: 32 bytes
 * - Communication: Interrupt transfers at ~50Hz
 * - Command Format: ASCII command character as first byte
 */

import { getUSBEmulator } from "../usb-emulator";
import { getUserToys, getToyUpgrades, updatePortalState } from "../db";

const DEVICE_INDEX = 1; // /dev/hidg1

export interface SkylandersCommand {
  command: string; // ASCII character
  data: Buffer;
}

/**
 * Parse incoming Skylanders command
 */
export function parseSkylandersCommand(buffer: Buffer): SkylandersCommand {
  return {
    command: String.fromCharCode(buffer[0]),
    data: buffer.slice(1),
  };
}

/**
 * Create Skylanders response buffer
 */
export function createSkylandersResponse(data: Buffer | null = null): Buffer {
  const response = Buffer.alloc(32);
  if (data) {
    data.copy(response, 0);
  }
  return response;
}

/**
 * Handle Skylanders command
 */
export async function handleSkylandersCommand(
  command: SkylandersCommand,
  userId: number,
  portalStateId: number
): Promise<Buffer> {
  const cmd = command.command.toUpperCase();

  switch (cmd) {
    case "S": // Status
      return await handleSkylandersStatus(command, userId, portalStateId);

    case "Q": // Query
      return await handleSkylandersQuery(command, userId, portalStateId);

    case "W": // Write
      return await handleSkylandersWrite(command, userId, portalStateId);

    case "A": // Activate
      return await handleSkylandersActivate(command, userId, portalStateId);

    case "C": // Color (LED)
      return await handleSkylandersColor(command, userId, portalStateId);

    default:
      console.warn(`[Skylanders] Unknown command: ${cmd}`);
      return createSkylandersResponse();
  }
}

/**
 * Handle Status command - returns figure status array
 */
async function handleSkylandersStatus(
  command: SkylandersCommand,
  userId: number,
  portalStateId: number
): Promise<Buffer> {
  try {
    const toys = await getUserToys(userId, "skylanders");

    const response = Buffer.alloc(32);
    response[0] = 0x53; // 'S' - Status response

    // Status array: 1 byte per portal slot (0-2)
    // Bit pattern: 0x01 = figure present, 0x02 = new figure, etc.
    for (let i = 0; i < Math.min(3, toys.length); i++) {
      response[1 + i] = 0x01; // Figure present
    }

    return response;
  } catch (error) {
    console.error("[Skylanders] Error in handleSkylandersStatus:", error);
    return createSkylandersResponse();
  }
}

/**
 * Handle Query command - returns figure data
 */
async function handleSkylandersQuery(
  command: SkylandersCommand,
  userId: number,
  portalStateId: number
): Promise<Buffer> {
  try {
    const slotIndex = command.data[0] || 0; // Which portal slot
    const toys = await getUserToys(userId, "skylanders");

    if (slotIndex >= toys.length) {
      return createSkylandersResponse();
    }

    const toy = toys[slotIndex];
    const upgrades = await getToyUpgrades(toy.id);

    const response = Buffer.alloc(32);
    response[0] = 0x51; // 'Q' - Query response
    response[1] = slotIndex;

    // Figure ID (2 bytes)
    const toyId = parseInt(toy.toyId, 16) || 0;
    response.writeUInt16LE(toyId, 2);

    // Add upgrade data
    let offset = 4;
    for (const upgrade of upgrades.slice(0, 10)) {
      if (offset + 2 > 32) break;
      const key = parseInt(upgrade.upgradeKey, 16) || 0;
      const value = parseInt(upgrade.upgradeValue, 16) || 0;
      response[offset++] = key;
      response[offset++] = value;
    }

    return response;
  } catch (error) {
    console.error("[Skylanders] Error in handleSkylandersQuery:", error);
    return createSkylandersResponse();
  }
}

/**
 * Handle Write command - stores figure data/upgrades
 */
async function handleSkylandersWrite(
  command: SkylandersCommand,
  userId: number,
  portalStateId: number
): Promise<Buffer> {
  try {
    const slotIndex = command.data[0] || 0;
    const figureId = command.data.readUInt16LE(1);
    const upgradeData = command.data.slice(3);

    console.log(
      `[Skylanders] Writing figure 0x${figureId.toString(16)} to slot ${slotIndex}`
    );

    const response = Buffer.alloc(32);
    response[0] = 0x57; // 'W' - Write response
    response[1] = slotIndex;

    return response;
  } catch (error) {
    console.error("[Skylanders] Error in handleSkylandersWrite:", error);
    return createSkylandersResponse();
  }
}

/**
 * Handle Activate command - activates figure on portal
 */
async function handleSkylandersActivate(
  command: SkylandersCommand,
  userId: number,
  portalStateId: number
): Promise<Buffer> {
  try {
    const slotIndex = command.data[0] || 0;
    const figureId = command.data.readUInt16LE(1);

    console.log(
      `[Skylanders] Activating figure 0x${figureId.toString(16)} on slot ${slotIndex}`
    );

    const response = Buffer.alloc(32);
    response[0] = 0x41; // 'A' - Activate response
    response[1] = slotIndex;

    return response;
  } catch (error) {
    console.error("[Skylanders] Error in handleSkylandersActivate:", error);
    return createSkylandersResponse();
  }
}

/**
 * Handle Color command - sets LED color
 */
async function handleSkylandersColor(
  command: SkylandersCommand,
  userId: number,
  portalStateId: number
): Promise<Buffer> {
  try {
    const red = command.data[0] || 0;
    const green = command.data[1] || 0;
    const blue = command.data[2] || 0;

    const hexColor = `#${red.toString(16).padStart(2, "0")}${green
      .toString(16)
      .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;

    console.log(`[Skylanders] Setting LED color to ${hexColor}`);

    // Update portal state with new LED color
    await updatePortalState(portalStateId, { ledColor: hexColor });

    const response = Buffer.alloc(32);
    response[0] = 0x43; // 'C' - Color response

    return response;
  } catch (error) {
    console.error("[Skylanders] Error in handleSkylandersColor:", error);
    return createSkylandersResponse();
  }
}

/**
 * Send Skylanders response to portal
 */
export async function sendSkylandersResponse(response: Buffer): Promise<boolean> {
  const emulator = getUSBEmulator();
  return await emulator.sendReport(DEVICE_INDEX, response);
}

/**
 * Initialize Skylanders portal
 */
export async function initializeSkylandersPortal(): Promise<boolean> {
  const emulator = getUSBEmulator();

  if (!emulator.isDeviceReady(DEVICE_INDEX)) {
    console.error("[Skylanders] /dev/hidg1 not available");
    return false;
  }

  console.log("[Skylanders] Skylanders portal initialized");
  return true;
}
