// react
import {
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// expo
import { useRouter } from 'expo-router'

// context
import { useAuth } from '../context/auth/context'

// images
const watelec_bg = require('../../assets/splash.png')
const watelec_logo = require('../../assets/logo-icon.png')

// components
import GradientButton from '../../src/components/GradientButton'
import { useState } from 'react'

const SigninScreen = ({ subtitle }) => {
  const { back } = useRouter()
  const {
    ClientReferences,
    role,
    setRole,
    auth: { loading },
    handleLogin,
  } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = async () => {
    await handleLogin({ email, password })
  }

  return (
    <SafeAreaView style={{ flex: 1, width: '100%', height: '100%' }}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ImageBackground
          source={watelec_bg}
          resizeMethod="contain"
          style={{
            flex: 1,
          }}
        >
          <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#00000015' }}
            behavior="padding"
          >
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
              }}
            >
              <View
                style={{
                  marginTop: '15%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image
                  source={watelec_logo}
                  style={{ width: 80, height: 80 }}
                  resizeMode="contain"
                />
                <Text style={styles.appTitle}>WATELEC</Text>
              </View>
              <View
                style={{
                  marginTop: 20,
                  marginHorizontal: 24,

                  padding: 16,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: 16,
                }}
              >
                <View style={{ marginBottom: 10, alignItems: 'center' }}>
                  <Text style={styles.subtitle}>{subtitle}</Text>
                  <Text style={styles.appTitle}>LOGIN</Text>
                </View>
                <View style={{ width: '100%', marginBottom: 20 }}>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor={'#999'}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor={'#999'}
                    secureTextEntry
                  />
                </View>
                <View style={{ width: '100%' }}>
                  <GradientButton
                    title={
                      loading
                        ? '...'
                        : 'SUBMIT METER READING'.replace(
                            'SUBMIT METER READING',
                            'LOGIN'
                          )
                    }
                    onPress={submit}
                  />
                </View>
                <View style={{ width: '100%', marginTop: 12 }}>
                  <TouchableOpacity
                    onPress={() => {
                      back()
                      setRole()
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        color: '#7a8a9a',
                        textDecorationLine: 'underline',
                      }}
                    >
                      Back
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </ImageBackground>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
}

export default SigninScreen

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,

    fontSize: 16,
    width: '100%',
    color: '#333',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    letterSpacing: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e95c9',

    marginBottom: 30,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    letterSpacing: 1,
  },
  registerButton: {
    paddingVertical: 20,
  },
  registerText: {
    color: '#0088CC',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
})
