# Multi-Platform Toy Pad Emulator - Implementation Guide

## Project Overview

This is a comprehensive offline Toy Pad emulator for Raspberry Pi Zero that emulates three major toys-to-life gaming platforms:

- **Lego Dimensions** (Portal VID: 0x0E6F, PID: 0xF446)
- **Skylanders** (Portal VID: 0x1430, PID: 0x0150)  
- **Disney Infinity** (Portal VID: 0x0E6F, PID: 0x0129)

### Key Architecture

**Raspberry Pi Zero (Headless Backend)**
- Runs Node.js server on port 3000
- Emulates USB HID portals over `/dev/hidg0`, `/dev/hidg1`, `/dev/hidg2`
- Stores toy/character data in local database
- Provides tRPC API for web interface

**Remote Device (PC/Laptop/Tablet)**
- Runs React web interface
- Connects to Pi via LAN (http://<pi-ip>:3000)
- Manages toys, portal settings, and character data

---

## Critical Fix: USB Gadget Device File Creation

The main issue with Raspberry Pi Zero is that `/dev/hidg0`, `/dev/hidg1`, `/dev/hidg2` device files don't exist by default. This causes the error:

```
Error: ENOENT: no such file or directory, open '/dev/hidg0'
```

### Solution: Boot Configuration

Add the following to `/boot/firmware/config.txt` on the Raspberry Pi:

```ini
# Enable USB OTG (On-The-Go) mode
[all]
dtoverlay=dwc2

# For Compute Module 5 specifically
[cm5]
dtoverlay=dwc2,dr_mode=peripheral
```

After adding these lines:
1. Save the file
2. Reboot: `sudo reboot`
3. Verify HID devices exist: `ls -la /dev/hidg*`

You should see:
```
crw-rw---- 1 root root 242, 0 Nov 15 10:30 /dev/hidg0
crw-rw---- 1 root root 242, 1 Nov 15 10:30 /dev/hidg1
crw-rw---- 1 root root 242, 2 Nov 15 10:30 /dev/hidg2
```

---

## USB Device Specifications

### Lego Dimensions Portal
- **Vendor ID**: 0x0E6F (Mattel)
- **Product ID**: 0xF446
- **Interface**: HID (Human Interface Device)
- **Report Size**: 32 bytes
- **Communication**: Interrupt transfers at ~50Hz
- **Command Format**: 32-byte packets with specific command structure

### Skylanders Portal of Power
- **Vendor ID**: 0x1430 (RedOctane)
- **Product ID**: 0x0150
- **Interface**: HID (Human Interface Device)
- **Report Size**: 32 bytes
- **HID Report Descriptor**: `06 00 FF 09 01 A1 01 19 01 29 40 15 00 26 FF 00 75 08 95 20 81 00 19 01 29 FF 91 00 C0`
- **Communication**: Interrupt transfers at ~50Hz
- **Command Format**: 32-byte packets with ASCII command character as first byte

### Disney Infinity Base
- **Vendor ID**: 0x0E6F (Mattel)
- **Product ID**: 0x0129
- **Interface**: HID (Human Interface Device)
- **Report Size**: 32 bytes
- **Communication**: Interrupt transfers
- **Features**: NFC reader simulation, RGB LED control

---

## Database Schema

The project uses Drizzle ORM with MySQL/TiDB. Key tables:

### `users`
- Authentication and user management
- Manus OAuth integration

### `portal_states`
- Current state of each emulated portal
- Platform, LED color, active figures
- One per user per platform

### `virtual_toys`
- All emulated toys/characters/figures
- Platform-specific metadata
- NFC data storage

### `toy_upgrades`
- Tracks upgrades and modifications
- Skylanders weapons, Lego Dimensions vehicles, etc.

### `toy_placements`
- History of when figures are placed/removed
- Tracks portal activity

---

## Implementation Phases

### Phase 1: Core Infrastructure ✓
- [x] Database schema created
- [ ] USB gadget initialization module
- [ ] HID report descriptor handling
- [ ] Character data provider

### Phase 2: Lego Dimensions Support
- [ ] Protocol implementation
- [ ] Command processing
- [ ] Character data lookup
- [ ] LED control

### Phase 3: Skylanders Support
- [ ] Protocol implementation
- [ ] Figure data management
- [ ] NFC data simulation
- [ ] Upgrade tracking

### Phase 4: Disney Infinity Support
- [ ] Protocol implementation
- [ ] NFC UID simulation
- [ ] Figure detection
- [ ] LED color management

### Phase 5: Web Interface
- [ ] Portal manager UI
- [ ] Toy inventory interface
- [ ] Real-time status display
- [ ] Settings management

### Phase 6: Pi Setup & Automation
- [ ] Installation scripts
- [ ] systemd service files
- [ ] Automatic startup
- [ ] Network discovery

### Phase 7: Documentation
- [ ] Setup guide
- [ ] User manual
- [ ] Protocol documentation
- [ ] Troubleshooting guide

---

## File Structure

```
multi_toy_pad_emulator/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── PortalManager.tsx
│   │   │   ├── ToyInventory.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/
│   │   └── App.tsx
│   └── public/
│
├── server/                    # Node.js backend
│   ├── routers.ts            # tRPC procedures
│   ├── db.ts                 # Database queries
│   ├── platforms/
│   │   ├── lego-dimensions.ts
│   │   ├── skylanders.ts
│   │   └── disney-infinity.ts
│   ├── services/
│   │   ├── portal-manager.ts
│   │   ├── toy-manager.ts
│   │   └── usb-emulator.ts
│   └── _core/
│
├── drizzle/
│   └── schema.ts             # Database tables
│
├── setup/
│   ├── install-pi-zero.sh
│   ├── usb-gadget-setup.sh
│   ├── config.txt.additions
│   ├── toypad-emulator.service
│   └── toypad-usb-gadget.service
│
└── docs/
    ├── SETUP.md
    ├── USAGE.md
    ├── PROTOCOLS.md
    └── TROUBLESHOOTING.md
```

---

## Next Steps

1. **Extend database schema** with portal_states, virtual_toys, toy_upgrades, toy_placements tables
2. **Create USB gadget initialization module** to set up /dev/hidg* devices
3. **Implement character data provider** for toy lookup and serialization
4. **Build platform-specific handlers** for each toys-to-life system
5. **Create web interface** for managing toys and portals
6. **Write installation scripts** for Raspberry Pi Zero
7. **Create comprehensive documentation**

---

## Key Technologies

- **Backend**: Node.js 11+, Express 4, tRPC 11
- **Database**: Drizzle ORM, MySQL/TiDB or SQLite
- **Frontend**: React 19, Tailwind CSS 4, shadcn/ui
- **USB**: Linux USB Gadget API
- **Deployment**: Raspberry Pi OS (Bullseye, 32-bit)

---

## References

- [LD-ToyPad-Emulator](https://github.com/Berny23/LD-ToyPad-Emulator)
- [Skylanders Reverse Engineering](https://marijnkneppers.dev/posts/reverse-engineering-skylanders-toys-to-life-mechanics/)
- [Disney Infinity USB Library](https://github.com/techbelly/di-usb-library)
- [Linux USB Gadget API](https://www.kernel.org/doc/html/latest/usb/gadget.html)

