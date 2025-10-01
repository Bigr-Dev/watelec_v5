// react
import { View } from 'react-native'

// expo
import { Stack } from 'expo-router'

// components
import FloatingNav from '../../src/components/FloatingNav'
import InspectorProvider from '../../src/context/inspectors/provider'

// Blue header style for pages that should show a header
const blueHeader = {
  headerShown: true,
  headerStyle: { backgroundColor: '#1e95c9' },
  headerTintColor: '#fff',
  headerTitleStyle: { color: '#fff', fontWeight: '700' },
}

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
              title: 'Confirm Reading',
              // header: (h) => {
              //   console.log('h :>> ', h)
              // },
            }}
          />
          <Stack.Screen
            name="reports"
            options={{
              ...blueHeader,
              title: 'Reports / Logs',
              unmountOnBlur: true,
            }}
          />
          <Stack.Screen
            name="details"
            options={{ ...blueHeader, title: 'Edit Submission' }}
          />
        </Stack>

        <FloatingNav DASH="/inspector/dashboard" REPORTS="/inspector/reports" />
      </View>
    </InspectorProvider>
  )
}
