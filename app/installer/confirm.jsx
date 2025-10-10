// app/installer/confirm.jsx

import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as MediaLibrary from 'expo-media-library'

import { useInstaller } from '../../src/context/installers/context'
import { useQueue } from '../../src/context/QueueContext'

import ScreenContainer from '../../src/components/screen-container'
import GradientButton from '../../src/components/GradientButton'

import { trySaveToGalleryAsync } from '../../src/utils/photo-storage'
import {
  readingDateISO as rdISO,
  readingTimeISO as rtISO,
} from '../../src/utils/helpers'

function resolveMaybeFn(v) {
  try {
    return typeof v === 'function' ? v() : v
  } catch {
    return v
  }
}

export default function Confirm() {
  const { replace } = useRouter()
  const { enqueue = async () => {} } = useQueue() || {}

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

  // Normalize inputs
  const safeUris = Array.isArray(uris) ? uris : []
  const [selectedPic, setSelectedPic] = useState(
    safeUris.length ? safeUris[0] : null
  )

  // Resolve date/time whether they are strings or functions
  const dateISO = useMemo(() => resolveMaybeFn(rdISO), [])
  const timeISO = useMemo(() => resolveMaybeFn(rtISO), [])

  // Optional: pre-warm media permission when entering this screen
  useEffect(() => {
    ;(async () => {
      const perm = await MediaLibrary.getPermissionsAsync()
      if (perm.status === 'undetermined') {
        try {
          await MediaLibrary.requestPermissionsAsync()
        } catch {}
      }
    })()
  }, [])

  const submit = async () => {
    try {
      // 1) Ensure media permission before saving
      let granted = (await MediaLibrary.getPermissionsAsync()).granted
      if (!granted) {
        const req = await MediaLibrary.requestPermissionsAsync()
        granted = req.granted
      }

      // 2) Save all images (ignore failures)
      if (granted && safeUris.length) {
        await Promise.all(
          safeUris.map(async (u) => {
            try {
              await trySaveToGalleryAsync(u)
            } catch {}
          })
        )
      }

      // 3) Enqueue OK
      await enqueue({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'installer',
        kind: 'reading',
        status: 'ok',
        tries: 1,
        payload: {
          meterNumber: String(newMeterNumber ?? ''),
          readingValue: Number(reading ?? 0),
          readingDateISO: dateISO,
          readingTimeISO: timeISO,
          photoUris: safeUris,
          clientRef: selectedClientRef?.trim?.() ?? null,
        },
      })

      // 4) Reset + nav
      setSelectedClientRef(null)
      setTaking(false)
      setNewMeterNumber('')
      setReading('')
      setSelectedPic(null)
      setUris([])
      replace('/installer/reports')
    } catch (error) {
      // On failure, queue as pending (offline path)
      try {
        await enqueue({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role: 'installer',
          kind: 'reading',
          status: 'pending',
          tries: 0,
          payload: {
            meterNumber: String(newMeterNumber ?? ''),
            readingValue: Number(reading ?? 0),
            readingDateISO: dateISO,
            readingTimeISO: timeISO,
            photoUris: safeUris,
            clientRef: selectedClientRef?.trim?.() ?? null,
          },
        })
      } catch {}

      Alert.alert(
        'Saved offline',
        'Submission stored. You can retry from Reports.'
      )
      replace('/installer/reports')
    }
  }

  const displayDate = (typeof dateISO === 'string' ? dateISO : '')?.slice(0, 10)
  const displayTime = timeISO ? new Date(timeISO).toLocaleTimeString() : ''

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: 16 }}>
        <View style={styles.card}>
          {selectedPic ? (
            <Image
              source={{ uri: selectedPic }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 8,
                marginBottom: 24,
              }}
            />
          ) : (
            <View
              style={{
                width: '100%',
                height: 200,
                borderRadius: 8,
                marginBottom: 24,
                backgroundColor: '#e5eef5',
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
            {safeUris.map((u) => (
              <TouchableOpacity
                key={u}
                onPress={() => setSelectedPic(u)}
                style={{ width: '30%', height: 80, borderRadius: 12 }}
              >
                <Image
                  source={{ uri: u }}
                  style={{ width: '100%', height: '100%', borderRadius: 12 }}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>METER LOGGED:</Text>
            <View style={{ height: 12 }} />
            <Text>Client Ref: {selectedClientRef?.trim?.() ?? '—'}</Text>
            <Text>Meter No: {String(newMeterNumber ?? '—')}</Text>
            <Text>Date: {displayDate || '—'}</Text>
            <Text>Time: {displayTime || '—'}</Text>
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

// // app/installer/confirm.jsx

// // react
// import { useEffect, useState } from 'react'
// import {
//   Alert,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native'

// // expo
// import { useRouter } from 'expo-router'
// import * as MediaLibrary from 'expo-media-library'

// // context
// import { useInstaller } from '../../src/context/installers/context'
// import { useQueue } from '../../src/context/QueueContext'

// // components
// import ScreenContainer from '../../src/components/screen-container'
// import GradientButton from '../../src/components/GradientButton'

// // utils
// import { trySaveToGalleryAsync } from '../../src/utils/photo-storage'
// import { readingDateISO, readingTimeISO, now } from '../../src/utils/helpers'

// function resolveMaybeFn(v) {
//   try {
//     return typeof v === 'function' ? v() : v
//   } catch {
//     return v
//   }
// }

// // Resolve date/time whether they are strings or functions
// const dateISO = useMemo(() => resolveMaybeFn(rdISO), [])
// const timeISO = useMemo(() => resolveMaybeFn(rtISO), [])

// const Confirm = () => {
//   const { replace } = useRouter()
//   const q = useQueue() || {}
//   const enqueue = q.enqueue || (async () => {})
//   const {
//     selectedClientRef,
//     setSelectedClientRef,
//     newMeterNumber,
//     setNewMeterNumber,
//     reading,
//     setReading,
//     uris,
//     setUris,
//     setTaking,
//   } = useInstaller()

//   // Normalize inputs
//   const safeUris = Array.isArray(uris) ? uris : []
//   const [selectedPic, setSelectedPic] = useState(
//     safeUris.length ? safeUris[0] : null
//   )

//   // const [selectedPic, setSelectedPic] = useState(uris[0] || null)

//   // Optional: pre-warm media permission when entering this screen
//   useEffect(() => {
//     ;(async () => {
//       const perm = await MediaLibrary.getPermissionsAsync()
//       if (perm.status === 'undetermined') {
//         try {
//           await MediaLibrary.requestPermissionsAsync()
//         } catch {}
//       }
//     })()
//   }, [])

//   const submit = async () => {
//     try {
//       // 1) Ensure media permission before saving
//       let granted = (await MediaLibrary.getPermissionsAsync()).granted
//       if (!granted) {
//         const req = await MediaLibrary.requestPermissionsAsync()
//         granted = req.granted
//       }

//       // 2) Save all images (ignore failures)
//       if (granted && safeUris.length) {
//         await Promise.all(
//           safeUris.map(async (u) => {
//             try {
//               await trySaveToGalleryAsync(u)
//             } catch {}
//           })
//         )
//       }

//       if (uris?.length) {
//         await Promise.all(uris.map((u) => trySaveToGalleryAsync(u)))
//       }

//       await enqueue({
//         id: `${Date.now()}`,
//         role: 'installer',
//         kind: 'reading',
//         status: 'ok',
//         tries: 1,
//         payload: {
//           meterNumber: String(newMeterNumber ?? ''),
//           readingValue: Number(reading ?? 0),
//           readingDateISO,
//           readingTimeISO,
//           photoUris: uris,
//           clientRef: selectedClientRef,
//         },
//       })
//       setSelectedClientRef(null)
//       setTaking(false)
//       setNewMeterNumber('')
//       setReading('')
//       setSelectedPic(null)
//       setUris([])
//       replace('/installer/reports')
//     } catch (error) {
//       await enqueue({
//         id: `${Date.now()}`,
//         role: 'installer',
//         kind: 'reading',
//         status: 'pending',
//         tries: 0,
//         payload: {
//           meterNumber: String(newMeterNumber ?? ''),
//           readingValue: Number(reading ?? 0),
//           readingDateISO,
//           readingTimeISO,
//           photoUris: uris,
//           clientRef: selectedClientRef,
//         },
//       })
//       Alert.alert(
//         'Saved offline',
//         'Submission stored. You can retry from Reports.'
//       )
//       replace('/installer/reports')
//     }
//   }

//   return (
//     <ScreenContainer>
//       <View style={{ flex: 1, padding: 16 }}>
//         <View style={styles.card}>
//           {uris && (
//             <Image
//               source={{ uri: selectedPic }}
//               style={{
//                 width: '100%',
//                 height: 200,
//                 borderRadius: 8,
//                 marginBottom: 24,
//               }}
//             />
//           )}
//           <View
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//               gap: 8,
//             }}
//           >
//             {uris.map((u, i) => (
//               <TouchableOpacity
//                 key={i}
//                 onPress={() => setSelectedPic(u)}
//                 style={{ width: '30%', height: 80, borderRadius: 12 }}
//               >
//                 <Image
//                   key={i}
//                   source={{ uri: u }}
//                   style={{ width: '100%', height: '100%', borderRadius: 12 }}
//                 />
//               </TouchableOpacity>
//             ))}
//           </View>
//           <View style={styles.card}>
//             <Text style={styles.label}>METER LOGGED:</Text>
//             {/* <Text style={styles.value}>{String(newMeterNumber ?? '—')}</Text> */}
//             <View style={{ height: 12 }} />
//             <Text>Client Ref: {selectedClientRef}</Text>
//             <Text>Meter No: {String(newMeterNumber ?? '—')}</Text>
//             <Text>Date: {readingDateISO.slice(0, 10)}</Text>
//             <Text>Time: {new Date(readingTimeISO).toLocaleTimeString()}</Text>
//           </View>
//           <GradientButton title="Confirm & Upload" onPress={submit} />
//         </View>
//         <View style={{ marginTop: 0, marginHorizontal: 24 }}>
//           <GradientButton
//             title="Back"
//             onPress={() => replace('/installer/camera')}
//           />
//         </View>
//       </View>
//     </ScreenContainer>
//   )
// }

// export default Confirm

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 12,
//     marginVertical: 16,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   label: { color: '#7a8a9a', fontWeight: 'bold' },
//   value: { color: '#000', fontWeight: 'bold', fontSize: 16 },
// })
