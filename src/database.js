const sqlite3 = require('sqlite3').verbose();
const path = require('path');
class DatabaseManager {
    constructor() {
        // Use in-memory for fastest access, persist to disk periodically
        this.db = new sqlite3.Database(':memory:');
        this.initializeTables();
        this.setupPeriodicSync();
    }

    initializeTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS portals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                x_position REAL,
                y_position REAL,
                z_position REAL,
                world_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS worlds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        tables.forEach(table => {
            this.db.run(table);
        });
    }

    // Lightweight batch operations for Pi Zero
    batchInsert(table, records) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`INSERT INTO ${table} VALUES (${Array(records[0].length).fill('?').join(',')})`);
            const errors = [];
            
            records.forEach(record => {
                stmt.run(record, (err) => {
                    if (err) errors.push(err);
                });
            });
            
            stmt.finalize((err) => {
                if (err) reject(err);
                else resolve(errors);
            });
        });
    }
}
