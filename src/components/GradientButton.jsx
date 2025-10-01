import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GradientButton({ title, onPress, style, disabled }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[style, disabled && { opacity: 0.5 }]}>
      <LinearGradient colors={['#1e95c9', '#a8dff2']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.btn}>
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: 24, alignItems: 'center' },
  text: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
