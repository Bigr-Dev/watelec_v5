// ****************************************
// DATE AND TIME OBJECTS
// ****************************************

// new date
export const now = new Date()

// midnight date-only ISO for ReadingDate
export const readingDateISO = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate()
).toISOString()

// date and time
export const readingTimeISO = now.toISOString()

// DB HELPE FOR METER READING GUARD
export async function getLastLocalReading(db, { clientRef, meterNumber }) {
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
      AND IFNULL(status, '') NOT IN ('failed','error')
    ORDER BY
      COALESCE(
        ReadingDateTime,
        CASE
          WHEN ReadingDate IS NOT NULL AND ReadingTime IS NOT NULL
          THEN (ReadingDate || 'T' || ReadingTime)
          WHEN ReadingDate IS NOT NULL
          THEN (ReadingDate || 'T23:59:59')
        END,
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
    when:
      row.ReadingDateTime ??
      (row.ReadingDate && row.ReadingTime
        ? `${row.ReadingDate}T${row.ReadingTime}`
        : row.ReadingDate ?? null),
  }
}
