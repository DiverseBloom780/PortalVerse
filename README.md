Multi-Platform Toy Pad Emulator - Architecture & Design

Project Overview

This project creates a comprehensive offline Toy Pad emulator for Raspberry Pi Zero that supports three major toys-to-life gaming platforms:

•
Lego Dimensions (Portal VID: 0x0E6F, PID: 0xF446)

•
Skylanders (Portal VID: 0x1430, PID: 0x0150)

•
Disney Infinity (Portal VID: 0x0E6F, PID: 0x0129)

The emulator operates entirely offline with two key components:

1.
Portal Emulation: USB HID device that the game console connects to

2.
Character Emulation: Virtual toy/figure data that the portal simulates when "placed" on it

The web interface runs on a separate device (PC, laptop, tablet) on the local network to manage toys and portal settings.




Technical Stack

Backend (Raspberry Pi Zero)

•
Node.js 11+ with Express 4 and tRPC 11

•
USB HID Gadget Emulation: Linux USB Gadget API via /dev/hidg0

•
NFC/RFID Simulation: Virtual character data stored in database

•
Database: SQLite (lightweight for Pi Zero) or MySQL/TiDB

•
Drizzle ORM: Type-safe database queries

Frontend (Remote Device)

•
React 19 with Vite

•
Tailwind CSS 4 for responsive styling

•
shadcn/ui components for consistent UI

•
Offline-first: Works without internet (LAN only)

Deployment

•
Raspberry Pi Zero W (or Pi 4B with USB splitter)

•
Raspberry Pi OS (Bullseye, 32-bit) - Legacy version

•
USB Gadget Mode: Emulates portal as HID device over USB

•
Headless Operation: No display required on Pi




USB Device Specifications

Lego Dimensions Portal

•
Vendor ID: 0x0E6F

•
Product ID: 0xF446

•
Interface: HID (Human Interface Device)

•
Report Size: 32 bytes

•
Communication: Interrupt transfers at ~50Hz

•
Character Data: Stored in database, returned via portal queries

Skylanders Portal of Power

•
Vendor ID: 0x1430 (RedOctane)

•
Product ID: 0x0150

•
Interface: HID (Human Interface Device)

•
Report Size: 32 bytes

•
HID Report Descriptor: 06 00 FF 09 01 A1 01 19 01 29 40 15 00 26 FF 00 75 08 95 20 81 00 19 01 29 FF 91 00 C0

•
Communication: Interrupt transfers at ~50Hz

•
Command Format: 32-byte packets with first byte as command character (ASCII)

•
Character Data: Figure metadata and upgrades stored in database

Disney Infinity Base

•
Vendor ID: 0x0E6F

•
Product ID: 0x0129

•
Interface: HID (Human Interface Device)

•
Report Size: 32 bytes

•
Communication: Interrupt transfers

•
Features: NFC reader simulation, RGB LED control

•
Character Data: Figure NFC UID and metadata stored in database




Database Schema

Core Tables

users (Authentication)

•
id: Primary key

•
openId: Manus OAuth identifier

•
name, email: User profile

•
role: admin | user

•
createdAt, updatedAt, lastSignedIn: Timestamps

portal_state (Portal Configuration)

•
id: Primary key

•
userId: Foreign key to users

•
platform: 'lego_dimensions' | 'skylanders' | 'disney_infinity'

•
isActive: Boolean (portal powered on)

•
ledColor: RGB hex string (portal LED color)

•
figuresOnPortal: JSON array of toy IDs currently placed

•
createdAt, updatedAt: Timestamps

virtual_toys (Toy/Character Inventory)

•
id: Primary key

•
userId: Foreign key to users

•
platform: Platform identifier

•
toyId: Unique toy identifier (NFC UID or character ID)

•
toyName: Display name

•
toyType: 'character' | 'vehicle' | 'item' | 'magic_item'

•
nfcData: Raw NFC data (32 bytes for Skylanders/Disney Infinity)

•
metadata: JSON field for platform-specific data

•
createdAt, updatedAt: Timestamps

toy_upgrades (Skylanders/Infinity Upgrades)

•
id: Primary key

•
toyId: Foreign key to virtual_toys

•
upgradeKey: Upgrade identifier

•
upgradeValue: Upgrade state/level

•
updatedAt: Timestamp

toy_placements (Figure Placement History)

•
id: Primary key

•
portalStateId: Foreign key to portal_state

•
toyId: Foreign key to virtual_toys

