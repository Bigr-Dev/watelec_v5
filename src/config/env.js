import { normalizeRef } from '../utils/strings'

export const API_BASE_AUTH = 'https://portal.watelec.co.za:59897'
export const API_BASE_METERS = 'https://portal.watelec.co.za:57896'

export const LOGIN_URL = `${API_BASE_AUTH}/api/auth/login`
export const UPLOAD_READING_URL = `${API_BASE_METERS}/api/meters/upload`

// ⇩ NEW: meters by clientRef (e.g. JDW001)
export const LIST_METERS_BY_CLIENT_URL = (clientRef) =>
  `${API_BASE_METERS}/api/meters/${encodeURIComponent(normalizeRef(clientRef))}`

// Installer endpoint (placeholder - confirm exact path with backend)
export const INSTALL_METER_URL = `${API_BASE_METERS}/api/meters/install`
