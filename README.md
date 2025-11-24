# PortalVerse

**PortalVerse** is a comprehensive offline Toy Pad emulator for Raspberry Pi Zero W that supports three major toys-to-life gaming platforms:

- **Lego Dimensions** (7-slot portal: 3 left, 1 center, 3 right)
- **Skylanders** (4-slot portal with version support)
- **Disney Infinity** (3-slot portal in triangle formation)

Run all three portal emulators simultaneously on a single Raspberry Pi Zero W, with a web interface accessible from any device on your local WiFi network.

## Features

✅ **Multi-Platform Support** - Emulate Lego Dimensions, Skylanders, and Disney Infinity portals simultaneously

✅ **Offline Operation** - Works completely offline after initial setup, no internet required

✅ **WiFi Connectivity** - Raspberry Pi Zero W connects via WiFi (no Ethernet needed)

✅ **Headless Backend** - Pi runs without display, controlled via web interface from another device

✅ **Virtual Toy Management** - Browse character galleries with images and add toys to your collection

✅ **Portal-Specific Layouts** - Correct slot configurations for each platform

✅ **Real-time Portal Control** - Monitor and control portal LED colors and figure placement

✅ **USB HID Emulation** - Emulates authentic USB HID devices that game consoles recognize

✅ **Database Persistence** - All toy data and upgrades saved locally

## System Architecture

### Raspberry Pi Zero W (Headless)
- Node.js backend server on port 3000
- USB HID gadget emulation for all three platforms
- MySQL/TiDB database with Drizzle ORM
- Accessible via WiFi LAN

### Remote Device (PC/Laptop/Tablet)
- React web interface
- Connects to Pi via WiFi
- No display needed on Pi

## Quick Start

### Prerequisites

- Raspberry Pi Zero W (with built-in WiFi)
- Micro SD card (2GB+)
- Raspberry Pi OS Bullseye (32-bit)
- WiFi network
- Another device to access web interface

### Installation

