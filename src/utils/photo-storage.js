// src/utils/photo-storage.js
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'

const APP_PHOTO_DIR = FileSystem.documentDirectory + 'meter-photos'

export async function ensurePhotoDir() {
  const info = await FileSystem.getInfoAsync(APP_PHOTO_DIR)
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(APP_PHOTO_DIR, { intermediates: true })
  }
  return APP_PHOTO_DIR
}

export async function saveToAppStorageAsync(
  localUri,
  nameHint = `meter_${Date.now()}.jpg`
) {
  await ensurePhotoDir()
  const dest = `${APP_PHOTO_DIR}/${nameHint}`
  await FileSystem.copyAsync({ from: localUri, to: dest })
  return dest
}

export async function trySaveToGalleryAsync(localUri) {
  // In Expo Go on Android 13+, this may not be fully available; we gate with permission.
  const ok = (await MediaLibrary.getPermissionsAsync()).granted
    ? true
    : (await MediaLibrary.requestPermissionsAsync()).granted

  if (ok) {
    await Promise.all(uris.map((u) => MediaLibrary.createAssetAsync(u)))
  }

  try {
    const asset = await MediaLibrary.createAssetAsync(localUri)
    const album = await MediaLibrary.getAlbumAsync('Watelec')
    if (album) {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false)
    } else {
      await MediaLibrary.createAlbumAsync('Watelec', asset, false)
    }
    return { saved: true, assetId: asset.id }
  } catch (e) {
    console.warn('Save to gallery failed', e)
    return { saved: false, reason: 'save-failed' }
  }
}
