// app/installer/_layout.jsx

// react
import { View } from 'react-native'

// expo
import { Stack } from 'expo-router'

// components
import FloatingNav from '../../src/components/FloatingNav'
import InstallerProvider from '../../src/context/installers/provider'
import { blueHeader, customHeader } from '../../src/components/custom-header'

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
            options={{
              ...blueHeader,
              ...customHeader,
              title: 'Confirm Installation',
            }}
          />
          <Stack.Screen
            name="reports"
            options={{
              ...blueHeader,
              ...customHeader,
              title: 'Installer Reports',
              unmountOnBlur: true,
            }}
          />
          <Stack.Screen
            name="details"
            options={{
              ...blueHeader,
              ...customHeader,
              title: 'Installations',
            }}
          />
        </Stack>

        <FloatingNav DASH="/installer/dashboard" REPORTS="/installer/reports" />
      </View>
    </InstallerProvider>
  )
}