1. **Flash Raspberry Pi OS Bullseye (32-bit)**
   - Use [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
   - Enable SSH and configure WiFi in advanced options

2. **SSH into the Pi**
   ```bash
   ssh pi@raspberrypi.local
   # Default password: raspberry
   ```

3. **Update Boot Configuration**
   ```bash
   sudo nano /boot/firmware/config.txt
   ```
   Add at the end:
   ```ini
   [all]
   dtoverlay=dwc2
   
   [cm5]
   dtoverlay=dwc2,dr_mode=peripheral
   ```
   Save and reboot: `sudo reboot`

4. **Install PortalVerse**
   ```bash
   cd ~
   git clone https://github.com/DiverseBloom780/PortalVerse.git
   cd PortalVerse
   sudo npm install -g pnpm
   pnpm install
   pnpm db:push
   ```

5. **Start the Server**
   ```bash
   pnpm start
   ```

6. **Access Web Interface**
   From another device on the same WiFi:
   ```
   http://raspberrypi.local:3000
   ```

## Portal Specifications

### Lego Dimensions
- **Slots:** 7 (3 left, 1 center, 3 right)
- **USB VID/PID:** 0x0E6F / 0xF446
- **Report Size:** 32 bytes
- **Supported:** Characters, Vehicles, Items

### Skylanders Portal of Power
- **Slots:** 4 (with version support)
- **USB VID/PID:** 0x1430 / 0x0150
- **Report Size:** 32 bytes
- **Versions:** Original, SWAP Force, Trap Team, SuperChargers
- **Supported:** Skylanders, Magic Items, Traps

### Disney Infinity Base
- **Slots:** 3 (triangle formation)
- **USB VID/PID:** 0x0E6F / 0x0129
- **Report Size:** 32 bytes
- **Supported:** Characters, Power Discs

## Project Structure

```
PortalVerse/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Portal UI components
│   │   └── App.tsx
│   └── public/               # Static assets
│
├── server/                    # Node.js backend
│   ├── routers/              # tRPC procedures
│   │   ├── portal.ts
│   │   ├── toys.ts
│   │   └── characters.ts
│   ├── platforms/            # Platform handlers
│   │   ├── lego-dimensions.ts
│   │   ├── skylanders.ts
│   │   └── disney-infinity.ts
│   ├── db.ts                 # Database queries
│   ├── usb-emulator.ts       # USB HID emulation
│   ├── character-database.ts # Character data
│   └── routers.ts            # Main router
│
├── drizzle/                  # Database schema
│   └── schema.ts
│
├── setup/                    # Installation scripts
│   ├── install-pi-zero.sh
│   ├── portalverse.service
│   └── config.txt.additions
│
├── docs/                     # Documentation
│   ├── WIFI_SETUP.md
│   ├── SETUP.md
│   └── PROTOCOLS.md
│
└── README.md
```

## Documentation

- **[WIFI_SETUP.md](docs/WIFI_SETUP.md)** - WiFi configuration guide
- **[SETUP.md](setup/SETUP.md)** - Detailed installation instructions
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and protocols

## Features Implemented

### Backend
- ✅ USB HID gadget emulation for all three platforms
- ✅ Character database with 40+ characters across platforms
- ✅ tRPC API for portal and toy management
- ✅ Database schema with portal states, toys, upgrades, and placements
- ✅ Platform-specific command handlers

### Frontend
- ✅ Home page with feature overview
- ✅ Portal Manager with LED color control
- ✅ Toy Inventory with character image galleries
- ✅ Lego Dimensions 7-slot portal UI
- ✅ Skylanders 4-slot portal UI
- ✅ Disney Infinity 3-slot portal UI
- ✅ Real-time toy search and filtering

### Installation & Setup
- ✅ Automated installation script
- ✅ Systemd service configuration
- ✅ USB gadget boot configuration
- ✅ WiFi setup documentation
- ✅ Database initialization

## Troubleshooting

### USB Gadget Devices Not Found

**Problem:** `/dev/hidg*` files don't exist

**Solution:**
1. Verify `dtoverlay=dwc2` is in `/boot/firmware/config.txt`
2. Ensure you're using Bullseye (not Bookworm)
3. Reboot: `sudo reboot`
4. Check: `ls -la /dev/hidg*`

### WiFi Connection Issues

See [WIFI_SETUP.md](docs/WIFI_SETUP.md) for detailed WiFi troubleshooting.

### Server Won't Start

```bash
# Check logs
sudo journalctl -u portalverse -f

# Restart service
sudo systemctl restart portalverse

# Verify dependencies
pnpm install
pnpm db:push
```

## Database Schema

**Users** - Authentication and user management

**Portal States** - Current state of each emulated portal (LED color, active figures)

**Virtual Toys** - All emulated toys/characters/figures with metadata

**Toy Upgrades** - Tracks upgrades and modifications for toys

**Toy Placements** - History of figure placements on portals

## Character Database

Includes 40+ characters across all three platforms:

- **Lego Dimensions:** Wyldstyle, Batman, Gandalf, Unikitty, Emmet, Batmobile, Delorean
- **Skylanders:** Spyro, Trigger Happy, Stealth Elf, Bash, Prism Break, and items
- **Disney Infinity:** Mickey Mouse, Minnie Mouse, Buzz Lightyear, Woody, Jack Sparrow, Power Discs

All characters include images for visual selection in the web interface.

## Configuration

### Environment Variables

```bash
DATABASE_URL=mysql://user:password@localhost/portalverse
VITE_APP_TITLE=PortalVerse
VITE_APP_LOGO=/logo.svg
NODE_ENV=production
```

### Portal Settings

Configure via web interface:
- Platform selection
- LED colors
- Figure placement
- Upgrade management

## Offline Operation

Once PortalVerse is running and toys are configured:

- **No internet required** - System works completely offline
- **Local network only** - Access via WiFi LAN
- **Data persistence** - All toy data stored locally on Pi

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## References

- [LD-ToyPad-Emulator](https://github.com/Berny23/LD-ToyPad-Emulator)
- [Skylanders Reverse Engineering](https://marijnkneppers.dev/posts/reverse-engineering-skylanders-toys-to-life-mechanics/)
- [Disney Infinity USB Library](https://github.com/techbelly/di-usb-library)
- [Linux USB Gadget API](https://www.kernel.org/doc/html/latest/usb/gadget.html)

## Support

For issues, questions, or suggestions:

1. Check [WIFI_SETUP.md](docs/WIFI_SETUP.md) and [SETUP.md](setup/SETUP.md)
2. Review server logs: `sudo journalctl -u portalverse -f`
3. Open an [Issue](https://github.com/yourusername/PortalVerse/issues)

---

**PortalVerse** - Bring your toy collections to life, offline and on your terms.
