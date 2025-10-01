// actions
import { Alert } from 'react-native'
import { LIST_METERS_BY_CLIENT_URL, UPLOAD_READING_URL } from '../../config/env'
import { uriToBase64 } from '../../utils/uriToBase64'
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
    alert('Something went wring while fetching meters')
  } finally {
    clearTimeout(timer)
  }
}

// upload meter
export const uploadMeterReading = async ({
  meter_reading,
  inspectorDispatch,
}) => {
  inspectorDispatch(actions.uploadReadingStart())

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    // 1) Get compact base64 (your uriToBase64 now returns plain base64, no prefix)
    // const ImageBase64Raw = await uriToBase64(meter_reading.uri)
    const ImageBase64 = await uriToBase64(meter_reading.uri)
    //const ImageBase64 = toRawBase64(ImageBase64Raw) // normalize just in case

    // console.log(
    //   'b64 length:',
    //   base64.length,
    //   'upload:base64 bytes ≈',
    //   approxBase64Bytes(ImageBase64)
    // )
    // logJsHeap('upload:after-encode')

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

    // if (!r.ok) {
    //   const msg = result?.Message || `Upload failed (${r.status})`
    //   throw new Error(msg)
    // }

    //console.log('result :>> ', result)
    inspectorDispatch(actions.uploadReadingSuccess({ reading: meter_reading }))
    Alert.alert('Success', 'Meter reading uploaded successfully')
    // DROP the base64 reference ASAP so GC can reclaim memory
    //ImageBase64 = null
    //logJsHeap('upload:after-clear')
  } catch (error) {
    const message = error?.message || 'Upload failed'
    inspectorDispatch(actions.uploadReadingFailure(message)) // single payload
    alert(message)
    // return { error: message }
  } finally {
    clearTimeout(timer)
  }

  //  const imageBase64 = uri && (await uriToBase64(uri))http
  // return
}
