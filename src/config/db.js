import { SQLiteProvider } from 'expo-sqlite'

export async function migrateDbIfNeeded(db) {
  await db.execAsync(`PRAGMA journal_mode = WAL;`)

  // ensure base table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS queued_items (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT NOT NULL,
      tries INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `)

  // check existing columns
  const columns = await db.getAllAsync(`PRAGMA table_info(queued_items);`)
  const colNames = columns.map((c) => c.name)

  if (!colNames.includes('role')) {
    await db.execAsync(`ALTER TABLE queued_items ADD COLUMN role TEXT;`)
  }

  if (!colNames.includes('clientRef')) {
    // nullable, so older rows still valid
    await db.execAsync(`ALTER TABLE queued_items ADD COLUMN clientRef TEXT;`)
  }

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_queued_items_status ON queued_items(status);
    CREATE INDEX IF NOT EXISTS idx_queued_items_created ON queued_items(created_at);
    CREATE INDEX IF NOT EXISTS idx_queued_items_role ON queued_items(role);
    CREATE INDEX IF NOT EXISTS idx_queued_items_clientRef ON queued_items(clientRef);
    CREATE INDEX IF NOT EXISTS idx_queued_items_role_status_created
      ON queued_items(role, status, created_at);
    CREATE INDEX IF NOT EXISTS idx_qi_role_kind_client_created
    ON queued_items(role, kind, clientRef, created_at);
  `)
}

export async function getLastLocalReading(db, { clientRef, meterNumber }) {
  // Accept anything except explicit failures. Adjust the NOT IN list if you use other terminal states.
  const rows = await db.getAllAsync(
    `
    SELECT
      json_extract(payload, '$.MeterNumber') AS MeterNumber,
      json_extract(payload, '$.ReadingValue') AS ReadingValue,
      json_extract(payload, '$.ReadingDate')  AS ReadingDate,
      json_extract(payload, '$.ReadingTime')  AS ReadingTime,
      json_extract(payload, '$.ReadingDateTime') AS ReadingDateTime,
      created_at
    FROM queued_items
    WHERE role = 'inspector'
      AND kind = 'uploadReading'
      AND clientRef = ?
      AND json_extract(payload, '$.MeterNumber') = ?
      AND IFNULL(status, '') NOT IN ('failed', 'error')
    ORDER BY
      /* Prefer an explicit combined timestamp if present */
      COALESCE(
        ReadingDateTime,

        /* Fallback: build an ISO-like string from date+time if both exist */
        CASE
          WHEN ReadingDate IS NOT NULL AND ReadingTime IS NOT NULL
          THEN (ReadingDate || 'T' || ReadingTime)

          /* Date only? treat as end of the day so it still sorts sensibly */
          WHEN ReadingDate IS NOT NULL
          THEN (ReadingDate || 'T23:59:59')
        END,

        /* Last resort: created_at millis → ISO string for ordering */
        datetime(created_at / 1000, 'unixepoch')
      ) DESC
    LIMIT 1
    `,
    [clientRef, String(meterNumber)]
  )

  const row = rows?.[0]
  if (!row) return null

  const valueNum = Number(row.ReadingValue)
  if (!Number.isFinite(valueNum)) return null

  return {
    value: valueNum,
    date: row.ReadingDate ?? null,
    time: row.ReadingTime ?? null,
    when:
      row.ReadingDateTime ??
      (row.ReadingDate && row.ReadingTime
        ? `${row.ReadingDate}T${row.ReadingTime}`
        : row.ReadingDate ?? null),
  }
}

export async function assertNotLowerThanLastLocal({
  db,
  clientRef,
  meterNumber,
  currentValue, // number or numeric string
}) {
  const last = await getLastLocalReading(db, { clientRef, meterNumber })
  if (!last) return { ok: true, last: null } // no prior reading locally

  const currentNum = Number(currentValue)
  if (!Number.isFinite(currentNum)) {
    return { ok: false, error: 'Invalid current meter reading.' }
  }

  if (currentNum < last.value) {
    return {
      ok: false,
      error: `Reading too low: ${currentNum} < previous ${last.value}${
        last.when ? ` (${last.when})` : ''
      }.`,
      last,
    }
  }

  return { ok: true, last }
}

