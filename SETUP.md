# Toy Pad Emulator - Raspberry Pi Zero Setup Guide

## Prerequisites

- Raspberry Pi Zero W (or Pi 4B with USB splitter)
- Raspberry Pi OS (Legacy, 32-bit, Bullseye) - **IMPORTANT: Must be Bullseye, not Bookworm**
- 2GB+ Micro SD card
- USB Type-A to Micro-USB cable (for data, not just power)
- Network connection (WiFi or Ethernet)
- SSH access to the Pi

## Step 1: Flash Raspberry Pi OS

1. Download [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
2. Insert SD card into your computer
3. Open Raspberry Pi Imager
4. Select **Raspberry Pi Zero W** as device
5. Select **Raspberry Pi OS (Legacy, 32-bit) - Bullseye** as OS
6. Click **Settings** (gear icon):
   - Set hostname: `toypad-pi`
   - Enable SSH (use password authentication)
   - Set username: `pi` and password
   - Configure WiFi (SSID and password)
   - Set locale and timezone
7. Click **Write** and wait for completion

## Step 2: Boot and Connect

1. Insert SD card into Raspberry Pi
2. Power on the Pi
3. Wait 2-3 minutes for first boot
4. Find the Pi's IP address:
   ```bash
   # On your computer, use an IP scanner or:
   ping toypad-pi.local
   ```
5. SSH into the Pi:
   ```bash
   ssh pi@toypad-pi.local
   # or
   ssh pi@<pi-ip-address>
   ```

## Step 3: Update Boot Configuration (CRITICAL)

This step is essential to create the `/dev/hidg*` device files.

1. Edit the boot configuration:
   ```bash
   sudo nano /boot/firmware/config.txt
   ```

2. Scroll to the bottom of the file

3. Add these lines:
   ```ini
   # Enable USB OTG (On-The-Go) mode
   [all]
   dtoverlay=dwc2
   
   # For Compute Module 5 specifically
   [cm5]
   dtoverlay=dwc2,dr_mode=peripheral
   ```

4. Save the file:
   - Press `Ctrl+O`
   - Press `Enter`
   - Press `Ctrl+X`

5. Reboot the Pi:
   ```bash
   sudo reboot
   ```

6. Wait for the Pi to restart and reconnect via SSH

## Step 4: Verify USB Gadget Setup

After reboot, check if the HID device files were created:

```bash
ls -la /dev/hidg*
```

You should see:
```
crw-rw---- 1 root root 242, 0 Nov 15 10:30 /dev/hidg0
crw-rw---- 1 root root 242, 1 Nov 15 10:30 /dev/hidg1
crw-rw---- 1 root root 242, 2 Nov 15 10:30 /dev/hidg2
```

If you don't see these files, the USB gadget setup failed. Check:
- Is `dtoverlay=dwc2` in config.txt?
- Did you reboot after editing config.txt?
- Are you using Bullseye (not Bookworm)?

## Step 5: Install Dependencies

```bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y \
    git \
    curl \
    build-essential \
    python3-dev \
    libusb-1.0-0-dev \
    libudev-dev \
    hwdata
```

## Step 6: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node -v
npm -v
```

## Step 7: Install pnpm

```bash
npm install -g pnpm@latest

# Verify installation
pnpm -v
```

## Step 8: Load USB Gadget Kernel Modules

```bash
sudo modprobe libcomposite
sudo modprobe usb_f_hid
sudo modprobe usb_gadget_configfs

# Make persistent across reboots
echo "libcomposite" | sudo tee -a /etc/modules
echo "usb_f_hid" | sudo tee -a /etc/modules
echo "usb_gadget_configfs" | sudo tee -a /etc/modules
```

## Step 9: Clone and Setup Project

```bash
cd ~
git clone https://github.com/yourusername/multi_toy_pad_emulator.git
cd multi_toy_pad_emulator

# Install dependencies
pnpm install

# Push database schema
pnpm db:push
```

## Step 10: Create systemd Service (Optional but Recommended)

This allows the emulator to start automatically on boot.

```bash
sudo cp setup/toypad-emulator.service /etc/systemd/system/
sudo cp setup/toypad-usb-gadget.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable toypad-emulator.service
sudo systemctl enable toypad-usb-gadget.service
```

## Step 11: Start the Emulator

### Option A: Manual Start
```bash
cd ~/multi_toy_pad_emulator
pnpm start
```

### Option B: Using systemd (if service installed)
```bash
sudo systemctl start toypad-emulator.service
sudo systemctl status toypad-emulator.service

# View logs
sudo journalctl -u toypad-emulator.service -f
```

## Step 12: Access the Web Interface

From your PC/laptop/tablet on the same network:

1. Open a web browser
2. Navigate to: `http://toypad-pi.local:3000`
   - Or use the IP address: `http://<pi-ip>:3000`
3. You should see the Toy Pad Emulator web interface

## Troubleshooting

### /dev/hidg* files don't exist

**Problem**: After reboot, `ls /dev/hidg*` shows no files

**Solutions**:
1. Verify `dtoverlay=dwc2` is in `/boot/firmware/config.txt`
2. Check you're using Bullseye (not Bookworm):
   ```bash
   cat /etc/os-release | grep VERSION
   ```
3. Try manual gadget setup:
   ```bash
   sudo bash setup/usb-gadget-setup.sh
   ```

### Server won't start - "Cannot find module"

**Problem**: `pnpm start` fails with module errors

**Solution**:
```bash
cd ~/multi_toy_pad_emulator
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm db:push
```

### Can't connect to web interface

**Problem**: Browser shows "Connection refused" or "Cannot reach server"

**Solutions**:
1. Verify server is running:
   ```bash
   ps aux | grep node
   ```
2. Check firewall isn't blocking port 3000:
   ```bash
   sudo ufw allow 3000
   ```
3. Verify Pi is on the network:
   ```bash
   hostname -I
   ```
4. Try accessing via IP instead of hostname:
   ```
   http://<pi-ip>:3000
   ```

### Database errors

**Problem**: "Cannot connect to database" errors

**Solution**:
```bash
# Reinitialize database
pnpm db:push --force

# Check database connection
sqlite3 ~/multi_toy_pad_emulator/data.db ".tables"
```

### USB gadget not working with game console

**Problem**: Game console doesn't recognize the emulated portal

**Solutions**:
1. Verify HID devices exist:
   ```bash
   ls -la /dev/hidg*
   ```
2. Check permissions:
   ```bash
   chmod 666 /dev/hidg*
   ```
3. Restart the emulator:
   ```bash
   sudo systemctl restart toypad-emulator.service
   ```
4. Check server logs:
   ```bash
   sudo journalctl -u toypad-emulator.service -f
   ```

## Next Steps

1. **Access the web interface** at `http://toypad-pi.local:3000`
2. **Add virtual toys** to your inventory
3. **Connect your game console** to the Pi via USB
4. **Place toys** on the emulated portal in the web interface
5. **Play your games** with the emulated toys!

## Additional Resources

- [Raspberry Pi Documentation](https://www.raspberrypi.com/documentation/)
- [Linux USB Gadget API](https://www.kernel.org/doc/html/latest/usb/gadget.html)
- [LD-ToyPad-Emulator](https://github.com/Berny23/LD-ToyPad-Emulator)

## Support

For issues or questions:
1. Check the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide
2. Review server logs: `sudo journalctl -u toypad-emulator.service -f`
3. Check the [GitHub Issues](https://github.com/yourusername/multi_toy_pad_emulator/issues)

