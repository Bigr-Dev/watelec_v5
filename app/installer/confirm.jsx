// app/installer/confirm.jsx

// react
import { useState } from 'react'
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

// expo
import { useRouter } from 'expo-router'

// context
import { useInstaller } from '../../src/context/installers/context'
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
    selectedClientRef,
    setSelectedClientRef,
    newMeterNumber,
    setNewMeterNumber,
    reading,
    setReading,
    uris,
    setUris,
    setTaking,
  } = useInstaller()

  const [selectedPic, setSelectedPic] = useState(uris[0] || null)

  const submit = async () => {
    try {
      if (uris?.length) {
        await Promise.all(uris.map((u) => trySaveToGalleryAsync(u)))
      }

      await enqueue({
        id: `${Date.now()}`,
        role: 'installer',
        kind: 'reading',
        status: 'ok',
        tries: 1,
        payload: {
          meterNumber: String(newMeterNumber ?? ''),
          readingValue: Number(reading ?? 0),
          readingDateISO,
          readingTimeISO,
          photoUris: uris,
          clientRef: selectedClientRef,
        },
      })
      setSelectedClientRef(null)
      setTaking(false)
      setNewMeterNumber('')
      setReading('')
      setSelectedPic(null)
      setUris([])
      replace('/installer/reports')
    } catch (error) {
      await enqueue({
        id: `${Date.now()}`,
        role: 'installer',
        kind: 'reading',
        status: 'pending',
        tries: 0,
        payload: {
          meterNumber: String(newMeterNumber ?? ''),
          readingValue: Number(reading ?? 0),
          readingDateISO,
          readingTimeISO,
          photoUris: uris,
          clientRef: selectedClientRef,
        },
      })
      Alert.alert(
        'Saved offline',
        'Submission stored. You can retry from Reports.'
      )
      replace('/installer/reports')
    }
  }

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: 16 }}>
        <View style={styles.card}>
          {uris && (
            <Image
              source={{ uri: selectedPic }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 8,
                marginBottom: 24,
              }}
            />
          )}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            {uris.map((u, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedPic(u)}
                style={{ width: '30%', height: 80, borderRadius: 12 }}
              >
                <Image
                  key={i}
                  source={{ uri: u }}
                  style={{ width: '100%', height: '100%', borderRadius: 12 }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>METER LOGGED:</Text>
            {/* <Text style={styles.value}>{String(newMeterNumber ?? '—')}</Text> */}
            <View style={{ height: 12 }} />
            <Text>Client Ref: {selectedClientRef}</Text>
            <Text>Meter No: {String(newMeterNumber ?? '—')}</Text>
            <Text>Date: {readingDateISO.slice(0, 10)}</Text>
            <Text>Time: {new Date(readingTimeISO).toLocaleTimeString()}</Text>
          </View>
          <GradientButton title="Confirm & Upload" onPress={submit} />
        </View>
        <View style={{ marginTop: 0, marginHorizontal: 24 }}>
          <GradientButton
            title="Back"
            onPress={() => replace('/installer/camera')}
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
