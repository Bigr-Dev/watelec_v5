// app/installer/_layout.jsx

// react
import { Pressable, StyleSheet, View, Text } from 'react-native'

// expo
import { Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

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

const CustomBackBTN = ({ title, navigation }) => {
  if (title?.includes('Installations')) {
    return (
      <Pressable onPress={navigation.goBack} style={{ width: '20%' }}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </Pressable>
    )
  } else {
    return <View style={{ width: '20%' }}></View>
  }
}
const customHeader = {
  header: ({ navigation, options, back }) => {
    return (
      <View style={styles.header}>
        <CustomBackBTN title={options?.title} navigation={navigation} />

        <View style={{ width: '60%', alignItems: 'center' }}>
          <Text style={styles.title}>{options.title ?? 'Reports'}</Text>
        </View>

        <View style={{ width: '20%' }}></View>
      </View>
    )
  },
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

const styles = StyleSheet.create({
  header: {
    height: 90,
    backgroundColor: '#1e95c9',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: '5%',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
  },
})
