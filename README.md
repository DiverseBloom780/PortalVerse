# PortalVerse

**PortalVerse** is a comprehensive offline Toy Pad emulator for Raspberry Pi Zero that supports three major toys-to-life gaming platforms:

- **Lego Dimensions**
- **Skylanders**
- **Disney Infinity**

Run all three portal emulators simultaneously on a single Raspberry Pi Zero, with a web interface accessible from any device on your local network.

## Features

✅ **Multi-Platform Support** - Emulate Lego Dimensions, Skylanders, and Disney Infinity portals simultaneously

✅ **Offline Operation** - Works completely offline after initial setup, no internet required

✅ **Headless Backend** - Raspberry Pi runs without display, controlled via web interface from another device

✅ **Virtual Toy Management** - Add, edit, and manage virtual toys/characters with upgrade tracking

✅ **Real-time Portal Control** - Monitor and control portal LED colors and figure placement in real-time

✅ **USB HID Emulation** - Emulates authentic USB HID devices that game consoles recognize

✅ **Database Persistence** - All toy data and upgrades saved to local database

## Quick Start

### Hardware Requirements

- Raspberry Pi Zero W (or Pi 4B with USB splitter)
- Micro SD card (2GB+)
- USB Type-A to Micro-USB cable
- Network connection (WiFi or Ethernet)

### Installation

1. **Flash Raspberry Pi OS (Legacy, 32-bit - Bullseye)**
   - Use [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
   - Enable SSH and configure WiFi

2. **Update Boot Configuration**
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

3. **Install PortalVerse**
   ```bash
   cd ~
   git clone https://github.com/yourusername/PortalVerse.git
   cd PortalVerse
   pnpm install
   pnpm db:push
   ```

4. **Start the Server**
   ```bash
   pnpm start
   ```

5. **Access Web Interface**
   Open browser and navigate to: `http://toypad-pi.local:3000`

## Architecture

### Backend (Raspberry Pi Zero)
- Node.js 11+ with Express 4 and tRPC 11
- USB HID Gadget emulation via `/dev/hidg0`, `/dev/hidg1`, `/dev/hidg2`
- MySQL/TiDB database with Drizzle ORM
- Character data provider for toy lookups

### Frontend (Remote Device)
- React 19 with Vite
- Tailwind CSS 4 for responsive design
- shadcn/ui components
- LAN-only access (no internet required)

## Project Structure

```
PortalVerse/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   └── App.tsx
│   └── public/               # Static assets
│
├── server/                    # Node.js backend
│   ├── routers.ts            # tRPC procedures
│   ├── db.ts                 # Database queries
│   ├── usb-emulator.ts       # USB HID emulation
│   ├── platforms/            # Platform handlers
│   │   ├── lego-dimensions.ts
│   │   ├── skylanders.ts
│   │   └── disney-infinity.ts
│   └── _core/                # Framework code
│
├── drizzle/                  # Database schema
│   └── schema.ts
│
├── setup/                    # Installation scripts
│   ├── install-pi-zero.sh
│   ├── usb-gadget-setup.sh
│   ├── config.txt.additions
│   ├── toypad-emulator.service
│   └── toypad-usb-gadget.service
│
└── docs/                     # Documentation
    ├── SETUP.md
    ├── USAGE.md
    ├── PROTOCOLS.md
    └── TROUBLESHOOTING.md
```

## USB Device Specifications

| Platform | Vendor ID | Product ID | Report Size |
|----------|-----------|-----------|-------------|
| Lego Dimensions | 0x0E6F | 0xF446 | 32 bytes |
| Skylanders | 0x1430 | 0x0150 | 32 bytes |
| Disney Infinity | 0x0E6F | 0x0129 | 32 bytes |

## Database Schema

**Users** - Authentication and user management

**Portal States** - Current state of each emulated portal (LED color, active figures, etc.)

**Virtual Toys** - All emulated toys/characters/figures with platform-specific metadata

**Toy Upgrades** - Tracks upgrades and modifications for toys

**Toy Placements** - History of when figures are placed/removed from portal

## Configuration

### Environment Variables

```bash
DATABASE_URL=mysql://user:password@localhost/portalverse
VITE_APP_TITLE=PortalVerse
VITE_APP_LOGO=/logo.svg
```

### Portal Settings

Configure via web interface:
- Platform selection (Lego Dimensions, Skylanders, Disney Infinity)
- LED colors
- Figure placement
- Upgrade management

## Documentation

- **[SETUP.md](SETUP.md)** - Detailed installation guide for Raspberry Pi Zero
- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Technical architecture and implementation details
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and protocol specifications
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions

## Troubleshooting

### /dev/hidg* files don't exist

**Problem**: USB gadget device files not created after boot

**Solution**:
1. Verify `dtoverlay=dwc2` is in `/boot/firmware/config.txt`
2. Ensure you're using Bullseye (not Bookworm)
3. Reboot the Pi: `sudo reboot`
4. Check: `ls -la /dev/hidg*`

### Server won't start

**Problem**: Module not found or database connection errors

**Solution**:
```bash
cd ~/PortalVerse
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm db:push
pnpm start
```

### Can't connect to web interface

**Problem**: Browser shows "Connection refused"

**Solution**:
1. Verify server is running: `ps aux | grep node`
2. Check firewall: `sudo ufw allow 3000`
3. Try IP address instead of hostname: `http://<pi-ip>:3000`

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
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review server logs: `sudo journalctl -u toypad-emulator.service -f`
3. Open an [Issue](https://github.com/yourusername/PortalVerse/issues)

---

**PortalVerse** - Bring your toy collections to life, offline and on your terms.
