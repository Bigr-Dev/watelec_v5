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
    // Start fairly compact; adjust if your server allows larger payloads.
    const START_WIDTH = 1280
    const MIN_WIDTH = 640
    const START_QUALITY = 0.75
    const MIN_QUALITY = 0.5
    const MAX_BYTES = 700_000 // cap base64 payload ~<= 700 KB (tune as needed)

    let width = START_WIDTH
    let quality = START_QUALITY

    while (true) {
      const res = await ImageManipulator.manipulateAsync(
        workUri,
        width ? [{ resize: { width } }] : [],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      )

      if (!res.base64) throw new Error('uriToBase64: failed to produce base64')

      // base64 size estimate: ~3/4 of string length
      const approxBytes = Math.ceil((res.base64.length * 3) / 4)
      if (approxBytes <= MAX_BYTES) {
        return res.base64 // no prefix
      }

      // Too big: reduce quality first, then width
      if (quality > MIN_QUALITY + 0.05) {
        quality = Math.max(MIN_QUALITY, quality - 0.1)
        continue
      }
      if (width > MIN_WIDTH) {
        width = Math.max(MIN_WIDTH, Math.floor(width * 0.8))
        quality = START_QUALITY // reset quality when dropping width
        continue
      }

      // Can't shrink further—return best effort
      return res.base64
    }
  } finally {
    if (downloadedTmp) {
      try {
        await FileSystem.deleteAsync(downloadedTmp, { idempotent: true })
      } catch {}
    }
  }
}

// // utils/uriToBase64.js
// import * as FileSystem from 'expo-file-system'
// import { Alert } from 'react-native'

// /**
//  * Convert a local or remote URI to a Base64 string.
//  * - Supports file://, content:// (Android), and http/https URLs.
//  * - Uses a temp download for remote URLs and cleans it up afterward.
//  */
// export async function uriToBase64(uri) {
//   if (!uri) throw new Error('uriToBase64: missing uri')

//   // Local files: file:// or content:// (Android)
//   if (/^(file|content):\/\//i.test(uri)) {
//     return FileSystem.readAsStringAsync(uri, {
//       encoding: FileSystem.EncodingType.Base64,
//     })
//   }

//   // Remote URLs: download to cache first, then read
//   if (/^https?:\/\//i.test(uri)) {
//     const tmp = `${FileSystem.cacheDirectory}u2b_${Date.now()}.bin`
//     try {
//       const { uri: downloaded } = await FileSystem.downloadAsync(uri, tmp)
//       return await FileSystem.readAsStringAsync(downloaded, {
//         encoding: FileSystem.EncodingType.Base64,
//       })
//     } finally {
//       // best-effort cleanup (ignore errors)
//       FileSystem.deleteAsync(tmp, { idempotent: true }).catch(() => {})
//     }
//   }

//   Alert.alert(`uriToBase64: unsupported URI scheme: ${uri}`)
// }
