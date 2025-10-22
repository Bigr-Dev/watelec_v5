// app/inspector/camera.jsx

// react
import { useCallback, useRef } from 'react'
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native'

// expo
import { CameraView } from 'expo-camera'
import AntDesign from '@expo/vector-icons/AntDesign'
import { useFocusEffect, useRouter } from 'expo-router'

// context
import { useInspector } from '../../src/context/inspectors/context'

// components
import FocusBox from '../../src/components/focus-box'

const Camera = () => {
  const { replace, push } = useRouter()

  const { taking, setTaking, setUri } = useInspector()

  const cameraRef = useRef(null)
  const activeRef = useRef(false)
  // console.log('cameraRef :>> ', cameraRef)
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

      setUri(photo.uri)

      push('/inspector/confirm')
      setTaking(false)
    } catch (err) {
      Alert.alert('Camera error', String(err?.message || err))
      setTaking(false)
    } finally {
      setTaking(false)
    }
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

      <FocusBox />

      <View style={styles.layer}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.close}
            onPress={() => {
              setTaking(false)
              replace('/inspector/dashboard')
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
