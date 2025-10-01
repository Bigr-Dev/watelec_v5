import { useFocusEffect, useRouter } from 'expo-router'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useAuth } from '../../src/context/auth/context'
import { useInstaller } from '../../src/context/installers/context'
import { useCallback, useEffect, useRef } from 'react'
import AntDesign from '@expo/vector-icons/AntDesign'
import { CameraView } from 'expo-camera'

// dimensions
const squareSize = 228
const cornerLength = 20
const cornerThickness = 3

const Camera = () => {
  const { back, replace, push } = useRouter()
  const { cameraPermission } = useAuth()
  const {
    ClientReferences,
    installer,
    installerDispatch,
    selectedClientRef,
    setSelectedClientRef,
    newMeterNumber,
    setNewMeterNumber,
    reading,
    setReading,
    taking,
    setTaking,
    uri,
    setUri,
    uris,
    setUris,
    thumbUri,
    setThumbUri,
  } = useInstaller()

  const cameraRef = useRef(null)
  const activeRef = useRef(false)

  const pic_count = uris.length

  useFocusEffect(
    useCallback(() => {
      activeRef.current = true
      return () => {
        activeRef.current = false
      }
    }, [])
  )

  // useEffect(() => {
  //   if (pic_count === 2) {
  //     replace('/installer/confirm')
  //   }
  // }, [pic_count])

  const takePhoto = async () => {
    if (!cameraRef.current || taking || !activeRef.current) return
    try {
      setTaking(true)
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: true,
      })
      if (pic_count < 3) setUris((prevUris) => [...prevUris, photo.uri])

      if (pic_count >= 2) {
        push('/installer/confirm')
      }
    } catch (error) {
      Alert.alert('Camera error', String(err?.message || err))
    } finally {
      setTaking(false)
    }
  }

  // if (!activeRef.current)
  //   return <View style={{ flex: 1, backgroundColor: 'black' }} />

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        autofocus="on"
        enableHighQualityPhotos
      />
      <View style={styles.overlay}>
        <View style={styles.focusSquare}>
          <View style={[styles.corner, styles.topLeft]}>
            <View style={styles.lineH} />
            <View style={styles.lineV} />
          </View>
          <View style={[styles.corner, styles.topRight]}>
            <View style={styles.lineH} />
            <View style={styles.lineV} />
          </View>
          <View style={[styles.corner, styles.bottomLeft]}>
            <View style={styles.lineH} />
            <View style={styles.lineV} />
          </View>
          <View style={[styles.corner, styles.bottomRight]}>
            <View style={styles.lineH} />
            <View style={styles.lineV} />
          </View>
        </View>
      </View>
      <View style={styles.layer}>
        <View style={styles.topBar}>
          <View style={styles.count}>
            <Text style={{ color: '#FFF' }}>{pic_count}/3</Text>
          </View>
          <TouchableOpacity
            style={styles.close}
            onPress={() => {
              setUris([])
              replace('/installer/dashboard')
            }}
          >
            <AntDesign name="close-circle" size={32} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={{ padding: 20, marginBottom: 60 }}>
          <TouchableOpacity
            onPress={takePhoto}
            disabled={taking}
            style={styles.shutterBtn}
          >
            <Image
              source={require('../../assets/camera-icon.png')}
              style={{ width: 50, height: 50, opacity: taking ? 0.5 : 1 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default Camera

const styles = StyleSheet.create({
  permBtn: {
    backgroundColor: '#1e95c9',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },

  count: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 45,
    borderColor: '#fff',
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  close: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    // backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusSquare: { width: squareSize, height: squareSize, position: 'relative' },
  corner: { position: 'absolute', width: cornerLength, height: cornerLength },
  lineH: {
    position: 'absolute',
    height: cornerThickness,
    width: cornerLength,
    backgroundColor: '#fff',
  },
  lineV: {
    position: 'absolute',
    width: cornerThickness,
    height: cornerLength,
    backgroundColor: '#fff',
  },
  topLeft: { top: 0, left: 0 },
  topRight: { top: 0, right: 0, transform: [{ rotate: '90deg' }] },
  bottomLeft: { bottom: 0, left: 0, transform: [{ rotate: '-90deg' }] },
  bottomRight: { bottom: 0, right: 0, transform: [{ rotate: '180deg' }] },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBar: {
    width: '100%',
    paddingTop: 60,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shutterBtn: {
    borderColor: '#fff',
    padding: 10,
    borderWidth: 3,
    borderRadius: 50,
  },
})
