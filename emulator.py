#!/usr/bin/env python3
"""
PortalVerse - Multi-Platform Toy Pad Emulator
Supports: Lego Dimensions, Skylanders, Disney Infinity
Lightweight Python implementation for Raspberry Pi Zero
"""

import os
import json
import struct
import threading
from pathlib import Path
from typing import Dict, List, Any, Optional

class PortalEmulator:
    """Base class for portal emulation"""
    
    def __init__(self, platform_name: str, device_path: str, vendor_id: int, product_id: int, max_figures: int):
        self.platform_name = platform_name
        self.device_path = device_path
        self.vendor_id = vendor_id
        self.product_id = product_id
        self.max_figures = max_figures
        self.device_file = None
        self.is_running = False
        self.figures: List[Dict[str, Any]] = []
        self.led_color = [0, 0, 0]
        self.data_dir = Path("data") / platform_name.lower().replace(" ", "_")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.state_file = self.data_dir / "state.json"
        
    def load_state(self):
        """Load portal state from JSON storage"""
        if self.state_file.exists():
            try:
                with open(self.state_file, 'r') as f:
                    state = json.load(f)
                    self.figures = state.get('figures', [])
                    self.led_color = state.get('led_color', [0, 0, 0])
            except Exception as e:
                print(f"[{self.platform_name}] Error loading state: {e}")
        else:
            self.figures = []
            self.led_color = [0, 0, 0]
            
    def save_state(self):
        """Save portal state to JSON storage"""
        try:
            state = {
                'platform': self.platform_name,
                'figures': self.figures,
                'led_color': self.led_color,
            }
            with open(self.state_file, 'w') as f:
                json.dump(state, f, indent=2)
        except Exception as e:
            print(f"[{self.platform_name}] Error saving state: {e}")
            
    def add_figure(self, figure_data: Dict[str, Any]) -> bool:
        """Add a figure to the portal"""
        if len(self.figures) >= self.max_figures:
            return False
        self.figures.append(figure_data)
        self.save_state()
        return True
        
    def remove_figure(self, figure_id: int) -> bool:
        """Remove a figure from the portal"""
        original_len = len(self.figures)
        self.figures = [f for f in self.figures if f.get('id') != figure_id]
        if len(self.figures) < original_len:
            self.save_state()
            return True
        return False
        
    def swap_figures(self, position1: int, position2: int) -> bool:
        """Swap two figures on the portal"""
        if position1 < 0 or position2 < 0 or position1 >= len(self.figures) or position2 >= len(self.figures):
            return False
        self.figures[position1], self.figures[position2] = self.figures[position2], self.figures[position1]
        self.save_state()
        return True
        
    def set_led_color(self, r: int, g: int, b: int) -> bool:
        """Set the portal LED color"""
        self.led_color = [max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b))]
        self.save_state()
        return True
        
    def initialize(self) -> bool:
        """Initialize the USB HID device"""
        try:
            if not os.path.exists(self.device_path):
                print(f"[{self.platform_name}] Device {self.device_path} not found (will try to create)")
                return False
                
            self.device_file = open(self.device_path, 'wb')
            self.is_running = True
            self.load_state()
            print(f"[{self.platform_name}] Initialized successfully")
            return True
        except Exception as e:
            print(f"[{self.platform_name}] Initialization failed: {e}")
            self.is_running = False
            return False
            
    def shutdown(self):
        """Shutdown the emulator"""
        self.is_running = False
        if self.device_file:
            try:
                self.device_file.close()
            except:
                pass
            
    def send_report(self, data: bytes) -> bool:
        """Send HID report to device"""
        if not self.device_file or not self.is_running:
            return False
        try:
            self.device_file.write(data)
            self.device_file.flush()
            return True
        except Exception as e:
            print(f"[{self.platform_name}] Error sending report: {e}")
            return False
            
    def get_status(self) -> Dict[str, Any]:
        """Get current portal status"""
        return {
            'platform': self.platform_name,
            'running': self.is_running,
            'figures_count': len(self.figures),
            'max_figures': self.max_figures,
            'led_color': self.led_color,
            'device_path': self.device_path,
            'figures': self.figures,
        }


class LegoDimensionsPortal(PortalEmulator):
    """Lego Dimensions Portal Emulator - 7 slots (3 left, 1 center, 3 right)"""
    
    def __init__(self):
        super().__init__(
            "Lego Dimensions",
            "/dev/hidg0",
            0x0E6F,  # Mattel
            0xF446,  # Lego Dimensions
            max_figures=7
        )


class SkylandersPortal(PortalEmulator):
    """Skylanders Portal of Power Emulator - 4 slots"""
    
    def __init__(self):
        super().__init__(
            "Skylanders",
            "/dev/hidg1",
            0x1430,  # Activision
            0x0150,  # Portal of Power
            max_figures=4
        )


class DisneyInfinityPortal(PortalEmulator):
    """Disney Infinity Base Emulator - 3 slots (triangle formation)"""
    
    def __init__(self):
        super().__init__(
            "Disney Infinity",
            "/dev/hidg2",
            0x0E6F,  # Mattel
            0x0129,  # Disney Infinity
            max_figures=3
        )


class PortalVerseEmulator:
    """Main emulator managing all three portals"""
    
    def __init__(self):
        self.portals: Dict[str, PortalEmulator] = {
            'lego_dimensions': LegoDimensionsPortal(),
            'skylanders': SkylandersPortal(),
            'disney_infinity': DisneyInfinityPortal(),
        }
        self.running = False
        
    def initialize_all(self) -> Dict[str, bool]:
        """Initialize all portals"""
        results = {}
        for name, portal in self.portals.items():
            results[name] = portal.initialize()
        self.running = True
        return results
        
    def shutdown_all(self):
        """Shutdown all portals"""
        for portal in self.portals.values():
            portal.shutdown()
        self.running = False
        
    def get_portal(self, platform: str) -> Optional[PortalEmulator]:
        """Get a specific portal"""
        return self.portals.get(platform)
        
    def get_all_portals_status(self) -> Dict[str, Dict[str, Any]]:
        """Get status of all portals"""
        status = {}
        for name, portal in self.portals.items():
            status[name] = portal.get_status()
        return status


# Global emulator instance
_emulator: Optional[PortalVerseEmulator] = None

def get_emulator() -> PortalVerseEmulator:
    """Get or create the global emulator instance"""
    global _emulator
    if _emulator is None:
        _emulator = PortalVerseEmulator()
    return _emulator
