import { Alert, Image, StyleSheet, Text, TextInput, View } from 'react-native'
import { useMemo, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQueue } from '../../src/context/QueueContext'
import ScreenContainer from '../../src/components/screen-container'
import GradientButton from '../../src/components/GradientButton'

import { useInspector } from '../../src/context/inspectors/context'

const fallback_img = require('../../assets/placeholder.webp')

const Details = () => {
  const { id } = useLocalSearchParams()
  const { items = [] } = useQueue() || {}
  const q = useQueue() || {}
  const router = useRouter()

  const { handleUpload, handleRetry } = useInspector()

  // Tolerate either q.queue or q.items
  // const list = useMemo(() => {
  //   if (Array.isArray(q.queue) && q.queue.length) return q.queue
  //   if (Array.isArray(q.items)) return q.items
  //   return []
  // }, [q.queue, q.items])

  // const item = list.find((x) => String(x?.id) === String(id))
  const item = useMemo(() => {
    return items?.find((x) => (x.id || `ts_${x.createdAt}`) === id)
  }, [items, id])
  const it = item?.payload ?? item
  //console.log('it :>> ', it)
  const [meterNumber, setMeterNumber] = useState(String(it?.meterNumber ?? ''))
  const [readingValue, setReadingValue] = useState(
    String(it?.readingValue) || it?.readingValue === 0
      ? String(it?.readingValue)
      : ''
  )

  if (!item)
    return (
      <View style={{ padding: 16 }}>
        <Text>Item not found.</Text>
      </View>
    )

  const update = q.update || (async () => {})
  const retry = q.retry || (async () => false)
  const remove = q.remove || (async () => {})

  const save = async () => {
    await update(item.id, {
      ...(item.payload ?? {}),
      meterNumber: String(meterNumber),
      readingValue: Number(readingValue || 0),
    })
    Alert.alert('Saved', 'Changes saved locally')
  }
  // const meter_reading = {
  //   MeterNumber: String(meterNumber ?? ''),
  //   ReadingValue: Number(readingValue ?? 0),
  //   ReadingDate: it.readingDateISO,
  //   ReadingTime: it.readingTimeISO,
  //   // uri,
  // }
  console.log('meters :>> ', it.readingDateISO)
  const doRetry = async () => {
    try {
      // Validate required data
      if (!it?.photoUri) {
        Alert.alert('Error', 'Photo is required for upload')
        return
      }

      if (!it?.clientRef) {
        Alert.alert('Error', 'Client reference is missing')
        return
      }

      const meter_reading = {
        MeterNumber: String(meterNumber ?? ''),
        ReadingValue: Number(readingValue ?? 0),
        ReadingDate: it.readingDateISO,
        ReadingTime: it.readingTimeISO,
        uri: it.photoUri,
      }
      const clientRef = it?.clientRef
      try {
        await handleRetry(meter_reading, clientRef)
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
      } catch (error) {
        console.log('error :>> ', error)
        Alert.alert('Error', 'Upload failed and could not save changes locally')
      }

      router.back()
    } catch (error) {
      console.error('doRetry failed:', error)
      // Save changes locally as fallback
      try {
        await update(item.id, {
          ...(item.payload ?? {}),
          meterNumber: String(meterNumber),
          readingValue: Number(readingValue || 0),
        })
        Alert.alert(
          'Upload Failed',
          'Changes saved locally. Please try again when you have a better connection.'
        )
      } catch (updateError) {
        console.error('Failed to save locally:', updateError)
        Alert.alert('Error', 'Upload failed and could not save changes locally')
      }
    }

    // const ok = await retry(item.id)
    // Alert.alert(
    //   ok ? 'Uploaded' : 'Failed',
    //   ok ? 'Uploaded successfully' : 'Still failing.'
    // )
    // if (ok) router.back()
  }

  const del = async () => {
    router.back()
    await remove(item.id)
  }

  const previewUri = it?.photoUri
    ? String(it.photoUri)
    : it?.imageBase64
    ? `data:image/jpeg;base64,${it.imageBase64}`
    : undefined

  return (
    <ScreenContainer>
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <View style={styles.card}>
          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={{
                width: '100%',
                height: 220,
                borderRadius: 8,
                marginBottom: 24,
              }}
            />
          ) : null}
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Text style={styles.title}>CLIENT:</Text>
            <Text style={''}>{String(it?.clientRef ?? '')}</Text>
          </View>
          <View style={{ height: 12 }} />
          <Text>Meter Number</Text>
          <TextInput
            value={meterNumber}
            onChangeText={setMeterNumber}
            style={styles.input}
          />
          <Text>Reading</Text>
          <TextInput
            value={readingValue}
            onChangeText={setReadingValue}
            keyboardType="numeric"
            style={styles.input}
          />
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 24,
            }}
          >
            {/* <GradientButton
              title="Save"
              onPress={save}
              style={{ minWidth: '50%' }}
            /> */}
            {item?.status !== 'ok' && (
              <GradientButton
                title="Retry Upload"
                style={{ width: '100%' }}
                onPress={() => {
                  // save()
                  doRetry()
                }}
              />
            )}
          </View>

          <View style={{ height: 8 }} />

          <View style={{ height: 8 }} />
        </View>

        <GradientButton
          title="Delete"
          onPress={del}
          style={{ marginHorizontal: 24, marginBottom: 30 }}
        />
      </View>
    </ScreenContainer>
  )
}

export default Details

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  input: {
    backgroundColor: '#eef2f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#c7d4de',
    height: 52,
  },
  title: { fontWeight: 'bold', marginBottom: 4 },
})
