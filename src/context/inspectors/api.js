// actions
import { Alert } from 'react-native'
import { LIST_METERS_BY_CLIENT_URL, UPLOAD_READING_URL } from '../../config/env'
import { uriToBase64 } from '../../utils/uriToBase64'
import { useSQLiteContext } from 'expo-sqlite'
// ...

//import { logJsHeap, approxBase64Bytes } from '@/src/utils/heapDebug'

import * as actions from './actions'
//import { approxBase64Bytes, logJsHeap } from '../../utils/heapDebug'

const stripTags = (s = '') => String(s).replace(/<[^>]*>/g, '')
const cleanNumber = (s = '') =>
  stripTags(s)
    .trim()
    .replace(/[^0-9A-Za-z]/g, '') // keep alphanumerics only
const cleanText = (s = '') =>
  stripTags(s)
    .trim()
    .replace(/\s{2,}/g, ' ')

const now = new Date()
// midnight date-only ISO for ReadingDate
const readingDateISO = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate()
).toISOString()
const readingTimeISO = now.toISOString()

// Helper: ensure raw base64 (no data: prefix, no whitespace)
const toRawBase64 = (s) =>
  String(s)
    .replace(/^data:[^;]+;base64,/, '') // drop prefix if present
    .replace(/\s+/g, '') // remove any whitespace/newlines

// fetch meters
export const fetchMeters = async ({ selectedClientRef, inspectorDispatch }) => {
  //inspectorDispatch(actions.fetchMeterDataStart())
  const url = LIST_METERS_BY_CLIENT_URL(selectedClientRef)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const r = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    })
    // if (!r.ok) throw new Error(`Meters GET ${r.status}`)
    const json = await r.json()
    if (!Array.isArray(json)) return []
    const meters = json.map((m) => ({
      id: m.MeterId,
      number: cleanNumber(m.MeterNumber),
      address: cleanText(m.Address),
    }))

    // inspectorDispatch(actions.fetchMeterDataSuccess(meters))
    return meters
  } catch {
    // inspectorDispatch(
    //   actions.fetchMeterDataFailure(
    //     'something went wrong while fetching meters'
    //   )
    // )
    Alert.alert('Something went wring while fetching meters')
  } finally {
    clearTimeout(timer)
  }
}

// get last reading
// getLastLocalReading.js
export async function getLastLocalReading(
  db,
  {
    clientRef, // e.g. "JDW001" (we'll trim both sides)
    meterNumber, // e.g. "0120220620088"
    role = 'inspector',
    kind = 'reading', // <-- matches your data
    windowLimit = 300, // scan up to N recent rows
  }
) {
  // 1) Fetch recent rows for the role+kind; allow clientRef NULL (older rows)
  const trimmedClient = clientRef?.trim() ?? null
  const params = trimmedClient
    ? [role, kind, trimmedClient, windowLimit]
    : [role, kind, windowLimit]

  const rows = await db.getAllAsync(
    `
    SELECT id, clientRef, status, created_at, payload
    FROM queued_items
    WHERE role = ?
      AND kind = ?
      AND IFNULL(status,'') NOT IN ('failed','error')
      AND (
        ? IS NULL
        OR TRIM(clientRef) = ?
      )
    ORDER BY created_at DESC
    LIMIT ?
    `,
    trimmedClient
      ? [role, kind, trimmedClient, trimmedClient, windowLimit]
      : [role, kind, null, null, windowLimit]
  )

  if (!rows?.length) return null

  const wanted = String(meterNumber).trim().toLowerCase()

  const ts = (p, createdAtMs) => {
    // Prefer precise ISO stamps from payload; fall back to created_at
    const t1 = p.readingTimeISO && Date.parse(p.readingTimeISO)
    const t0 = p.readingDateISO && Date.parse(p.readingDateISO)
    if (Number.isFinite(t1)) return t1
    if (Number.isFinite(t0)) return t0
    return Number(createdAtMs) || 0
  }

  let best = null

  for (const r of rows) {
    let p = {}
    try {
      p = JSON.parse(r.payload || '{}')
    } catch {
      continue
    }

    const m = (p.meterNumber ?? p.MeterNumber ?? '')
      .toString()
      .trim()
      .toLowerCase()
    if (!m || m !== wanted) continue

    const value = Number(
      String(p.readingValue ?? p.ReadingValue).replace(',', '.')
    )
    if (!Number.isFinite(value)) continue

    const whenMs = ts(p, r.created_at)
    if (!best || whenMs > best.whenMs) {
      best = {
        value,
        whenMs,
        whenISO: new Date(whenMs).toISOString(),
        rowId: r.id,
        status: r.status,
        clientRef: (r.clientRef || '').trim(),
      }
    }
  }

  return best ? { value: best.value, when: best.whenISO, meta: best } : null
}

