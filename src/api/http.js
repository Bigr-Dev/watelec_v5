import * as SecureStore from 'expo-secure-store'
import {
  LOGIN_URL,
  UPLOAD_READING_URL,
  LIST_METERS_BY_CLIENT_URL,
  INSTALL_METER_URL,
} from '../config/env'

async function getToken() {
  try {
    return await SecureStore.getItemAsync('@watelec/token')
  } catch (e) {
    return null
  }
}

async function http(url, { method = 'GET', body, headers = {} } = {}) {
  const token = await getToken()
  const h = { 'Content-Type': 'application/json', ...headers }
  if (token) h['Authorization'] = `Bearer ${token}`
  const res = await fetch(url, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    const err = new Error((data && data.message) || `HTTP ${res.status}`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const auth = {
  login: async ({ Email, Password }) => {
    const r = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Email, Password }),
    })
    if (!r.ok) throw new Error(`Login failed: ${r.status}`)
    return r.json()
  },
}

// helpers to clean padded spaces and stray HTML fragments
const stripTags = (s = '') => String(s).replace(/<[^>]*>/g, '')
const cleanNumber = (s = '') =>
  stripTags(s)
    .trim()
    .replace(/[^0-9A-Za-z]/g, '') // keep alphanumerics only
const cleanText = (s = '') =>
  stripTags(s)
    .trim()
    .replace(/\s{2,}/g, ' ')

export const meters = {
  listByClientRef: async (clientRef, token) => {
    const url = LIST_METERS_BY_CLIENT_URL(clientRef)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    try {
      const r = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: controller.signal,
      })
      if (!r.ok) throw new Error(`Meters GET ${r.status}`)
      const json = await r.json()
      if (!Array.isArray(json)) return []
      return json.map((m) => ({
        id: m.MeterId,
        number: cleanNumber(m.MeterNumber),
        address: cleanText(m.Address),
      }))
    } finally {
      clearTimeout(timer)
    }
  },
}
