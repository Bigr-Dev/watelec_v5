// react
import { useEffect, useReducer, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// expo
import { useRouter } from 'expo-router'
import * as MediaLibrary from 'expo-media-library'
import { useCameraPermissions } from 'expo-camera'

// context
import { AuthContext, initialAuthState } from './context'

// reducer
import authReducer from './reducer'

// api
import { fetchCurrentUser } from './api'

import AsyncStorage from '@react-native-async-storage/async-storage'

// export async function clearAsyncStorage() {
//   try {
//     await AsyncStorage.clear()
//     console.log('✅ AsyncStorage cleared')
//   } catch (e) {
//     console.warn('⚠️ Failed to clear AsyncStorage', e)
//   }
// }

const AuthProvider = ({ children }) => {
  const { replace } = useRouter()
  // auth state
  const [auth, authDispatch] = useReducer(authReducer, initialAuthState)
  const [role, setRole] = useState(null)

  const [cameraPermission, requestCameraPermission] = useCameraPermissions()
  const [mediaPermission, requestMediaPermission] =
    MediaLibrary.usePermissions()

  useEffect(() => {
    // Ask once on mount if not granted
    ;(async () => {
      try {
        if (cameraPermission?.status === 'undetermined') {
          await requestCameraPermission()
        }
        if (mediaPermission?.status === 'undetermined') {
          await requestMediaPermission()
        }
      } catch {}
    })()
  }, [cameraPermission?.status, mediaPermission?.status])

  //   if (cameraPermission && cameraPermission.status === 'undetermined') {
  //     requestPermission().catch(() => {})
  //   }

  //   if (mediaPermission && mediaPermission.status !== 'granted') {
  //     requestMediaPermission().catch(() => {})
  //   }
  // }, [cameraPermission?.status])

  // const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync()
  //   let granted = status === 'granted'
  //   if (!granted && canAskAgain) {
  //     const r = await MediaLibrary.requestPermissionsAsync()
  //     granted = r.status === 'granted'
  //   }
  //   if (!granted) return { saved: false, reason: 'permission-denied' }

  // if (!cameraPermission) {
  //   return <View style={{ flex: 1, backgroundColor: 'black' }} />
  // }

  if (!mediaPermission?.granted) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 16, marginBottom: 12, textAlign: 'center' }}>
          Media library permission is required to store photos.
        </Text>
        <TouchableOpacity
          onPress={() => requestMediaPermission()}
          style={styles.permBtn}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Allow Media</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!cameraPermission?.granted) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 16, marginBottom: 12, textAlign: 'center' }}>
          Camera permission is required to take photos.
        </Text>
        <TouchableOpacity
          onPress={() => requestCameraPermission()}
          style={styles.permBtn}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // login
  const handleLogin = ({ email, password }) => {
    fetchCurrentUser({
      Email: email,
      Password: password,
      role: role,
      replace,
      authDispatch,
    })
  }

  return (
    <AuthContext.Provider
      value={{
        auth,
        authDispatch,
        handleLogin,
        role,
        setRole,
        cameraPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider

const styles = StyleSheet.create({
  permBtn: {
    backgroundColor: '#1e95c9',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
})
