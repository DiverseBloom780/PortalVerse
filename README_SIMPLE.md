# PortalVerse

A lightweight, offline multi-platform toy pad emulator for Raspberry Pi Zero that supports:
- **Lego Dimensions** (7-slot portal: 3 left, 1 center, 3 right)
- **Skylanders** (4-slot portal)
- **Disney Infinity** (3-slot portal in triangle formation)

## Features

✅ Lightweight Python/Flask implementation optimized for Pi Zero (512MB RAM, ARMv11)
✅ JSON file-based storage (no database overhead)
✅ Simple web interface for portal control
✅ Character selection with images
✅ LED color control
✅ Completely offline operation
✅ WiFi-only connectivity (no Ethernet needed)

## Quick Start

### Prerequisites
- Raspberry Pi Zero W with Bullseye OS
- Python 3.7+
- WiFi connection

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/PortalVerse.git
   cd PortalVerse
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure USB gadget** (one-time setup)
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
   Then reboot: `sudo reboot`

4. **Run the emulator**
   ```bash
   python3 app.py
   ```

5. **Access the web interface**
   From another device on the same WiFi:
   ```
   http://raspberrypi.local:5000
   ```

## Project Structure

```
PortalVerse/
├── emulator.py           # Core USB gadget emulation
├── app.py                # Flask web server
├── requirements.txt      # Python dependencies
├── templates/
│   └── index.html        # Web interface
├── static/
│   ├── style.css         # Styling
│   └── app.js            # Frontend logic
└── data/
    ├── dimensions_charactermap.json
    ├── skylanders.json
    └── infinity.json
```

## API Endpoints

### Status
- `GET /api/status` - Get all portals status
- `GET /api/portal/<platform>/status` - Get specific portal status

### Figures
- `GET /api/portal/<platform>/figures` - List figures
- `POST /api/portal/<platform>/figures` - Add figure
- `DELETE /api/portal/<platform>/figures/<id>` - Remove figure

### LED Control
- `POST /api/portal/<platform>/led` - Set LED color

### Characters
- `GET /api/characters` - Get all characters
- `GET /api/characters/<platform>` - Get platform-specific characters

## Portal Specifications

| Platform | Slots | USB VID | USB PID | Device |
|----------|-------|---------|---------|--------|
| Lego Dimensions | 7 | 0x0E6F | 0xF446 | /dev/hidg0 |
| Skylanders | 4 | 0x1430 | 0x0150 | /dev/hidg1 |
| Disney Infinity | 3 | 0x0E6F | 0x0129 | /dev/hidg2 |

## Storage

All portal state is stored in JSON files:
- `data/lego_dimensions/state.json`
- `data/skylanders/state.json`
- `data/disney_infinity/state.json`

Each state file contains:
```json
{
  "platform": "Lego Dimensions",
  "figures": [...],
  "led_color": [255, 0, 0]
}
```

## Troubleshooting

### USB Gadget Devices Not Found
1. Verify `dtoverlay=dwc2` is in `/boot/firmware/config.txt`
2. Reboot: `sudo reboot`
3. Check: `ls -la /dev/hidg*`

### Web Interface Not Accessible
1. Check Flask is running: `ps aux | grep app.py`
2. Verify WiFi connection: `iwconfig`
3. Check firewall: `sudo ufw allow 5000`

### Figures Not Saving
1. Check permissions: `ls -la data/`
2. Ensure data directory is writable: `chmod 755 data/`

## License

MIT License - See LICENSE file for details

## References

- [Berny23's LD-ToyPad-Emulator](https://github.com/Berny23/LD-ToyPad-Emulator)
- [Skylanders Reverse Engineering](https://marijnkneppers.dev/posts/reverse-engineering-skylanders-toys-to-life-mechanics/)
- [Disney Infinity USB Library](https://github.com/techbelly/di-usb-library)
