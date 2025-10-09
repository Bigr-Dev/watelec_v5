import { useRouter } from 'expo-router'
import {
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useQueue } from '../../src/context/QueueContext'
import { useCallback, useMemo, useState } from 'react'
import ScreenContainer from '../../src/components/screen-container'
import SegTabs from '../../src/components/seg-tabs'

// images
import bg from '../../assets/splash.png'
import { useAuth } from '../../src/context/auth/context'

const Reports = () => {
  const { role } = useAuth()
  const router = useRouter()
  const { items = [], refresh = async () => {} } = useQueue() || {}
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('pending')

  const data = useMemo(() => {
    // if (tab === 'pending')
    //   return items?.filter(
    //     (i) => i?.status === 'pending' || i?.status === 'failed'
    //   )
    // return items?.filter((i) => i?.status === 'ok')
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
    const it = item?.payload ?? item

    const imgUri = it?.thumbUri ?? it?.photoUris?.[0] ?? null
    //const imgUri = it.photoUri || null // avoid base64 thumbs to reduce memory pressure
    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: '/installer/details',
            params: { id: item?.id ?? `ts_${item?.createdAt}` },
          })
        }
      >
        {imgUri ? (
          <Image source={{ uri: imgUri }} style={styles.thumb} />
        ) : (
          <View style={styles.thumb} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            Meter Number: {it.meterNumber ?? '—'}
          </Text>
          {tab === 'pending' ? (
            <>
              <Text>Reading: {it?.readingValue ?? '—'}</Text>
              <Text>
                Date:{' '}
                {(it?.readingDateISO || it?.readingDate || '').slice(0, 10)}
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
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#00000015' }}
        behavior="padding"
      >
        <View style={{ flex: 1, padding: 16, marginBottom: 95 }}>
          <SegTabs tab={tab} setTab={setTab} />
          <FlatList
            data={data ?? []}
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
      </KeyboardAvoidingView>
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
