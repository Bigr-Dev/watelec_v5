import { Alert, Image, StyleSheet, Text, View } from 'react-native'

import ScreenContainer from '../../src/components/screen-container'
import { useRouter } from 'expo-router'
import { useInspector } from '../../src/context/inspectors/context'
import GradientButton from '../../src/components/GradientButton'
import { useQueue } from '../../src/context/QueueContext'
import { trySaveToGalleryAsync } from '../../src/utils/photo-storage'
import { makeThumbnail } from '../../src/utils/makeThumbnail'

const Confirm = () => {
  const { replace } = useRouter()
  const q = useQueue() || {}
  const enqueue = q.enqueue || (async () => {})
  const {
    uri,
    meterNumber,
    reading,
    handleUpload,
    thumbUri,
    setMeterNumber,
    setReading,
    setUri,
    setTaking,
    setThumbUri,
  } = useInspector()

  const now = new Date()
  // midnight date-only ISO for ReadingDate
  const readingDateISO = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString()
  const readingTimeISO = now.toISOString()

  const submit = async () => {
    try {
      if (uri) {
        await trySaveToGalleryAsync(uri)
        // const thumb = await makeThumbnail(uri)
        // console.log('thumb :>> ', thumb)
        // setThumbUri?.(thumb)
      }
      // console.log('thumb :>> ', thumb)
      await handleUpload()

      // if (uri !== null) {
      //     const thumb = await makeThumbnail(uri)
      //     setThumbUri?.(thumb)
      //   }

      await enqueue({
        id: `${Date.now()}`,
        role: 'inspector',
        kind: 'reading',
        status: 'ok',
        tries: 1,
        payload: {
          meterNumber: String(meterNumber ?? ''),
          readingValue: Number(reading ?? 0),
          readingDateISO,
          readingTimeISO,
          photoUri: uri,
          // thumbUri: thumbUri ?? null,
        },
      })

      setMeterNumber('')
      setReading('')
      setUri(null)
      setTaking(false)
      setThumbUri(null)
      replace('/inspector/reports')
    } catch (e) {
      // Queue a lightweight payload using URI, not base64
      // console.log('thumb :>> ', thumb)
      await enqueue({
        id: `${Date.now()}`,
        role: 'inspector',
        kind: 'reading',
        status: 'pending',
        tries: 0,
        payload: {
          meterNumber: String(meterNumber ?? ''),
          readingValue: Number(reading ?? 0),
          readingDateISO,
          readingTimeISO,
          photoUri: uri,
          //    thumbUri: thumbUri ?? null,
        },
      })

      Alert.alert(
        'Saved offline',
        'Submission stored. You can retry from Reports.'
      )
      replace('/inspector/reports')
    }
  }
  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: 16 }}>
        <View style={styles.card}>
          {uri ? (
            <Image
              source={{ uri: uri }}
              style={{
                width: '100%',
                height: 280,
                borderRadius: 8,
                marginBottom: 24,
              }}
            />
          ) : null}
          <Text style={styles.label}>METER LOGGED:</Text>
          <Text style={styles.value}>{String(meterNumber ?? '—')}</Text>
          <View style={{ height: 12 }} />
          <Text>Date: {readingDateISO.slice(0, 10)}</Text>
          <Text>Time: {new Date(readingTimeISO).toLocaleTimeString()}</Text>
          <View style={{ height: 32 }} />
          <GradientButton title="Confirm & Upload" onPress={submit} />
        </View>
        <View style={{ marginTop: 30, marginHorizontal: 24 }}>
          <GradientButton
            title="Back"
            onPress={() => replace('/inspector/camera')}
          />
        </View>
      </View>
    </ScreenContainer>
  )
}

export default Confirm

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: { color: '#7a8a9a', fontWeight: 'bold' },
  value: { color: '#000', fontWeight: 'bold', fontSize: 16 },
})
