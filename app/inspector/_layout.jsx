// app/inspector/_layout.jsx

// react
import { View } from 'react-native'

// expo
import { Stack } from 'expo-router'

// components
import FloatingNav from '../../src/components/FloatingNav'
import InspectorProvider from '../../src/context/inspectors/provider'
import { blueHeader, customHeader } from '../../src/components/custom-header'

export default function InspectorLayout() {
  return (
    <InspectorProvider>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            unmountOnBlur: true,
          }}
        >
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard" options={{ headerShown: false }} />

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
              title: 'Confirm Reading',
            }}
          />
          <Stack.Screen
            name="reports"
            options={{
              ...blueHeader,
              ...customHeader,
              title: 'Inspector Reports',
              unmountOnBlur: true,
            }}
          />
          <Stack.Screen
            name="details"
            options={{
              ...blueHeader,
              ...customHeader,
              title: 'View Submission',
            }}
          />
        </Stack>

        <FloatingNav DASH="/inspector/dashboard" REPORTS="/inspector/reports" />
      </View>
    </InspectorProvider>
  )
}
