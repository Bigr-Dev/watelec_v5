// app/inspector/confirm.jsx

// react
import { Alert, Image, StyleSheet, Text, View } from 'react-native'

// expo
import { useRouter } from 'expo-router'

// context
import { useInspector } from '../../src/context/inspectors/context'
import { useQueue } from '../../src/context/QueueContext'

// components
import ScreenContainer from '../../src/components/screen-container'
import GradientButton from '../../src/components/GradientButton'

// utils
import { trySaveToGalleryAsync } from '../../src/utils/photo-storage'
import { readingDateISO, readingTimeISO, now } from '../../src/utils/helpers'

const Confirm = () => {
  const { replace } = useRouter()
  const q = useQueue() || {}
  const enqueue = q.enqueue || (async () => {})
  const {
    uri,
    meterNumber,
    reading,
    handleUpload,
    setMeterNumber,
    setReading,
    setUri,
    setTaking,
    setThumbUri,
    selectedClientRef,
  } = useInspector()

  const submit = async () => {
    try {
      if (uri) {
        await trySaveToGalleryAsync(uri)
      }
      await handleUpload()

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
          clientRef: selectedClientRef,
        },
      })

      setMeterNumber('')
      setReading('')
      setUri(null)
      setTaking(false)
      setThumbUri(null)
      replace('/inspector/reports')
    } catch (e) {
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
          clientRef: selectedClientRef,
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
          {/* <Text style={styles.value}>{String(meterNumber ?? '—')}</Text> */}
          <View style={{ height: 12 }} />
          <Text>Client: {selectedClientRef ?? '—'}</Text>
          <Text>Meter: {String(meterNumber ?? '—')}</Text>
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
