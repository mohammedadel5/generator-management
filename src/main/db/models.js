const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
let db;

function init() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database', err);
        reject(err);
      } else {
        console.log('Open database at', dbPath);
        createTables()
          .then(() => runMigrations())
          .then(resolve)
          .catch(reject);
      }
    });
  });
}

function createTables() {
  return new Promise((resolve, reject) => {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT,
        amper_price REAL,
        num_ampers INTEGER,
        total_price REAL,
        status TEXT DEFAULT 'unpaid',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    db.serialize(() => {
      let completed = 0;
      if (queries.length === 0) return resolve();
      queries.forEach((query) => {
        db.run(query, (err) => {
          if (err) {
            console.error(`Error creating table`, err);
            return reject(err);
          }
          completed++;
          if (completed === queries.length) {
            seedUsers()
              .then(resolve)
              .catch(reject);
          }
        });
      });
    });
  });
}

function seedUsers() {
  return new Promise((resolve, reject) => {
    console.log('Ensuring default users exist...');
    const users = [
      ['admin', 'admin', 'admin'],
      ['operator', 'operator', 'operator']
    ];
    
    db.serialize(() => {
      const stmt = db.prepare("INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)");
      users.forEach(u => stmt.run(u));
      stmt.finalize((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

function runMigrations() {
  return new Promise((resolve, reject) => {
    db.all("PRAGMA table_info(customers)", (err, columns) => {
      if (err) return reject(err);
      
      const columnNames = columns.map(c => c.name);
      const migrations = [];

      if (!columnNames.includes('status')) {
        migrations.push("ALTER TABLE customers ADD COLUMN status TEXT DEFAULT 'unpaid'");
      }
      if (!columnNames.includes('created_at')) {
        migrations.push("ALTER TABLE customers ADD COLUMN created_at DATETIME");
      }

      if (migrations.length === 0) return resolve();

      db.serialize(() => {
        let completed = 0;
        migrations.forEach(sql => {
          db.run(sql, (err) => {
            if (err) {
              console.error(`Migration error running "${sql}":`, err);
            } else if (sql.includes('created_at')) {
              db.run("UPDATE customers SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL");
            }
            completed++;
            if (completed === migrations.length) resolve();
          });
        });
      });
    });
  });
}

module.exports = {
  init,
  getDb: () => db
};