•
placedAt: Timestamp when figure was placed

•
removedAt: Timestamp when figure was removed (null if still placed)




Architecture Overview

USB Gadget Layer (Raspberry Pi)

Plain Text


Game Console/PC
    ↓ USB
Raspberry Pi (USB Gadget Mode)
    ├── /dev/hidg0 (Lego Dimensions Portal)
    ├── /dev/hidg1 (Skylanders Portal)
    └── /dev/hidg2 (Disney Infinity Base)
    ↓
USB Gadget Kernel Module
    ├── Lego Dimensions Emulator
    │   └── Character Data Provider
    ├── Skylanders Emulator
    │   └── Figure Data Provider
    └── Disney Infinity Emulator
        └── NFC Data Provider


Application Layer

Raspberry Pi Zero (Headless Backend)

Plain Text


Backend (Node.js/Express)
    ├── Portal State Manager
    │   └── Manages active platform, LED colors, figure placement
    ├── USB HID Emulator
    │   ├── Lego Dimensions Handler
    │   ├── Skylanders Handler
    │   └── Disney Infinity Handler
    ├── Character Data Provider
    │   ├── Figure lookup by ID
    │   ├── NFC data serialization
    │   └── Upgrade data retrieval
    ├── Toy Database Manager
    │   └── CRUD operations for toys/figures
    ├── Command Processor
    │   └── Routes commands to appropriate handler
    └── tRPC API Server (listens on 0.0.0.0:3000)
        └── Accessible from LAN devices
    ↓
Database (SQLite or MySQL/TiDB)
    ├── Toy Data, Upgrades, Portal State
    └── Placement History


Remote Device (PC, Laptop, Tablet)

Plain Text


Frontend (React Web UI)
    ├── Portal Manager
    ├── Toy Inventory
    ├── Settings
    └── Real-time Status
    ↓ tRPC API (HTTP/WebSocket over LAN)
