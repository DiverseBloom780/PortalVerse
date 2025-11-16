/**
 * Disney Infinity Base Protocol Handler
 * Handles USB HID communication for Disney Infinity bases
 * 
 * Protocol Details:
 * - Vendor ID: 0x0E6F (Mattel)
 * - Product ID: 0x0129
 * - Report Size: 32 bytes
 * - Communication: Interrupt transfers
 * - Features: NFC reader simulation, RGB LED control
 */

import { getUSBEmulator } from "../usb-emulator";
import { getUserToys, getToyUpgrades, updatePortalState } from "../db";

const DEVICE_INDEX = 2; // /dev/hidg2

export interface DisneyInfinityCommand {
  command: number;
  data: Buffer;
}

/**
 * Parse incoming Disney Infinity command
 */
export function parseDICommand(buffer: Buffer): DisneyInfinityCommand {
  return {
    command: buffer[0],
    data: buffer.slice(1),
  };
}

/**
 * Create Disney Infinity response buffer
 */
export function createDIResponse(data: Buffer | null = null): Buffer {
  const response = Buffer.alloc(32);
  if (data) {
    data.copy(response, 0);
  }
  return response;
}

/**
 * Handle Disney Infinity command
 */
export async function handleDICommand(
  command: DisneyInfinityCommand,
  userId: number,
  portalStateId: number
): Promise<Buffer> {
  const cmd = command.command;

  switch (cmd) {
    case 0x01: // NFC Query
      return await handleDINFCQuery(command, userId, portalStateId);

    case 0x02: // Figure Detection
      return await handleDIFigureDetection(command, userId, portalStateId);

    case 0x03: // LED Color
      return await handleDILEDColor(command, userId, portalStateId);

    case 0x04: // Status
      return await handleDIStatus(command, userId, portalStateId);

    default:
      console.warn(`[DI] Unknown command: 0x${cmd.toString(16)}`);
      return createDIResponse();
  }
}

/**
 * Handle NFC Query - returns figure NFC UID
 */
async function handleDINFCQuery(
  command: DisneyInfinityCommand,
  userId: number,
  portalStateId: number
): Promise<Buffer> {
  try {
    const toys = await getUserToys(userId, "disney_infinity");

    const response = Buffer.alloc(32);
    response[0] = 0x01; // NFC Query response

    if (toys.length > 0) {
      const toy = toys[0];
      const nfcData = toy.nfcData ? Buffer.from(toy.nfcData, "hex") : null;

      if (nfcData && nfcData.length >= 7) {
        // Copy NFC UID (typically 7 bytes)
        nfcData.copy(response, 1, 0, 7);
        response[8] = 0x01; // Figure detected flag
      }
    }

    return response;
  } catch (error) {
    console.error("[DI] Error in handleDINFCQuery:", error);
    return createDIResponse();
  }
}

/**
 * Handle Figure Detection - checks for figures on base
 */
async function handleDIFigureDetection(
  command: DisneyInfinityCommand,
  userId: number,
  portalStateId: number
): Promise<Buffer> {
  try {
    const toys = await getUserToys(userId, "disney_infinity");

    const response = Buffer.alloc(32);
    response[0] = 0x02; // Figure detection response
    response[1] = toys.length; // Number of figures

    // Add figure IDs
    for (let i = 0; i < Math.min(3, toys.length); i++) {
      const toyId = parseInt(toys[i].toyId, 16) || 0;
      response.writeUInt16LE(toyId, 2 + i * 2);
    }

    return response;
  } catch (error) {
    console.error("[DI] Error in handleDIFigureDetection:", error);
    return createDIResponse();
  }
}

/**
 * Handle LED Color command - sets base LED color
 */
async function handleDILEDColor(
  command: DisneyInfinityCommand,
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

    console.log(`[DI] Setting LED color to ${hexColor}`);

    // Update portal state with new LED color
    await updatePortalState(portalStateId, { ledColor: hexColor });

    const response = Buffer.alloc(32);
    response[0] = 0x03; // LED Color response

    return response;
  } catch (error) {
    console.error("[DI] Error in handleDILEDColor:", error);
    return createDIResponse();
  }
}

/**
 * Handle Status command - returns base status
 */
async function handleDIStatus(
  command: DisneyInfinityCommand,
  userId: number,
  portalStateId: number
): Promise<Buffer> {
  try {
    const toys = await getUserToys(userId, "disney_infinity");

    const response = Buffer.alloc(32);
    response[0] = 0x04; // Status response
    response[1] = toys.length; // Number of available figures
    response[2] = 0x01; // Base active

    return response;
  } catch (error) {
    console.error("[DI] Error in handleDIStatus:", error);
    return createDIResponse();
  }
}

/**
 * Send Disney Infinity response to base
 */
export async function sendDIResponse(response: Buffer): Promise<boolean> {
  const emulator = getUSBEmulator();
  return await emulator.sendReport(DEVICE_INDEX, response);
}

/**
 * Initialize Disney Infinity base
 */
export async function initializeDIBase(): Promise<boolean> {
  const emulator = getUSBEmulator();

  if (!emulator.isDeviceReady(DEVICE_INDEX)) {
    console.error("[DI] /dev/hidg2 not available");
    return false;
  }

  console.log("[DI] Disney Infinity base initialized");
  return true;
}
