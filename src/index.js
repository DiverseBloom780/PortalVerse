const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const DatabaseManager = require('./db/database');
const app = express();
const PORT = process.env.PORT || 3000;

// Lightweight middleware for Pi Zero
app.use(helmet({
    contentSecurityPolicy: false, // Disable for performance
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '1mb' })); // Limit payload size

// Initialize database
const db = new DatabaseManager();

// Lightweight endpoints
app.get('/api/portals', async (req, res) => {
    try {
        const portals = await db.getAll('portals');
        res.json(portals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/portals', async (req, res) => {
    try {
        const { name, x_position, y_position, z_position, world_id } = req.body;
        const result = await db.insert('portals', { name, x_position, y_position, z_position, world_id });
        res.json({ id: result.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`PortalVerse Pi Zero server running on port ${PORT}`);
});