Raspberry Pi Backend (http://<pi-ip>:3000 )


Network Communication

Plain Text


Remote Device Browser
    ↓ HTTP/WebSocket (LAN)
Raspberry Pi Server (Port 3000)
    ↓ USB
Game Console
    ↓ (reads from portal)
Emulated Portal
    ↓ (queries character data)
Virtual Toy Database


Character Emulation Flow

Lego Dimensions

1.
Game places figure on portal

2.
Portal sends Query command to emulator

3.
Emulator looks up figure data in database

4.
Returns figure ID, variant, and upgrade data

5.
Game loads figure with all saved upgrades

Skylanders

1.
Game sends Status command to portal

2.
Emulator returns character status array

3.
Array contains figure IDs at each portal slot

4.
Game queries figure data for each slot

5.
Emulator returns NFC data from database

Disney Infinity

1.
Game sends NFC query to portal

2.
Emulator simulates NFC reader

3.
Returns figure NFC UID from database

4.
Game loads figure data based on UID

5.
Portal LED shows figure placement




File Structure

Plain Text


multi_toy_pad_emulator/
├── client/                          # React frontend (runs on remote device)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx            # Main dashboard
│   │   │   ├── PortalManager.tsx   # Portal control UI
│   │   │   ├── ToyInventory.tsx    # Toy management
│   │   │   └── Settings.tsx        # Configuration
│   │   ├── components/
│   │   │   ├── PortalVisualizer.tsx # Portal LED display
│   │   │   ├── ToyCard.tsx         # Toy display component
│   │   │   ├── FigurePlacement.tsx # Figure placement UI
│   │   │   └── ...
│   │   ├── App.tsx
│   │   └── index.css
│   └── public/
│
├── server/                          # Express backend (runs on Pi Zero)
│   ├── routers.ts                  # tRPC procedures
│   ├── db.ts                       # Database queries
│   ├── usb-emulator.ts             # USB gadget control
│   ├── character-provider.ts       # Character/toy data provider
│   ├── platforms/
│   │   ├── lego-dimensions.ts      # LD protocol handler
│   │   ├── skylanders.ts           # Skylanders protocol handler
│   │   └── disney-infinity.ts      # Disney Infinity protocol handler
│   ├── services/
│   │   ├── portal-manager.ts       # Portal state management
│   │   ├── toy-manager.ts          # Toy data management
│   │   ├── command-processor.ts    # Command routing
│   │   └── nfc-simulator.ts        # NFC data simulation
│   └── _core/                      # Framework code
│
├── drizzle/
│   └── schema.ts                   # Database schema
│
├── setup/                           # Installation scripts
│   ├── install-pi-zero.sh          # Pi Zero setup
│   ├── usb-gadget-setup.sh         # USB gadget configuration
│   ├── database-init.sql           # Initial database
│   ├── systemd-toypad.service      # systemd service file
│   └── autostart-setup.sh          # Automatic startup configuration
│
├── docs/                            # Documentation
│   ├── SETUP.md                    # Installation guide
│   ├── USAGE.md                    # User guide
│   ├── PROTOCOLS.md                # Protocol documentation
│   ├── CHARACTER_EMULATION.md      # Character emulation details
│   └── TROUBLESHOOTING.md          # Troubleshooting guide
│
├── ARCHITECTURE.md                 # This file
└── package.json





Key Features

1. Multi-Platform Support

•
Simultaneous emulation of all three platforms

•
Platform-specific command handling

•
Unified toy database with platform-specific metadata

•
Character data provider for each platform

2. Offline Operation

•
No internet required after initial setup

•
Web UI accessible via LAN only

•
All data stored in local database on Pi

•
Works without power to remote device

3. Toy/Character Management

•
Add/remove virtual toys and characters

•
Manage character upgrades (Skylanders)

•
Track vehicle modifications (Lego Dimensions)

•
Store figure data (Disney Infinity)

•
Simulate NFC/RFID data for character placement

4. Portal Visualization

•
Real-time LED color display

•
Portal status monitoring

•
Figure placement visualization

•
Active character list

5. Data Persistence

•
Toy data saved to database

•
Upgrade progress preserved

•
Portal state recovery on restart

•
Placement history tracking

6. Headless Operation

•
Pi Zero runs without display

•
Web interface on separate device

•
SSH access for troubleshooting

•
Automatic startup on power




Implementation Phases

Phase 1: Core Infrastructure




Database schema and migrations




USB gadget initialization




Basic HID emulation framework




Character data provider




tRPC API setup

Phase 2: Lego Dimensions Support




LD protocol implementation




Command processing (activate, query, write)




Character data lookup




Toy database integration




LED control

Phase 3: Skylanders Support




Skylanders protocol implementation




Command character parsing




Figure data management




NFC data simulation




Upgrade tracking

Phase 4: Disney Infinity Support




Disney Infinity protocol implementation




NFC data simulation




Figure detection




LED color management




Power disc support

Phase 5: Web Interface




Portal manager UI




Toy inventory interface




Figure placement UI




Settings and configuration




Real-time status display

Phase 6: Pi Setup & Automation




Installation scripts




USB gadget configuration




systemd service setup




Automatic startup




Network discovery

Phase 7: Documentation




Installation guide




User manual




Protocol documentation




Character emulation guide




Troubleshooting guide




Security Considerations

1.
Authentication: Manus OAuth for user management

2.
Data Isolation: Each user has isolated toy database

3.
USB Gadget Permissions: Restricted to /dev/hidg* files

4.
Database Access: Parameterized queries via Drizzle ORM

5.
Network Access: LAN-only, no external exposure

6.
Offline Mode: No external API calls required




Performance Targets

•
Portal Response Time: <20ms (50Hz polling rate)

•
Character Lookup Time: <5ms

•
Web UI Load Time: <2 seconds

•
Database Query Time: <10ms average

•
Memory Usage: <200MB on Raspberry Pi Zero

•
USB Latency: <10ms for HID transfers




Testing Strategy

1.
Unit Tests: Protocol handlers, command parsing, character data provider

2.
Integration Tests: USB gadget communication, character lookup

3.
End-to-End Tests: Full toy placement workflow

4.
Hardware Tests: Real Raspberry Pi Zero

5.
Compatibility Tests: Multiple game versions

6.
Network Tests: LAN connectivity and API access




Future Enhancements

1.
Wireless Toy Placement: Bluetooth/WiFi toy detection

2.
Cloud Backup: Optional cloud sync for toy data

3.
Advanced Analytics: Toy usage statistics

4.
Custom Toy Creation: User-defined toy data

5.
Multi-User Support: Shared portal management

6.
Mobile App: Native iOS/Android interface

7.
Figure Scanning: QR code or barcode scanning for toy import




References

•
LD-ToyPad-Emulator

•
Skylanders Reverse Engineering

•
Disney Infinity USB Library

•
USB HID Specification

•
Linux USB Gadget API

•
NFC/RFID Technology

