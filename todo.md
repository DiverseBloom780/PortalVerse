# Multi-Platform Toy Pad Emulator - Project TODO

## Architecture Summary

**Raspberry Pi Zero (Headless)**
- Runs Node.js backend server on port 3000
- Emulates USB HID portals for Lego Dimensions, Skylanders, and Disney Infinity
- Provides character/toy data from database
- Accessible via tRPC API on LAN

**Remote Device (PC/Laptop/Tablet)**
- Runs React web interface
- Connects to Pi via LAN (http://<pi-ip>:3000)
- Manages toys, portal settings, and character data
- No display needed on Pi

---

## Phase 1: Core Infrastructure

### Database Schema
- [x] Create portal_states table
- [x] Create virtual_toys table
- [x] Create toy_upgrades table
- [x] Create toy_placements table
- [ ] Run database migrations (pnpm db:push)
- [ ] Create database query helpers

### USB Gadget Framework
- [ ] Create USB gadget initialization module
- [ ] Implement HID report descriptor handling
- [ ] Create USB gadget file management (/dev/hidg*)
- [ ] Implement USB interrupt transfer handling
- [ ] Create platform abstraction layer

### Character/Toy Data Provider
- [ ] Create character data lookup service
- [ ] Implement NFC data serialization
- [ ] Implement toy metadata retrieval
- [ ] Create upgrade data provider
- [ ] Implement figure placement tracking

### tRPC API Setup
- [ ] Create portal management procedures
- [ ] Create toy management procedures
- [ ] Create character placement procedures
- [ ] Create settings procedures
- [ ] Implement authentication checks

---

## Phase 2: Lego Dimensions Support

### Protocol Implementation
- [ ] Implement LD command parser
- [ ] Create LD activate command handler
- [ ] Create LD query command handler
- [ ] Create LD write command handler
- [ ] Create LD status command handler
- [ ] Implement LED color control

### Character Data Integration
- [ ] Implement LD character data lookup
- [ ] Implement LD upgrade data retrieval
- [ ] Implement LD figure serialization
- [ ] Create LD character database schema

### Testing
- [ ] Unit tests for LD protocol
- [ ] Unit tests for character data provider
- [ ] Integration tests with USB gadget
- [ ] Test with real Lego Dimensions game

---

## Phase 3: Skylanders Support

### Protocol Implementation
- [ ] Implement Skylanders command parser (ASCII command character)
- [ ] Create Status command handler ('S')
- [ ] Create Query command handler ('Q')
- [ ] Create Write command handler ('W')
- [ ] Create Activate command handler ('A')
- [ ] Create Color command handler ('C')
- [ ] Implement LED ring control

### Character Data Integration
- [ ] Implement Skylanders figure data lookup
- [ ] Implement Skylanders upgrade data retrieval
- [ ] Implement Skylanders NFC data serialization
- [ ] Create Skylanders figure database schema

### Testing
- [ ] Unit tests for Skylanders protocol
- [ ] Unit tests for character data provider
- [ ] Integration tests with USB gadget
- [ ] Integration tests with NFC simulation
- [ ] Test with real Skylanders game

---

## Phase 4: Disney Infinity Support

### Protocol Implementation
- [ ] Implement Disney Infinity command parser
- [ ] Create NFC query command handler
- [ ] Create figure detection handler
- [ ] Create LED color command handler
- [ ] Implement figure placement/removal events

### Character Data Integration
- [ ] Implement Disney Infinity figure data lookup
- [ ] Implement Disney Infinity NFC UID simulation
- [ ] Implement Disney Infinity figure metadata storage
- [ ] Create Disney Infinity figure database schema

### Testing
- [ ] Unit tests for Disney Infinity protocol
- [ ] Unit tests for NFC simulation
- [ ] Integration tests with USB gadget
- [ ] Integration tests with figure detection
- [ ] Test with real Disney Infinity game

---

## Phase 5: Web Interface

### Frontend Pages
- [ ] Create Home/Dashboard page
- [ ] Create Portal Manager page
- [ ] Create Toy Inventory page
- [ ] Create Settings page
- [ ] Create About/Help page

### Portal Manager UI
- [ ] Portal status display
- [ ] LED color picker
- [ ] Portal power toggle
- [ ] Platform selector
- [ ] Real-time status updates

### Toy Inventory UI
- [ ] Toy list display
- [ ] Add toy modal/form
- [ ] Edit toy modal/form
- [ ] Delete toy confirmation
- [ ] Toy search/filter
- [ ] Toy detail view

### Components
- [ ] PortalVisualizer component
- [ ] ToyCard component
- [ ] ToyForm component
- [ ] StatusIndicator component
- [ ] LedColorPicker component
- [ ] FigurePlacementUI component
- [ ] ActiveCharactersList component

### Real-time Updates
- [ ] WebSocket connection for live updates
- [ ] Portal status polling
- [ ] Figure placement notifications
- [ ] Error notifications

---

## Phase 6: Raspberry Pi Setup & Automation

### Installation Scripts
- [ ] Create Pi Zero setup script (install-pi-zero.sh)
- [ ] Create USB gadget configuration script (usb-gadget-setup.sh)
- [ ] Create database initialization script
- [ ] Create systemd service files
- [ ] Create automatic startup configuration

### Boot Configuration
- [ ] Document config.txt modifications
- [ ] Create config.txt.additions file
- [ ] Test on real Pi Zero

### Network Setup
- [ ] Test LAN connectivity
- [ ] Verify hostname resolution
- [ ] Test firewall settings

---

## Phase 7: Documentation

### Setup & Installation
- [x] Write IMPLEMENTATION_GUIDE.md
- [x] Write SETUP.md (installation guide for Pi Zero)
- [ ] Write QUICK_START.md (quick reference)
- [ ] Write NETWORK_SETUP.md (LAN configuration guide)

### User Documentation
- [ ] Write USAGE.md (user guide for web interface)
- [ ] Write CHARACTER_EMULATION.md (character data emulation guide)
- [ ] Write PROTOCOLS.md (protocol documentation)

### Support & Troubleshooting
- [ ] Write TROUBLESHOOTING.md (troubleshooting guide)
- [ ] Write FAQ.md (frequently asked questions)
- [ ] Write API.md (tRPC API documentation)

### Video & Media
- [ ] Create installation video tutorial
- [ ] Create usage video tutorial
- [ ] Create troubleshooting video

---

## Known Requirements

- [x] Pi Zero must run headless (no display)
- [x] Web interface must be accessible from remote device on LAN
- [x] Portal emulation must work over USB to game console
- [x] Character data must be served from database on Pi
- [x] All three platforms must be simultaneously supported
- [x] System must work completely offline after initial setup
- [x] USB gadget device files (/dev/hidg*) must be created at boot
- [x] dtoverlay=dwc2 must be added to /boot/firmware/config.txt

---

## Completed Features

- [x] Project initialization with tRPC + database
- [x] Database schema design (portal_states, virtual_toys, toy_upgrades, toy_placements)
- [x] Architecture documentation (ARCHITECTURE.md)
- [x] Implementation guide (IMPLEMENTATION_GUIDE.md)
- [x] Setup guide (SETUP.md)
- [x] USB gadget boot configuration documented

---

## Bug Fixes & Issues

- [ ] (None identified yet)

---

## Notes

### Critical: USB Gadget Setup
The `/dev/hidg*` device files must be created at boot. This requires:
1. `dtoverlay=dwc2` in `/boot/firmware/config.txt`
2. Kernel modules: `libcomposite`, `usb_f_hid`, `usb_gadget_configfs`
3. Reboot after config.txt changes

### Database
- Using Drizzle ORM with MySQL/TiDB
- Can also use SQLite for lighter footprint on Pi Zero
- Migrations run with `pnpm db:push`

### Platform Support
- **Lego Dimensions**: Query-based character lookup
- **Skylanders**: ASCII command-based protocol with figure data
- **Disney Infinity**: NFC UID simulation with figure metadata

