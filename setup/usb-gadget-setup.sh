#!/bin/bash

# USB Gadget Setup Script for Multi-Platform Toy Pad Emulator
# This script configures the Raspberry Pi to emulate USB HID devices
# for Lego Dimensions, Skylanders, and Disney Infinity portals

set -e

echo "================================================"
echo "USB Gadget Setup for Toy Pad Emulator"
echo "================================================"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root (use sudo)"
   exit 1
fi

# Load required kernel modules
echo "[1/4] Loading USB gadget kernel modules..."
modprobe libcomposite
modprobe usb_f_hid
modprobe usb_gadget_configfs

# Enable modules at boot
echo "libcomposite" >> /etc/modules
echo "usb_f_hid" >> /etc/modules
echo "usb_gadget_configfs" >> /etc/modules

# Create gadget configuration directory
echo "[2/4] Setting up USB gadget configuration..."
GADGET_DIR="/sys/kernel/config/usb_gadget/toypad_emulator"

# Remove existing gadget if it exists
if [ -d "$GADGET_DIR" ]; then
    echo "Removing existing gadget configuration..."
    cd "$GADGET_DIR"
    
    # Unbind all functions
    for func in "$GADGET_DIR"/functions/*; do
        [ -d "$func" ] && rmdir "$func" 2>/dev/null || true
    done
    
    # Unbind all configurations
    for config in "$GADGET_DIR"/configs/*; do
        [ -d "$config" ] && rmdir "$config" 2>/dev/null || true
    done
    
    cd /
    rmdir "$GADGET_DIR" 2>/dev/null || true
fi

# Create new gadget
mkdir -p "$GADGET_DIR"
cd "$GADGET_DIR"

# Set USB device properties
echo "0x0e6f" > idVendor    # Mattel Vendor ID
echo "0xf446" > idProduct   # Lego Dimensions Portal (default)
echo "0x0100" > bcdDevice

# Create English locale strings
mkdir -p strings/0x409
echo "Toy Pad Emulator" > strings/0x409/manufacturer
echo "Multi-Platform Portal" > strings/0x409/product
echo "12345678" > strings/0x409/serialnumber

# Create three HID functions for the three platforms
echo "[3/4] Creating HID device functions..."

# Function 1: Lego Dimensions
mkdir -p functions/hid.usb0
echo 1 > functions/hid.usb0/protocol
echo 1 > functions/hid.usb0/subclass
echo 32 > functions/hid.usb0/report_length

# HID Report Descriptor for Lego Dimensions (generic HID)
printf '\x06\x00\xff\x09\x01\xa1\x01\x19\x01\x29\x40\x15\x00\x26\xff\x00\x75\x08\x95\x20\x81\x00\x19\x01\x29\xff\x91\x00\xc0' > functions/hid.usb0/report_desc

# Function 2: Skylanders
mkdir -p functions/hid.usb1
echo 1 > functions/hid.usb1/protocol
echo 1 > functions/hid.usb1/subclass
echo 32 > functions/hid.usb1/report_length
printf '\x06\x00\xff\x09\x01\xa1\x01\x19\x01\x29\x40\x15\x00\x26\xff\x00\x75\x08\x95\x20\x81\x00\x19\x01\x29\xff\x91\x00\xc0' > functions/hid.usb1/report_desc

# Function 3: Disney Infinity
mkdir -p functions/hid.usb2
echo 1 > functions/hid.usb2/protocol
echo 1 > functions/hid.usb2/subclass
echo 32 > functions/hid.usb2/report_length
printf '\x06\x00\xff\x09\x01\xa1\x01\x19\x01\x29\x40\x15\x00\x26\xff\x00\x75\x08\x95\x20\x81\x00\x19\x01\x29\xff\x91\x00\xc0' > functions/hid.usb2/report_desc

# Create configuration
echo "[4/4] Creating USB configuration..."
mkdir -p configs/c.1
echo 500 > configs/c.1/MaxPower

mkdir -p configs/c.1/strings/0x409
echo "Toy Pad Configuration" > configs/c.1/strings/0x409/configuration

# Link functions to configuration
ln -sf functions/hid.usb0 configs/c.1/
ln -sf functions/hid.usb1 configs/c.1/
ln -sf functions/hid.usb2 configs/c.1/

# Enable the gadget
echo "[*] Enabling USB gadget..."
UDC=$(ls /sys/class/udc | head -n 1)
if [ -z "$UDC" ]; then
    echo "ERROR: No UDC device found. Make sure dtoverlay=dwc2 is enabled in /boot/firmware/config.txt"
    exit 1
fi

echo "$UDC" > UDC

# Verify HID devices were created
echo ""
echo "Checking for HID device files..."
for i in 0 1 2; do
    if [ -e "/dev/hidg$i" ]; then
        echo "✓ /dev/hidg$i created successfully"
    else
        echo "✗ /dev/hidg$i NOT found - there may be an issue"
    fi
done

# Set permissions
chmod 666 /dev/hidg* 2>/dev/null || true

echo ""
echo "================================================"
echo "USB Gadget Setup Complete!"
echo "================================================"
echo ""
echo "HID devices are ready for emulation:"
echo "  /dev/hidg0 - Lego Dimensions Portal"
echo "  /dev/hidg1 - Skylanders Portal"
echo "  /dev/hidg2 - Disney Infinity Base"
echo ""
echo "You can now start the Toy Pad Emulator server."
echo ""

# Make this script persist across reboots by adding to rc.local or systemd
echo "To make this setup persistent, add this script to your startup."
