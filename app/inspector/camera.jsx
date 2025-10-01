import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useCallback, useRef } from 'react'
import { useInspector } from '../../src/context/inspectors/context'
import { CameraView } from 'expo-camera'
import AntDesign from '@expo/vector-icons/AntDesign'
import { useFocusEffect, useRouter } from 'expo-router'
import { useAuth } from '../../src/context/auth/context'
//import { makeThumbnail } from '../../src/utils/makeThumbnail'
//import * as ImageManipulator from 'expo-image-manipulator'

// dimensions
const squareSize = 228
const cornerLength = 20
const cornerThickness = 3

const Camera = () => {
  const { back, replace } = useRouter()
  const { cameraPermission } = useAuth()
  const { taking, setTaking, setThumbUri, setUri } = useInspector()

  const cameraRef = useRef(null)
  const activeRef = useRef(false)

  useFocusEffect(
    useCallback(() => {
      activeRef.current = true
      return () => {
        activeRef.current = false
      }
    }, [])
  )

  const takePhoto = async () => {
    if (!cameraRef.current || taking || !activeRef.current) return
    try {
      setTaking(true)
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: true,
      })
      // const thumb = await makeThumbnail(photo.uri)
      setUri(photo.uri)
      // setThumbUri?.(thumb)

      replace({
        pathname: '/inspector/confirm',
      })
    } catch (err) {
      Alert.alert('Camera error', String(err?.message || err))
    } finally {
      setTaking(false)
    }
  }
  if (!cameraPermission) {
    return <View style={{ flex: 1, backgroundColor: 'black' }} />
  }

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
          <TouchableOpacity
            style={styles.close}
            onPress={() => replace('/inspector/dashboard')}
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
  close: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    alignItems: 'flex-end',
  },
  shutterBtn: {
    borderColor: '#fff',
    padding: 10,
    borderWidth: 3,
    borderRadius: 50,
  },
})
