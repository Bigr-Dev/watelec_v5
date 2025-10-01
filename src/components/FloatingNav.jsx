// src/components/FloatingNav.jsx
import React from 'react'
import { View, Pressable, Text, StyleSheet, Platform } from 'react-native'
import { useRouter, usePathname } from 'expo-router'
// Optional but recommended if you already have it installed in your app
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

export default function FloatingNav({ DASH, REPORTS }) {
  const router = useRouter()
  const pathname = usePathname()
  const insets = (typeof useSafeAreaInsets === 'function'
    ? useSafeAreaInsets()
    : { bottom: 0 }) || { bottom: 0 }

  // show only on these routes
  // const DASH = '/inspector/dashboard'
  // const REPORTS = '/inspector/reports'
  const visible = pathname === DASH || pathname === REPORTS
  if (!visible) return null

  const isActive = (path) => pathname === path
  const go = (path) => {
    if (pathname !== path) router.replace(path) // avoids stacking duplicates
  }

  const bottom = Math.max(insets.bottom, 12)

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View style={[styles.wrap, { bottom }]}>
        <Pressable
          onPress={() => go(DASH)}
          style={[styles.tab, isActive(DASH) && styles.active]}
        >
          <Ionicons name="home" size={22} />
          <Text style={styles.label}>Dashboard</Text>
        </Pressable>

        <Pressable
          onPress={() => go(REPORTS)}
          style={[styles.tab, isActive(REPORTS) && styles.active]}
        >
          <Ionicons name="list" size={22} />
          <Text style={styles.label}>Reports</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 24,
    padding: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 8 },
    }),
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 16,
  },
  active: { backgroundColor: '#eef7fb' },
  label: { fontWeight: '600' },
})
