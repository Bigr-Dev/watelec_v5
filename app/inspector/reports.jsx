import {
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import SegTabs from '../../src/components/seg-tabs'
import GradientButton from '../../src/components/GradientButton'
import { useQueue } from '../../src/context/QueueContext'
import { useRouter } from 'expo-router'
import ScreenContainer from '../../src/components/screen-container'
// images
import bg from '../../assets/splash.png'
import { useAuth } from '../../src/context/auth/context'
import { useInspector } from '../../src/context/inspectors/context'

const Reports = () => {
  const { role } = useAuth()
  const router = useRouter()
  const { items = [], refresh = async () => {} } = useQueue() || {}
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('pending')
  const { selectedClientRef } = useInspector()
  console.log('selectedClientRef :>> ', selectedClientRef)

  const data = useMemo(() => {
    if (tab === 'pending') {
      return items.filter(
        (i) =>
          i.role === role && (i.status === 'pending' || i.status === 'failed')
      )
    }
    return items.filter((i) => i.role === role && i.status === 'ok')
  }, [items, tab, role])

  const onRefresh = useCallback(async () => {
    setLoading(true)
    try {
      await refresh()
    } finally {
      setLoading(false)
    }
  }, [refresh])

  const renderItem = ({ item }) => {
    const it = item.payload ?? item
    const imgUri = it.thumbUri || it.photoUri || null

    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: '/inspector/details',
            params: { id: item.id ?? `ts_${item.createdAt}` },
          })
        }
      >
        {imgUri ? (
          <Image source={{ uri: imgUri }} style={styles.thumb} />
        ) : (
          <View style={styles.thumb} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Client: {it.clientRef ?? '—'}</Text>
          <Text>Meter: {it.meterNumber ?? '—'}</Text>
          {tab === 'pending' ? (
            <>
              <Text>Reading: {it.readingValue ?? '—'}</Text>
              <Text>
                Date: {(it.readingDateISO || it.readingDate || '').slice(0, 10)}
              </Text>
            </>
          ) : (
            <Text>Status: uploaded</Text>
          )}
        </View>
      </Pressable>
    )
  }

  return (
    <ImageBackground
      source={bg}
      resizeMode="cover"
      imageStyle={{ flex: 1 }}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, padding: 16, marginBottom: 95 }}>
        <SegTabs tab={tab} setTab={setTab} />
        <FlatList
          data={data}
          keyExtractor={(x, i) => String(x?.id ?? i)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
          initialNumToRender={12}
          windowSize={5}
          removeClippedSubviews
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text
                style={{ textAlign: 'center', marginTop: 24, opacity: 0.6 }}
              >
                No {tab} items
              </Text>
            </View>
          }
          onEndReachedThreshold={0.3}
        />
      </View>
    </ImageBackground>
  )
}

export default Reports

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  thumb: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#e5eef5',
  },
  title: { fontWeight: 'bold', marginBottom: 4 },
  empty: { padding: 24, alignItems: 'center' },
  footer: { padding: 12, borderTopWidth: 1, borderColor: '#eee' },
})
