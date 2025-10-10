import { Image, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useMemo, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQueue } from '../../src/context/QueueContext'
import ScreenContainer from '../../src/components/screen-container'
import GradientButton from '../../src/components/GradientButton'

const Details = () => {
  const { id } = useLocalSearchParams()
  const { items = [] } = useQueue() || {}
  const q = useQueue() || {}
  const router = useRouter()

  // Tolerate either q.queue or q.items
  const list = useMemo(() => {
    if (Array.isArray(q.queue) && q.queue.length) return q.queue
    if (Array.isArray(q.items)) return q.items
    return []
  }, [q.queue, q.items])

  // const item = list.find((x) => String(x?.id) === String(id))
  const item = useMemo(() => {
    return items?.find((x) => (x.id || `ts_${x.createdAt}`) === id)
  }, [items, id])
  const it = item?.payload ?? item
  console.log('item :>> ', item)
  const [meterNumber, setMeterNumber] = useState(String(it?.meterNumber ?? ''))
  const [readingValue, setReadingValue] = useState(
    it?.readingValue != null ? String(it.readingValue) : ''
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

  const doRetry = async () => {
    const ok = await retry(item.id)
    Alert.alert(
      ok ? 'Uploaded' : 'Failed',
      ok ? 'Uploaded successfully' : 'Still failing.'
    )
    if (ok) router.back()
  }

  const del = async () => {
    await remove(item.id)
    router.back()
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
              alignItems: 'center ',
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
                  save()
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
