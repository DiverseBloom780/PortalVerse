/**
 * PortalVerse Web Interface
 * Main application logic for portal control and management
 */

const PLATFORMS = {
    'lego_dimensions': 'Lego Dimensions',
    'skylanders': 'Skylanders',
    'disney_infinity': 'Disney Infinity'
};

const MAX_FIGURES = {
    'lego_dimensions': 7,
    'skylanders': 4,
    'disney_infinity': 3
};

let portalStatus = {};
let characters = {};

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('PortalVerse Web Interface loaded');
    loadStatus();
    loadCharacters();
    setInterval(loadStatus, 2000); // Update status every 2 seconds
});

// ============================================================================
// API Functions
// ============================================================================

async function loadStatus() {
    try {
        const response = await fetch('/api/status');
        portalStatus = await response.json();
        renderStatus();
        renderControls();
    } catch (error) {
        console.error('Error loading status:', error);
    }
}

async function loadCharacters() {
    try {
        const response = await fetch('/api/characters');
        characters = await response.json();
    } catch (error) {
        console.error('Error loading characters:', error);
    }
}

async function addFigure(platform, figureId, figureName, figureType) {
    try {
        const response = await fetch(`/api/portal/${platform}/figures`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: figureId,
                name: figureName,
                type: figureType,
                image: null,
            })
        });
        
        if (response.ok) {
            loadStatus();
            showMessage('Figure added successfully!', 'success');
        } else {
            const error = await response.json();
            showMessage(error.error || 'Failed to add figure', 'error');
        }
    } catch (error) {
        console.error('Error adding figure:', error);
        showMessage('Error adding figure', 'error');
    }
}

async function removeFigure(platform, figureId) {
    try {
        const response = await fetch(`/api/portal/${platform}/figures/${figureId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadStatus();
            showMessage('Figure removed successfully!', 'success');
        } else {
            showMessage('Failed to remove figure', 'error');
        }
    } catch (error) {
        console.error('Error removing figure:', error);
        showMessage('Error removing figure', 'error');
    }
}

async function setLEDColor(platform, r, g, b) {
    try {
        const response = await fetch(`/api/portal/${platform}/led`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ r, g, b })
        });
        
        if (response.ok) {
            loadStatus();
            showMessage('LED color updated!', 'success');
        } else {
            showMessage('Failed to update LED color', 'error');
        }
    } catch (error) {
        console.error('Error setting LED color:', error);
        showMessage('Error setting LED color', 'error');
    }
}

// ============================================================================
// Rendering Functions
// ============================================================================

function renderStatus() {
    const container = document.getElementById('status-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (const [platformKey, platformName] of Object.entries(PLATFORMS)) {
        const status = portalStatus[platformKey] || {};
        const card = document.createElement('div');
        card.className = 'portal-card';
        
        const runningClass = status.running ? 'running' : 'offline';
        const runningText = status.running ? 'Running' : 'Offline';
        
        card.innerHTML = `
            <h3>${platformName}</h3>
            <div class="status-badge ${runningClass}">${runningText}</div>
            <div class="status-info">
                <div><strong>Figures:</strong> ${status.figures_count || 0} / ${status.max_figures || 0}</div>
                <div><strong>LED Color:</strong> RGB(${status.led_color?.[0] || 0}, ${status.led_color?.[1] || 0}, ${status.led_color?.[2] || 0})</div>
                <div><strong>Device:</strong> ${status.device_path || 'N/A'}</div>
            </div>
        `;
        
        container.appendChild(card);
    }
}

function renderControls() {
    const container = document.getElementById('controls-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (const [platformKey, platformName] of Object.entries(PLATFORMS)) {
        const status = portalStatus[platformKey] || {};
        const panel = document.createElement('div');
        panel.className = 'control-panel';
        
        const platformChars = characters[platformKey] || [];
        
        let figuresHTML = '';
        if (status.figures && status.figures.length > 0) {
            figuresHTML = '<div class="figure-list">';
            status.figures.forEach((fig, idx) => {
                figuresHTML += `
                    <div class="figure-item">
                        <div>
                            <div class="figure-name">${fig.name}</div>
                            <div class="figure-type">${fig.type}</div>
                        </div>
                        <button class="remove-btn" onclick="removeFigure('${platformKey}', ${fig.id})">Remove</button>
                    </div>
                `;
            });
            figuresHTML += '</div>';
        }
        
        panel.innerHTML = `
            <h3>${platformName} Control</h3>
            
            <div class="control-group">
                <label for="char-select-${platformKey}">Add Figure:</label>
                <select id="char-select-${platformKey}" onchange="handleCharacterSelect('${platformKey}', this)">
                    <option value="">-- Select a character --</option>
                    ${platformChars.map(char => `
                        <option value="${char.id}" data-name="${char.name}" data-type="${char.type || 'Character'}">
                            ${char.name}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="control-group">
                <label>LED Color:</label>
                <div class="color-picker-group">
                    <div>
                        <label style="font-size: 0.9em; font-weight: normal;">Red</label>
                        <input type="range" min="0" max="255" value="${status.led_color?.[0] || 0}" 
                               onchange="handleLEDChange('${platformKey}')">
                    </div>
                    <div>
                        <label style="font-size: 0.9em; font-weight: normal;">Green</label>
                        <input type="range" min="0" max="255" value="${status.led_color?.[1] || 0}" 
                               onchange="handleLEDChange('${platformKey}')">
                    </div>
                    <div>
                        <label style="font-size: 0.9em; font-weight: normal;">Blue</label>
                        <input type="range" min="0" max="255" value="${status.led_color?.[2] || 0}" 
                               onchange="handleLEDChange('${platformKey}')">
                    </div>
                </div>
            </div>
            
            <div class="control-group">
                <label>Current Figures (${status.figures_count || 0}/${status.max_figures || 0}):</label>
                ${figuresHTML || '<p style="color: #999; padding: 10px;">No figures on portal</p>'}
            </div>
        `;
        
        container.appendChild(panel);
    }
}

// ============================================================================
// Event Handlers
// ============================================================================

function handleCharacterSelect(platform, selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    if (selectedOption.value) {
        const figureId = parseInt(selectedOption.value);
        const figureName = selectedOption.dataset.name;
        const figureType = selectedOption.dataset.type;
        
        addFigure(platform, figureId, figureName, figureType);
        selectElement.value = '';
    }
}

function handleLEDChange(platform) {
    const panel = event.target.closest('.control-panel');
    const inputs = panel.querySelectorAll('input[type="range"]');
    const r = parseInt(inputs[0].value);
    const g = parseInt(inputs[1].value);
    const b = parseInt(inputs[2].value);
    
    setLEDColor(platform, r, g, b);
}

// ============================================================================
// Utility Functions
// ============================================================================

function showMessage(message, type = 'info') {
    // Create a simple alert (you could enhance this with a toast notification)
    console.log(`[${type.toUpperCase()}] ${message}`);
}
