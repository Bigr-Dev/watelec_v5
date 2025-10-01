import * as ImageManipulator from 'expo-image-manipulator'
import * as FileSystem from 'expo-file-system/legacy'

export async function makeThumbnail(uri) {
  const { uri: thumbUri } = ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 256 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  )
  // Move to app docs so it persists
  const dest = `${FileSystem.documentDirectory}thumb_${Date.now()}.jpg`
  await FileSystem.copyAsync({ from: thumbUri, to: dest })
  return dest
}
