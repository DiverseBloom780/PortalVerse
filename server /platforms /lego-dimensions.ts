/**
 * Lego Dimensions Portal Protocol Handler
 * Handles USB HID communication for Lego Dimensions portals
 * 
 * Protocol Details:
 * - Vendor ID: 0x0E6F (Mattel)
 * - Product ID: 0xF446
 * - Report Size: 32 bytes
 * - Communication: Interrupt transfers at ~50Hz
 */

import { getUSBEmulator } from "../usb-emulator";
import { getUserToys, getToyUpgrades, updatePortalState } from "../db";

const DEVICE_INDEX = 0; // /dev/hidg0

export interface LDCommand {
  command: number;
  data: Buffer;
}

export interface LDResponse {
  status: number;
  data: Buffer;
}

/**
 * Parse incoming Lego Dimensions command
 */
export function parseLDCommand(buffer: Buffer): LDCommand {
  return {
    command: buffer[0],
    data: buffer.slice(1),
  };
}

/**
 * Create Lego Dimensions response buffer
 */
export function createLDResponse(status: number, data?: Buffer): Buffer {
  const response = Buffer.alloc(32);
  response[0] = status;
  if (data) {
    data.copy(response, 1);
  }
  return response;
}

/**
 * Handle Lego Dimensions command
 */
export async function handleLDCommand(
  command: LDCommand,
  userId: number,
  portalStateId: number
): Promise<Buffer> {
  const cmd = command.command;

  // Command types (examples based on LD protocol)
  switch (cmd) {
    case 0x01: // Activate/Query
      return await handleLDActivate(command, userId, portalStateId);

    case 0x02: // Write
      return await handleLDWrite(command, userId, portalStateId);

    case 0x03: // Read
      return await handleLDRead(command, userId, portalStateId);

    case 0x04: // Status
      return await handleLDStatus(command, userId, portalStateId);

    default:
      console.warn(`[LD] Unknown command: 0x${cmd.toString(16)}`);
      return createLDResponse(0xFF); // Error response
  }
}

/**
 * Handle Activate command - checks for figures on portal
 */
async function handleLDActivate(
  command: LDCommand,
  userId: number,
  portalStateId: number
): Promise<Buffer> {
  try {
    const toys = await getUserToys(userId, "lego_dimensions");

    // Create response with figure data
    const response = Buffer.alloc(32);
    response[0] = 0x01; // Response type
    response[1] = toys.length; // Number of figures

    // Add first 3 figure IDs (portal typically shows 3 figures)
    for (let i = 0; i < Math.min(3, toys.length); i++) {
      const toyId = parseInt(toys[i].toyId, 16) || 0;
      response.writeUInt16LE(toyId, 2 + i * 2);
    }

    return response;
  } catch (error) {
    console.error("[LD] Error in handleLDActivate:", error);
    return createLDResponse(0xFF);
  }
}

/**
 * Handle Write command - stores figure data
 */
async function handleLDWrite(
  command: LDCommand,
  userId: number,
  portalStateId: number
): Promise<Buffer> {
  try {
    // Extract figure ID and data from command
    const figureId = command.data.readUInt16LE(0);
    const figureData = command.data.slice(2, 18);

    // In a real implementation, this would write figure data to the database
    console.log(`[LD] Writing figure 0x${figureId.toString(16)}`);

    return createLDResponse(0x01); // Success
  } catch (error) {
    console.error("[LD] Error in handleLDWrite:", error);
    return createLDResponse(0xFF);
  }
}

/**
 * Handle Read command - retrieves figure data
 */
async function handleLDRead(
  command: LDCommand,
  userId: number,
  portalStateId: number
): Promise<Buffer> {
  try {
    const figureId = command.data.readUInt16LE(0);
    const toys = await getUserToys(userId, "lego_dimensions");

    // Find toy by ID
    const toy = toys.find((t) => parseInt(t.toyId, 16) === figureId);

    if (!toy) {
      return createLDResponse(0xFF); // Not found
    }

    // Get toy upgrades
    const upgrades = await getToyUpgrades(toy.id);

    // Create response with figure data
    const response = Buffer.alloc(32);
    response[0] = 0x03; // Response type
    response.writeUInt16LE(figureId, 1);

    // Add upgrade data
    let offset = 3;
    for (const upgrade of upgrades.slice(0, 10)) {
      if (offset + 2 > 32) break;
      const key = parseInt(upgrade.upgradeKey || "0", 16) || 0;
      const value = parseInt(upgrade.upgradeValue || "0", 16) || 0;
      response[offset++] = key;
      response[offset++] = value;
    }

    return response;
  } catch (error) {
    console.error("[LD] Error in handleLDRead:", error);
    return createLDResponse(0xFF);
  }
}

/**
 * Handle Status command - returns portal status
 */
async function handleLDStatus(
  command: LDCommand,
  userId: number,
  portalStateId: number
): Promise<Buffer> {
  try {
    const toys = await getUserToys(userId, "lego_dimensions");

    const response = Buffer.alloc(32);
    response[0] = 0x04; // Response type
    response[1] = toys.length; // Number of available figures
    response[2] = 0x01; // Portal active

    return response;
  } catch (error) {
    console.error("[LD] Error in handleLDStatus:", error);
    return createLDResponse(0xFF);
  }
}

/**
 * Send Lego Dimensions response to portal
 */
export async function sendLDResponse(response: Buffer): Promise<boolean> {
  const emulator = getUSBEmulator();
  return await emulator.sendReport(DEVICE_INDEX, response);
}

/**
 * Initialize Lego Dimensions portal
 */
export async function initializeLDPortal(): Promise<boolean> {
  const emulator = getUSBEmulator();

  if (!emulator.isDeviceReady(DEVICE_INDEX)) {
    console.error("[LD] /dev/hidg0 not available");
    return false;
  }

  console.log("[LD] Lego Dimensions portal initialized");
  return true;
}
