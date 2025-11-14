# Multi-Platform Toy Pad Emulator

## 🎮 Project Overview

The **Multi-Platform Toy Pad Emulator** is a comprehensive, offline solution that allows a **Raspberry Pi Zero W** to emulate the physical Toy Pad/Portal devices for three major "toys-to-life" gaming platforms:

1.  🧱 **Lego Dimensions**
2.  🐉 **Skylanders** (Portal of Power)
3.  🚀 **Disney Infinity** (Disney Infinity Base)

The emulator operates entirely **offline** and connects directly to the game console/PC via a single USB cable (USB Gadget Mode). A separate, responsive web interface runs on any local network device (PC, tablet, phone) to manage virtual toys and portal settings.

### Key Components

* **Portal Emulation:** The Raspberry Pi acts as a USB HID device, mimicking the official portals with the correct Vendor/Product IDs and communication protocols.
* **Character Emulation:** Virtual toy/figure data is stored in a local database and simulated by the emulator when a figure is "placed" via the web interface.
* **Remote Web Interface:** A modern React application for real-time portal management, toy inventory, and status monitoring over the local network (LAN only).

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **Multi-Platform Support** | Simultaneous emulation of Lego Dimensions, Skylanders, and Disney Infinity. |
| **Offline Operation** | Requires no internet access after initial setup. Web UI is LAN-only. |
| **Toy/Character Management** | Add, remove, and manage virtual toys, including Skylanders upgrades and LD vehicle modifications. |
| **Data Persistence** | All toy data, upgrade progress, and portal state are saved to a local **SQLite** database. |
| **Headless Operation** | The Raspberry Pi Zero runs without a display. Management is done entirely via the remote web interface. |
| **Low-Latency HID** | Meets the demanding performance targets for gaming with sub-20ms portal response times via USB Interrupt Transfers. |

---

## 💻 Technical Stack

### Backend (Raspberry Pi Zero W)

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Core** | Node.js 11+ with Express 4 | Application framework and server. |
| **API** | tRPC 11 | Type-safe API layer for communication with the frontend. |
| **USB Emulation** | Linux USB Gadget API (`/dev/hidg*`) | Kernel-level emulation of HID devices over USB. |
| **Database** | SQLite (or MySQL/TiDB) | Lightweight, reliable local data storage. |
| **ORM** | Drizzle ORM | Type-safe and modern database interaction. |
| **OS** | Raspberry Pi OS (Bullseye, 32-bit) | Legacy version for reliable USB Gadget Mode support. |

### Frontend (Remote Device - PC/Tablet)

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Framework** | React 19 with Vite | High-performance, modern user interface. |
| **Styling** | Tailwind CSS 4 | Responsive, utility-first styling. |
| **Components** | shadcn/ui | Consistent, accessible UI components. |
| **Communication** | tRPC (HTTP/WebSocket) | Real-time status and control over the local network. |

---

## 📐 Architecture Overview

The system is split into two layers: the Kernel-level **USB Gadget Layer** handling raw HID communication, and the **Application Layer** running the core Node.js logic and web server.

### 1. USB Gadget Layer (Kernel)
The Raspberry Pi is configured in USB Gadget Mode to appear as three separate HID devices to the connected Game Console/PC:

$$
\text{Game Console/PC} \xrightarrow{\text{USB}} \text{Raspberry Pi (USB Gadget Mode)} \\
\begin{array}{l}
\quad \vdash \text{/dev/hidg0 (Lego Dimensions Portal: 0x0E6F:0xF446)} \\
\quad \vdash \text{/dev/hidg1 (Skylanders Portal: 0x1430:0x0150)} \\
\quad \sqcup \text{/dev/hidg2 (Disney Infinity Base: 0x0E6F:0x0129)}
\end{array}
$$

### 2. Application Layer (Node.js Backend)

The Node.js server manages state, processes commands, and serves the API.



* **Portal State Manager:** Tracks the active platform, LED colors, and current figure placements, persisting this data in the database.
* **USB HID Emulator:** Contains platform-specific handlers for processing incoming HID reports (commands) and generating outgoing HID reports (responses/data).
* **Character Data Provider:** A unified service that looks up platform-specific toy data, NFC data, and upgrade status from the database.
* **tRPC API Server:** Exposes a strongly typed API for the remote web frontend to manage the emulator settings and toy inventory over the LAN.

---

## 💾 Database Schema

The Drizzle ORM is used to define a type-safe schema, centralizing all platform data.

| Table | Purpose | Key Fields |
| :--- | :--- | :--- |
| `users` | User authentication and role management (for Manus OAuth integration). | `id`, `openId`, `name`, `role` |
| `portal_state` | Real-time configuration for the active portal. | `userId`, `platform`, `isActive`, `ledColor`, `figuresOnPortal` (JSON) |
| `virtual_toys` | Inventory of all virtual toys across all platforms. | `userId`, `platform`, `toyId`, `toyType`, `nfcData`, `metadata` (JSON) |
| `toy_upgrades` | Skylanders/Infinity upgrade and progress data. | `toyId` (FK), `upgradeKey`, `upgradeValue` |
| `toy_placements` | History/current status of figures placed on the virtual portal. | `portalStateId` (FK), `toyId` (FK), `placedAt`, `removedAt` |

---

## 🛠️ Implementation Phases

The project follows a staged development approach, starting with core infrastructure and adding platform support incrementally.

### Phase 1: Core Infrastructure
* Database schema and migrations.
* USB gadget initialization and basic HID framework.
* tRPC API setup and Character Data Provider foundation.

### Phase 2: Lego Dimensions Support
* LD protocol implementation (Query, Write, LED Control).
* Integration with the Toy Database for character data lookup.

### Phase 3: Skylanders Support
* Skylanders protocol and command character parsing.
* NFC data simulation and Upgrade Tracking implementation.

### Phase 4: Disney Infinity Support
* Disney Infinity protocol and NFC reader simulation.
* LED color management and Power Disc support.

### Phase 5: Web Interface
* Development of the Portal Manager UI, Toy Inventory, and real-time status display.

### Phase 6: Pi Setup & Automation
* Creation of installation scripts (`install-pi-zero.sh`), USB gadget configuration, and `systemd` service for headless, automatic startup.

---

## 🔒 Security and Performance

### Security Considerations

* **LAN-Only Access:** The tRPC API is deliberately not exposed to the public internet.
* **Data Isolation:** Each user's virtual toy data is isolated via the `userId` foreign key.
* **Safe DB Access:** Parameterized queries via Drizzle ORM prevent SQL injection attacks.

### Performance Targets

The system is optimized for a low-power device (Pi Zero) while maintaining gaming-level performance:

* **Portal Response Time:** $<20\text{ms}$ (to support the $\sim50\text{Hz}$ game polling rate).
* **Character Lookup Time:** $<5\text{ms}$.
* **USB Latency:** $<10\text{ms}$ for HID transfers.
* **Memory Usage:** Targeted $<200\text{MB}$ on Raspberry Pi Zero.

---

## 🚀 Future Enhancements (Roadmap)

1.  **Wireless Toy Placement:** Implement Bluetooth/WiFi for physical toy detection.
2.  **Cloud Backup:** Optional cloud sync for secure, off-site toy data backup.
3.  **Custom Toy Creation:** Enable users to define and customize new virtual toys.
4.  **Figure Scanning:** Add support for QR code or barcode scanning to import toy IDs.

***
