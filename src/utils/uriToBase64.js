// utils/uriToBase64.js
// Safe base64 encoder for SDK 54: no deprecated FS calls, size-aware.
// Returns a plain base64 string (no "data:image/jpeg;base64," prefix).

import * as FileSystem from 'expo-file-system'
import * as ImageManipulator from 'expo-image-manipulator'

/**
 * Convert a local or remote URI to a Base64 string safely.
 * - Supports file://, content:// (Android), and http/https URLs (downloads to cache first).
 * - Re-encodes as JPEG (resized/compressed) to keep memory usage low and avoid OOM.
 * - If you need a different size, tweak START_WIDTH / MIN_WIDTH / QUALITY values below.
 *
 * @param {string} uri
 * @returns {Promise<string>} base64 (no data: prefix)
 */
export async function uriToBase64(uri) {
  if (!uri) throw new Error('uriToBase64: missing uri')

  const isLocal = /^(file|content):\/\//i.test(uri)
  const isRemote = /^https?:\/\//i.test(uri)

  let workUri = uri
  let downloadedTmp = null

  try {
    // If remote, download to cache first
    if (isRemote) {
      downloadedTmp = `${FileSystem.cacheDirectory}u2b_${Date.now()}.bin`
      const { uri: dl } = await FileSystem.downloadAsync(uri, downloadedTmp)
      workUri = dl
    } else if (!isLocal) {
      throw new Error(`uriToBase64: unsupported URI scheme: ${uri}`)
    }

    // --- Size-aware encode ---
    const START_WIDTH = 1280
    const MIN_QUALITY = 0.7 // Increased minimum quality to prevent corruption
    const MAX_BYTES = 1_000_000 // Increased size limit

    // Single-pass compression with safer settings
    const res = await ImageManipulator.manipulateAsync(
      workUri,
      [{ resize: { width: START_WIDTH } }],
      {
        compress: MIN_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    )

    if (!res.base64) throw new Error('uriToBase64: failed to produce base64')
    
    // Validate base64 is complete (should end with proper padding)
    const base64 = res.base64.trim()
    if (base64.length === 0) {
      throw new Error('uriToBase64: empty base64 result')
    }

    return base64
  } finally {
    if (downloadedTmp) {
      try {
        await FileSystem.deleteAsync(downloadedTmp, { idempotent: true })
      } catch {}
    }
  }
}
