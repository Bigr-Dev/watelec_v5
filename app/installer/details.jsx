import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useMemo, useState } from 'react'
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
    if (Array.isArray(q?.queue) && q?.queue?.length) return q?.queue
    if (Array.isArray(q?.items)) return q?.items
    return []
  }, [q?.queue, q?.items])

  // const item = list.find((x) => String(x?.id) === String(id))
  const item = useMemo(() => {
    return items?.find((x) => (x?.id || `ts_${x?.createdAt}`) === id)
  }, [items, id])
  const it = item?.payload ?? item

  const [meterNumber, setMeterNumber] = useState(String(it?.meterNumber ?? ''))
  const [readingValue, setReadingValue] = useState(
    it?.readingValue != null ? String(it?.readingValue) : ''
  )
  const [selectedPic, setSelectedPic] = useState(it?.photoUris?.[0] || null)

  const update = q?.update || (async () => {})
  const retry = q?.retry || (async () => false)
  const remove = q?.remove || (async () => {})

  const save = async () => {
    await update(item?.id, {
      ...(item.payload ?? {}),
      meterNumber: String(meterNumber),
      readingValue: Number(readingValue || 0),
    })
    Alert.alert('Saved', 'Changes saved locally')
  }

  const doRetry = async () => {
    const ok = await retry(item?.id)
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

  if (!item)
    return (
      <View style={{ padding: 16 }}>
        <Text>Item not found.</Text>
      </View>
    )

  return (
    <ScreenContainer>
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <View style={styles.card}>
          {it?.photoUris && (
            <Image
              source={{ uri: selectedPic }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 8,
                marginBottom: 12,
              }}
            />
          )}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              marginBottom: 24,
            }}
          >
            {it?.photoUris?.map((u, i) => (
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
