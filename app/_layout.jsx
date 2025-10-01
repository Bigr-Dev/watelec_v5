// react
import { ImageBackground, StyleSheet, View } from 'react-native'

// expo
import { Stack } from 'expo-router'

// context
import AuthProvider from '../src/context/auth/provider'
import { QueueProvider } from '../src/context/QueueContext'
import { SQLiteProvider } from 'expo-sqlite'

// db migration
import { migrateDbIfNeeded } from '../src/config/db'

// images
const bg = require('../assets/splash.png')

const _layout = () => {
  return (
    <SQLiteProvider databaseName="watelec.db" onInit={migrateDbIfNeeded}>
      <QueueProvider>
        <AuthProvider>
          <ImageBackground source={bg} resizeMode="cover" style={{ flex: 1 }}>
            <View style={styles.overlay}>
              <Stack screenOptions={{ headerShown: false }} />
            </View>
          </ImageBackground>
        </AuthProvider>
      </QueueProvider>
    </SQLiteProvider>
  )
}

export default _layout

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(255,255,255,0.9)' },
})
