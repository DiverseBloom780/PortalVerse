#!/bin/bash

# Multi-Platform Toy Pad Emulator - Raspberry Pi Zero Installation Script
# This script automates the complete setup process

set -e

echo "================================================"
echo "Toy Pad Emulator - Raspberry Pi Zero Setup"
echo "================================================"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "ERROR: This script must be run as root (use sudo)"
   exit 1
fi

# Detect Raspberry Pi model
PI_MODEL=$(grep "^Model" /proc/device-tree/model 2>/dev/null || echo "Unknown")
echo "Detected Raspberry Pi: $PI_MODEL"
echo ""

# Step 1: Update system
echo "[1/7] Updating system packages..."
apt-get update
apt-get upgrade -y

# Step 2: Install dependencies
echo "[2/7] Installing required packages..."
apt-get install -y \
    git \
    curl \
    build-essential \
    python3-dev \
    libusb-1.0-0-dev \
    libudev-dev \
    hwdata \
    sqlite3 \
    libsqlite3-dev

# Step 3: Install Node.js (if not already installed)
echo "[3/7] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    NODE_VERSION=$(node -v)
    echo "Node.js already installed: $NODE_VERSION"
fi

# Step 4: Install pnpm
echo "[4/7] Installing pnpm..."
npm install -g pnpm@latest

# Step 5: Load USB gadget modules
echo "[5/7] Loading USB gadget kernel modules..."
modprobe libcomposite
modprobe usb_f_hid
modprobe usb_gadget_configfs

# Add to /etc/modules for persistence
for module in libcomposite usb_f_hid usb_gadget_configfs; do
    if ! grep -q "^$module$" /etc/modules; then
        echo "$module" >> /etc/modules
    fi
done

# Step 6: Install systemd services
echo "[6/7] Installing systemd services..."
cp usb-gadget-setup.sh /usr/local/bin/toypad-usb-gadget-setup.sh
chmod +x /usr/local/bin/toypad-usb-gadget-setup.sh

cp toypad-usb-gadget.service /etc/systemd/system/
cp toypad-emulator.service /etc/systemd/system/

systemctl daemon-reload
systemctl enable toypad-usb-gadget.service
systemctl enable toypad-emulator.service

# Step 7: Create application directory
echo "[7/7] Setting up application directory..."
APP_DIR="/home/pi/multi_toy_pad_emulator"
if [ ! -d "$APP_DIR" ]; then
    mkdir -p "$APP_DIR"
    chown pi:pi "$APP_DIR"
fi

echo ""
echo "================================================"
echo "Installation Complete!"
echo "================================================"
echo ""
echo "IMPORTANT: You must now update your boot configuration:"
echo ""
echo "1. Edit /boot/firmware/config.txt:"
echo "   sudo nano /boot/firmware/config.txt"
echo ""
echo "2. Add these lines at the end of the file:"
echo ""
cat setup/config.txt.additions
echo ""
echo "3. Save the file (Ctrl+O, Enter, Ctrl+X)"
echo ""
echo "4. Reboot the Raspberry Pi:"
echo "   sudo reboot"
echo ""
echo "5. After reboot, verify USB gadget setup:"
echo "   ls -la /dev/hidg*"
echo ""
echo "You should see: /dev/hidg0, /dev/hidg1, /dev/hidg2"
echo ""
echo "6. To start the emulator:"
echo "   sudo systemctl start toypad-emulator.service"
echo ""
echo "7. To check status:"
echo "   sudo systemctl status toypad-emulator.service"
echo "   sudo journalctl -u toypad-emulator.service -f"
echo ""
