import { SQLiteProvider } from 'expo-sqlite'

export async function migrateDbIfNeeded(db) {
  await db.execAsync(`PRAGMA journal_mode = WAL;`)

  // 1) Ensure base table exists (original shape)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS queued_items (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,            -- 'reading' | 'install' (legacy)
      payload TEXT NOT NULL,         -- JSON string
      status TEXT NOT NULL,          -- 'pending' | 'failed' | 'ok'
      tries INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,   -- epoch ms
      updated_at INTEGER NOT NULL
    );
  `)

  // 2) Add role column if it doesn't exist
  const columns = await db.getAllAsync(`PRAGMA table_info(queued_items);`)
  const hasRole = columns?.some((c) => c.name === 'role')

  if (!hasRole) {
    // Nullable for backward compatibility
    await db.execAsync(`ALTER TABLE queued_items ADD COLUMN role TEXT;`)
  }

  // 3) Create helpful indexes (id is already PK)
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_queued_items_status ON queued_items(status);
    CREATE INDEX IF NOT EXISTS idx_queued_items_created ON queued_items(created_at);
    CREATE INDEX IF NOT EXISTS idx_queued_items_role ON queued_items(role);
    -- Optional composite to speed screens like "reports by role + status + recency"
    CREATE INDEX IF NOT EXISTS idx_queued_items_role_status_created
      ON queued_items(role, status, created_at);
  `)
}

// export async function migrateDbIfNeeded(db) {
//   await db.execAsync(`
//     PRAGMA journal_mode = WAL;
//     CREATE TABLE IF NOT EXISTS queued_items (
//       id TEXT PRIMARY KEY,
//       kind TEXT NOT NULL,            -- 'reading' | 'install'
//       payload TEXT NOT NULL,         -- JSON string
//       status TEXT NOT NULL,          -- 'pending' | 'failed' | 'ok'
//       tries INTEGER NOT NULL DEFAULT 0,
//       created_at INTEGER NOT NULL,   -- epoch ms
//       updated_at INTEGER NOT NULL
//     );

//     CREATE INDEX IF NOT EXISTS idx_queued_items_status ON queued_items(status);
//     CREATE INDEX IF NOT EXISTS idx_queued_items_created ON queued_items(created_at);
//   `)
// }

// import * as SQLite from 'expo-sqlite'
// export const db = SQLite.openDatabase('watelec.db')

// // Call once on app start
// export function initDb() {
//   db.transaction((tx) => {
//     tx.executeSql('PRAGMA foreign_keys = ON;')

//     // Pending queue (offline-first)
//     tx.executeSql(`
//       CREATE TABLE IF NOT EXISTS queued_readings (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         role TEXT NOT NULL,               -- 'inspector' | 'installer'
//         clientRef TEXT NOT NULL,
//         meterNumber TEXT NOT NULL,
//         readingValue REAL,                -- nullable for installer pre-photo
//         readingDate TEXT,                 -- ISO string
//         readingTime TEXT,                 -- ISO string or HH:mm
//         imageUri TEXT,                    -- file:// path to image
//         imageUri2 TEXT,                   -- installer only
//         imageUri3 TEXT,                   -- installer only
//         payload TEXT,                     -- optional JSON for future fields
//         createdAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
//         lastError TEXT
//       );
//     `)

//     // Success log (for your “reports / logs” tab)
//     tx.executeSql(`
//       CREATE TABLE IF NOT EXISTS successful_readings (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         role TEXT NOT NULL,
//         clientRef TEXT NOT NULL,
//         meterNumber TEXT NOT NULL,
//         readingValue REAL,
//         readingDate TEXT,
//         readingTime TEXT,
//         imageUri TEXT,
//         imageUri2 TEXT,
//         imageUri3 TEXT,
//         serverResponse TEXT,             -- JSON from server
//         createdAt TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
//       );
//     `)
//   })
// }
