import * as fs from "fs";

/**
 * USB HID Gadget Emulator
 * Handles communication with emulated USB HID devices (/dev/hidg*)
 */

export interface HIDReport {
  data: Buffer;
  length: number;
}

export class USBHIDEmulator {
  private hidDevices: Map<number, string> = new Map();
  private deviceHandles: Map<number, number> = new Map();

  constructor() {
    // Map device indices to /dev/hidg* paths
    this.hidDevices.set(0, "/dev/hidg0"); // Lego Dimensions
    this.hidDevices.set(1, "/dev/hidg1"); // Skylanders
    this.hidDevices.set(2, "/dev/hidg2"); // Disney Infinity
  }

  /**
   * Initialize USB gadget devices
   * Checks if /dev/hidg* files exist and are accessible
   */
  async initialize(): Promise<boolean> {
    console.log("[USB] Initializing HID gadget devices...");

    const devices = Array.from(this.hidDevices.entries());
    for (let i = 0; i < devices.length; i++) {
      const [index, devicePath] = devices[i];
      try {
        // Check if device file exists
        if (!fs.existsSync(devicePath)) {
          console.warn(
            `[USB] Device ${devicePath} not found. Make sure dtoverlay=dwc2 is in /boot/firmware/config.txt`
          );
          continue;
        }

        // Try to open the device
        const fd = fs.openSync(devicePath, "w");
        this.deviceHandles.set(index, fd);
        console.log(`[USB] ✓ Initialized ${devicePath}`);
      } catch (error) {
        console.error(`[USB] Failed to initialize ${devicePath}:`, error);
      }
    }

    const initialized = this.deviceHandles.size > 0;
    if (!initialized) {
      console.error(
        "[USB] No HID devices initialized. Portal emulation will not work."
      );
    }
    return initialized;
  }

  /**
   * Send HID report to device
   */
  async sendReport(deviceIndex: number, report: Buffer): Promise<boolean> {
    const fd = this.deviceHandles.get(deviceIndex);
    if (fd === undefined) {
      console.warn(
        `[USB] Device ${deviceIndex} not initialized, cannot send report`
      );
      return false;
    }

    try {
      fs.writeSync(fd, report);
      return true;
    } catch (error) {
      console.error(`[USB] Failed to send report to device ${deviceIndex}:`, error);
      return false;
    }
  }

  /**
   * Receive HID report from device
   * Note: This is a simplified implementation. Real implementation would use
   * non-blocking I/O or interrupt handlers
   */
  async receiveReport(deviceIndex: number): Promise<Buffer | null> {
    const devicePath = this.hidDevices.get(deviceIndex);
    if (!devicePath) {
      return null;
    }

    try {
      // In a real implementation, this would use interrupt transfers
      // For now, we'll return null as reports are typically sent TO the device
      return null;
    } catch (error) {
      console.error(
        `[USB] Failed to receive report from device ${deviceIndex}:`,
        error
      );
      return null;
    }
  }

  /**
   * Close all device handles
   */
  async shutdown(): Promise<void> {
    console.log("[USB] Shutting down HID gadget devices...");

    const handles = Array.from(this.deviceHandles.entries());
    for (let i = 0; i < handles.length; i++) {
      const [index, fd] = handles[i];
      try {
        fs.closeSync(fd);
        console.log(`[USB] Closed device ${index}`);
      } catch (error) {
        console.error(`[USB] Error closing device ${index}:`, error);
      }
    }

    this.deviceHandles.clear();
  }

  /**
   * Check if device is initialized
   */
  isDeviceReady(deviceIndex: number): boolean {
    return this.deviceHandles.has(deviceIndex);
  }

  /**
   * Get status of all devices
   */
  getStatus(): Record<string, boolean> {
    return {
      legoDimensions: this.isDeviceReady(0),
      skylanders: this.isDeviceReady(1),
      disneyInfinity: this.isDeviceReady(2),
    };
  }
}

// Singleton instance
let emulator: USBHIDEmulator | null = null;

export function getUSBEmulator(): USBHIDEmulator {
  if (!emulator) {
    emulator = new USBHIDEmulator();
  }
  return emulator;
}

export async function initializeUSBEmulator(): Promise<boolean> {
  const emulator = getUSBEmulator();
  return await emulator.initialize();
}
