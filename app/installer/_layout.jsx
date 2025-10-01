// app/installer/_layout.jsx

// react
import { View } from 'react-native'

// expo
import { Stack } from 'expo-router'

// components
import FloatingNav from '../../src/components/FloatingNav'
import InstallerProvider from '../../src/context/installers/provider'

// header options
const blueHeader = {
  headerShown: true,
  headerStyle: { backgroundColor: '#1e95c9' },
  headerTintColor: '#fff',
  headerTitleStyle: { color: '#fff', fontWeight: '700' },
}

export default function InstallerLayout() {
  return (
    <InstallerProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen
            name="dashboard"
            options={{ headerShown: false, unmountOnBlur: true }}
          />
          <Stack.Screen
            name="camera"
            options={{
              presentation: 'fullScreenModal',
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="confirm"
            options={{ ...blueHeader, title: 'Confirm Installation' }}
          />
          <Stack.Screen
            name="reports"
            options={{
              ...blueHeader,
              title: 'Installer Reports',
              unmountOnBlur: true,
            }}
          />
          <Stack.Screen
            name="details"
            options={{ ...blueHeader, title: 'Edit Installation' }}
          />
        </Stack>

        <FloatingNav DASH="/installer/dashboard" REPORTS="/installer/reports" />
      </View>
    </InstallerProvider>
  )
}
