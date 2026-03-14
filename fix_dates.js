const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');

const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'generator-management', 'database.sqlite');
console.log('Opening db at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening db:', err.message);
        process.exit(1);
    }
});

db.serialize(() => {
    // Current YYYY-MM-DD
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    db.run(`UPDATE customers SET subscription_date = ? WHERE subscription_date IS NULL OR subscription_date = ''`, [dateStr], function(err) {
        if (err) {
            console.error('Update error:', err.message);
        } else {
            console.log(`Updated ${this.changes} rows with missing subscription_date to ${dateStr}`);
        }
        db.close();
    });
});
