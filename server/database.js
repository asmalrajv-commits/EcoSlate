
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const databasePath = path.join(__dirname, "ecoslate.db");

let db;

async function initializeDatabase() {
  const SQL = await initSqlJs();

  if (fs.existsSync(databasePath)) {
    const fileBuffer = fs.readFileSync(databasePath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Existing test table
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  // New account table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'teacher')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  saveDatabase();

  console.log("EcoSlate database initialized!");

  return db;
}

function getDatabase() {
  if (!db) {
    throw new Error("Database is not initialized.");
  }

  return db;
}

function saveDatabase() {
  if (!db) {
    throw new Error("Database is not initialized.");
  }

  const data = db.export();
  fs.writeFileSync(databasePath, Buffer.from(data));
}

module.exports = {
  initializeDatabase,
  getDatabase,
  saveDatabase
};
