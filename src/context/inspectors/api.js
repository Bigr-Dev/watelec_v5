// actions
import { Alert } from 'react-native'
import { LIST_METERS_BY_CLIENT_URL, UPLOAD_READING_URL } from '../../config/env'
import { uriToBase64 } from '../../utils/uriToBase64'

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
  } catch (error) {
    // inspectorDispatch(
    //   actions.fetchMeterDataFailure(
    //     'something went wrong while fetching meters'
    //   )
    // )
    Alert.alert('Something went wrong while fetching meters', error)
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
      console.log('result :inspector api>> ', result)
    } catch {
      result = { Message: text }
      console.log('result :inspector api>> ', result)
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
