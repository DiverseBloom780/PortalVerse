# WiFi Setup Guide for Raspberry Pi Zero W

Since the Raspberry Pi Zero does not have an Ethernet port, WiFi is the primary network connection method. This guide covers setting up WiFi connectivity for PortalVerse.

## Prerequisites

- Raspberry Pi Zero W (with built-in WiFi)
- Micro SD card with Raspberry Pi OS Bullseye (32-bit)
- WiFi network available
- Another device to access the web interface (PC, laptop, tablet)

## Step 1: Enable SSH (Headless Setup)

If you're setting up without a display:

1. **Flash Raspberry Pi OS using Raspberry Pi Imager**
   - Download [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
   - Select "Raspberry Pi OS (Legacy, 32-bit) - Bullseye"
   - Click the gear icon to open advanced options
   - Enable SSH and configure WiFi

2. **Or manually create configuration files:**
   
   After flashing, before ejecting the SD card, create two files in the boot partition:

   **File: `ssh`** (empty file, no extension)
   ```
   (empty)
   ```

   **File: `wpa_supplicant.conf`**
   ```ini
   country=US
   ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
   update_config=1

   network={
       ssid="YOUR_WIFI_SSID"
       psk="YOUR_WIFI_PASSWORD"
       key_mgmt=WPA-PSK
   }
   ```

   Replace `YOUR_WIFI_SSID` and `YOUR_WIFI_PASSWORD` with your actual WiFi credentials.

## Step 2: Boot and Connect

1. Insert the SD card into Raspberry Pi Zero
2. Power on the device
3. Wait 30-60 seconds for WiFi to connect
4. On your computer, open a terminal and find the Pi's IP address:

   ```bash
   # On Linux/Mac
   ping raspberrypi.local
   
   # Or use your router's admin panel to find the IP
   ```

## Step 3: SSH into the Pi

```bash
ssh pi@raspberrypi.local
# or
ssh pi@<pi-ip-address>

# Default password is: raspberry
```

## Step 4: Update System and Install Dependencies

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl wget nodejs npm
```

## Step 5: Configure Boot Settings for USB Gadget

```bash
sudo nano /boot/firmware/config.txt
```

Add at the end of the file:

```ini
[all]
dtoverlay=dwc2

[cm5]
dtoverlay=dwc2,dr_mode=peripheral
```

Save (Ctrl+X, then Y, then Enter) and reboot:

```bash
sudo reboot
```

## Step 6: Install PortalVerse

```bash
cd ~
git clone https://github.com/yourusername/PortalVerse.git
cd PortalVerse
npm install -g pnpm
pnpm install
pnpm db:push
```

## Step 7: Start PortalVerse

```bash
pnpm start
```

The server will start on port 3000.

## Step 8: Access from Another Device

On your PC, laptop, or tablet connected to the same WiFi network:

```
http://raspberrypi.local:3000
```

Or use the Pi's IP address:

```
http://<pi-ip-address>:3000
```

## Troubleshooting WiFi Connection

### WiFi not connecting

1. **Check WiFi status:**
   ```bash
   iwconfig
   ```

2. **Restart WiFi:**
   ```bash
   sudo systemctl restart wpa_supplicant
   ```

3. **View WiFi logs:**
   ```bash
   sudo journalctl -u wpa_supplicant -f
   ```

### Can't find Pi on network

1. **Check if Pi is online:**
   ```bash
   ping raspberrypi.local
   ```

2. **Find IP address:**
   ```bash
   sudo arp-scan --localnet | grep -i "Raspberry"
   ```

3. **Check WiFi connection:**
   ```bash
   nmcli device wifi list
   ```

### Slow WiFi performance

- Move Pi closer to WiFi router
- Check for interference from other 2.4GHz devices
- Consider 5GHz WiFi if your router supports it

## Offline Operation

Once PortalVerse is running and your toys are configured:

1. **No internet required** - The system works completely offline
2. **Local network only** - Access via LAN (same WiFi network)
3. **Data persistence** - All toy data is stored locally on the Pi

## Advanced: Static IP Address

For consistent access, you can assign a static IP to your Pi:

```bash
sudo nano /etc/dhcpcd.conf
```

Add at the end:

```ini
interface wlan0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1
```

Then restart networking:

```bash
sudo systemctl restart dhcpcd
```

Now access PortalVerse at: `http://192.168.1.100:3000`

## Advanced: WiFi Hotspot Mode

If you want to create a WiFi hotspot on the Pi itself:

```bash
sudo apt install -y hostapd dnsmasq
sudo systemctl enable hostapd dnsmasq
```

Configure hostapd and dnsmasq for access point mode (advanced setup).

---

**Note:** WiFi connectivity is essential for PortalVerse to function. Ensure your Raspberry Pi Zero W has a stable WiFi connection before running the emulator.