// export async function getLastLocalReading(db, { clientRef, meterNumber }) {
//   const rows = await db.getAllAsync(
//     `
//     SELECT
//       json_extract(payload, '$.MeterNumber') AS MeterNumber,
//       json_extract(payload, '$.ReadingValue') AS ReadingValue,
//       json_extract(payload, '$.ReadingDate')  AS ReadingDate,
//       json_extract(payload, '$.ReadingTime')  AS ReadingTime,
//       json_extract(payload, '$.ReadingDateTime') AS ReadingDateTime,
//       created_at
//     FROM queued_items
//     WHERE role = 'inspector'
//       AND kind = 'uploadReading'
//       AND clientRef = ?
//       AND json_extract(payload, '$.MeterNumber') = ?
//       AND IFNULL(status, '') NOT IN ('failed','error')
//     ORDER BY
//       COALESCE(
//         ReadingDateTime,
//         CASE
//           WHEN ReadingDate IS NOT NULL AND ReadingTime IS NOT NULL
//           THEN (ReadingDate || 'T' || ReadingTime)
//           WHEN ReadingDate IS NOT NULL
//           THEN (ReadingDate || 'T23:59:59')
//         END,
//         datetime(created_at / 1000, 'unixepoch')
//       ) DESC
//     LIMIT 1
//     `,
//     [clientRef, String(meterNumber)]
//   )

//   const row = rows?.[0]
//   if (!row) return null

//   const valueNum = Number(row.ReadingValue)
//   if (!Number.isFinite(valueNum)) return null

//   return {
//     value: valueNum,
//     when:
//       row.ReadingDateTime ??
//       (row.ReadingDate && row.ReadingTime
//         ? `${row.ReadingDate}T${row.ReadingTime}`
//         : row.ReadingDate ?? null),
//   }
// }

// upload meter
export const uploadMeterReading = async ({
  db,
  clientRef,
  meter_reading,
  inspectorDispatch,
  allowLower = false, // optional override for meter replacement/rollover
}) => {
  inspectorDispatch(actions.uploadReadingStart())

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    // 1) Get compact base64 (your uriToBase64 now returns plain base64, no prefix)
    const ImageBase64 = await uriToBase64(meter_reading.uri)

    // 2) Build JSON body the API expects (NO data: prefix)
    const body = {
      MeterNumber: meter_reading.MeterNumber,
      ReadingValue: meter_reading.ReadingValue,
      ReadingDate: meter_reading.ReadingDate,
      ReadingTime: meter_reading.ReadingTime,
      ImageBase64,
    }

    // 3) POST
    const r = await fetch(UPLOAD_READING_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    // 4) Handle response explicitly
    const text = await r.text()
    let result
    try {
      result = text ? JSON.parse(text) : {}
    } catch {
      result = { Message: text }
    }

    //console.log('result :>> ', result)
    inspectorDispatch(actions.uploadReadingSuccess({ reading: meter_reading }))
    Alert.alert('Success', 'Meter reading uploaded successfully')
  } catch (error) {
    const message = error?.message || 'Upload failed'
    inspectorDispatch(actions.uploadReadingFailure(message)) // single payload
    Alert.alert(message)
  } finally {
    clearTimeout(timer)
  }
}
