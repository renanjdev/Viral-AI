import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(process.cwd(), "database", "app.db");

// Ensure database directory exists
import fs from "fs";
if (!fs.existsSync(path.join(process.cwd(), "database"))) {
  fs.mkdirSync(path.join(process.cwd(), "database"));
}

export const db = new Database(dbPath);

export function initDatabase() {
  // Projects Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      original_video_path TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Clips Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS clips (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      start_time REAL NOT NULL,
      end_time REAL NOT NULL,
      viral_score INTEGER,
      path TEXT,
      status TEXT DEFAULT 'pending',
      metadata TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);

  console.log("Database initialized");
}
