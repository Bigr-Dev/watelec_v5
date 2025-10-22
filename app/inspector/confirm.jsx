// app/inspector/confirm.jsx

// react
import { Alert, Image, StyleSheet, Text, TextInput, View } from 'react-native'

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
import { useSQLiteContext } from 'expo-sqlite'
import { getLastLocalReading } from '../../src/context/inspectors/api'

const Confirm = () => {
  const db = useSQLiteContext()
  const { replace, push } = useRouter()
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

  // console.log('reading :>> ', reading)
  // console.log('selectedClientRef :>> ', selectedClientRef)
  const submit = async () => {
    // B) Count how many rows match your expected role/kind
    //   const counts = await db.getAllAsync(`
    //   SELECT role, kind, clientRef, status, COUNT(*) AS n
    //   FROM queued_items
    //   GROUP BY role, kind, clientRef, status
    //   ORDER BY n DESC
    // `)
    // console.log('rows by role/kind/clientRef/status:', counts)
    // Basic input guards
    if (!meterNumber) {
      return Alert.alert('Select meter', 'Please select a meter number')
    }
    if (reading == null || String(reading).trim() === '') {
      return Alert.alert('Enter reading', 'Please enter the meter reading')
    }
    const currentNum = Number(String(reading).replace(',', '.'))
    if (!Number.isFinite(currentNum)) {
      return Alert.alert('Invalid reading', 'Reading must be a number')
    }

    try {
      const last = await getLastLocalReading(db, {
        clientRef: selectedClientRef,
        meterNumber: String(meterNumber).trim(),
      })
      //  console.log('last :>> ', last, currentNum)
      // If a previous reading exists, enforce strictly greater
      if (last && currentNum <= Number(last.value)) {
        const when = last.when ? ` on ${last.when}` : ''
        return Alert.alert(
          'Reading too low',
          `This reading (${currentNum}) is not greater than the last recorded value (${last.value}${when}). Please recheck the meter.`
        )
      }
      //  console.log('uri detected :b4 gallery save>> ', uri)
      if (uri) {
        try {
          await trySaveToGalleryAsync(uri)
        } catch (error) {
          console.log('error :confirm>> ', error)
          Alert.alert('Failed to save photo', error.message)
        }
      }
      // console.log('attempting upload :>> ')
      // console.log('clientRef :>> ', clientRef)
      try {
        await handleUpload()
      } catch (error) {
        console.log('error :confirm>> ', error)
        Alert.alert('Failed to upload reading', error.message)
      }

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
      setMeterNumber('')
      setReading('')
      setUri(null)
      setTaking(false)
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

          <TextInput
            placeholder="Meter Reading"
            style={styles.input}
            keyboardType="numeric"
            value={reading}
            onChangeText={setReading}
            placeholderTextColor={'#333'}
          />
          <View style={{ height: 32 }} />
          <GradientButton
            title="Confirm & Upload"
            onPress={submit}
            disabled={reading ? false : true}
          />
        </View>
        {/* <View style={{ marginTop: 30, marginHorizontal: 24 }}>
          <GradientButton
            title="Back"
            onPress={() => replace('/inspector/camera')}
          />
        </View> */}
        <View style={{ marginBottom: 30 }} />
      </View>
    </ScreenContainer>
  )
}

export default Confirm

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
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
  input: {
    backgroundColor: '#eef2f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#c7d4de',
    height: 52,
    color: '#333',
    marginTop: 16,
  },
})
