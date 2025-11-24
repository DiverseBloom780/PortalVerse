#!/usr/bin/env python3
"""
PortalVerse Web Interface
Flask-based control panel for the multi-platform toy pad emulator
Lightweight implementation for Raspberry Pi Zero
"""

import json
import os
from pathlib import Path
from flask import Flask, render_template, jsonify, request, send_from_directory
from emulator import get_emulator

app = Flask(__name__, template_folder='templates', static_folder='static')

# Initialize emulator
emulator = get_emulator()
emulator.initialize_all()


# ============================================================================
# Static Files
# ============================================================================

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory('static', filename)


# ============================================================================
# Pages
# ============================================================================

@app.route('/')
def index():
    """Main dashboard"""
    return render_template('index.html')


# ============================================================================
# API: Status
# ============================================================================

@app.route('/api/status')
def api_status():
    """Get status of all portals"""
    return jsonify(emulator.get_all_portals_status())


@app.route('/api/portal/<platform>/status')
def api_portal_status(platform):
    """Get status of a specific portal"""
    portal = emulator.get_portal(platform)
    if not portal:
        return jsonify({'error': 'Portal not found'}), 404
    return jsonify(portal.get_status())


# ============================================================================
# API: Figures
# ============================================================================

@app.route('/api/portal/<platform>/figures')
def api_get_figures(platform):
    """Get all figures on a portal"""
    portal = emulator.get_portal(platform)
    if not portal:
        return jsonify({'error': 'Portal not found'}), 404
    return jsonify({
        'platform': platform,
        'figures': portal.figures,
        'max_figures': portal.max_figures,
        'count': len(portal.figures),
    })


@app.route('/api/portal/<platform>/figures', methods=['POST'])
def api_add_figure(platform):
    """Add a figure to a portal"""
    portal = emulator.get_portal(platform)
    if not portal:
        return jsonify({'error': 'Portal not found'}), 404
        
    if len(portal.figures) >= portal.max_figures:
        return jsonify({'error': 'Portal is full'}), 400
        
    data = request.json
    figure = {
        'id': data.get('id'),
        'name': data.get('name'),
        'type': data.get('type'),
        'image': data.get('image'),
    }
    
    if portal.add_figure(figure):
        return jsonify({'success': True, 'figure': figure, 'count': len(portal.figures)})
    return jsonify({'error': 'Failed to add figure'}), 500


@app.route('/api/portal/<platform>/figures/<int:figure_id>', methods=['DELETE'])
def api_remove_figure(platform, figure_id):
    """Remove a figure from a portal"""
    portal = emulator.get_portal(platform)
    if not portal:
        return jsonify({'error': 'Portal not found'}), 404
        
    if portal.remove_figure(figure_id):
        return jsonify({'success': True, 'count': len(portal.figures)})
    return jsonify({'error': 'Figure not found'}), 404


@app.route('/api/portal/<platform>/figures/swap', methods=['POST'])
def api_swap_figures(platform):
    """Swap two figures on a portal"""
    portal = emulator.get_portal(platform)
    if not portal:
        return jsonify({'error': 'Portal not found'}), 404
        
    data = request.json
    pos1 = data.get('position1')
    pos2 = data.get('position2')
    
    if portal.swap_figures(pos1, pos2):
        return jsonify({'success': True, 'figures': portal.figures})
    return jsonify({'error': 'Invalid positions'}), 400


# ============================================================================
# API: LED Control
# ============================================================================

@app.route('/api/portal/<platform>/led', methods=['POST'])
def api_set_led(platform):
    """Set portal LED color"""
    portal = emulator.get_portal(platform)
    if not portal:
        return jsonify({'error': 'Portal not found'}), 404
        
    data = request.json
    r = data.get('r', 0)
    g = data.get('g', 0)
    b = data.get('b', 0)
    
    if portal.set_led_color(r, g, b):
        return jsonify({'success': True, 'color': portal.led_color})
    return jsonify({'error': 'Failed to set LED color'}), 500


# ============================================================================
# API: Character Data
# ============================================================================

@app.route('/api/characters')
def api_get_characters():
    """Get all available characters"""
    characters = {}
    data_dir = Path('data')
    
    # Load Lego Dimensions
    ld_file = data_dir / 'dimensions_charactermap.json'
    if ld_file.exists():
        with open(ld_file, 'r') as f:
            characters['lego_dimensions'] = json.load(f)
    
    # Load Skylanders
    sk_file = data_dir / 'skylanders.json'
    if sk_file.exists():
        with open(sk_file, 'r') as f:
            characters['skylanders'] = json.load(f)
    
    # Load Disney Infinity
    di_file = data_dir / 'infinity.json'
    if di_file.exists():
        with open(di_file, 'r') as f:
            characters['disney_infinity'] = json.load(f)
    
    return jsonify(characters)


@app.route('/api/characters/<platform>')
def api_get_platform_characters(platform):
    """Get characters for a specific platform"""
    data_dir = Path('data')
    
    file_map = {
        'lego_dimensions': 'dimensions_charactermap.json',
        'skylanders': 'skylanders.json',
        'disney_infinity': 'infinity.json',
    }
    
    filename = file_map.get(platform)
    if not filename:
        return jsonify({'error': 'Platform not found'}), 404
    
    filepath = data_dir / filename
    if filepath.exists():
        with open(filepath, 'r') as f:
            return jsonify(json.load(f))
    
    return jsonify([])


# ============================================================================
# Error Handlers
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500


# ============================================================================
# Main
# ============================================================================

if __name__ == '__main__':
    try:
        # Create templates and static directories if they don't exist
        Path('templates').mkdir(exist_ok=True)
        Path('static').mkdir(exist_ok=True)
        
        print("Starting PortalVerse...")
        print("Access the web interface at: http://0.0.0.0:5000")
        app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
    except KeyboardInterrupt:
        print("\nShutting down...")
        emulator.shutdown_all()
