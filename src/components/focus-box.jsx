// react
import { StyleSheet, View } from 'react-native'

// dimensions
const squareSize = 228
const cornerLength = 20
const cornerThickness = 3

const FocusBox = () => {
  return (
    <View style={styles.overlay}>
      <View style={styles.focusSquare}>
        <View style={[styles.corner, styles.topLeft]}>
          <View style={styles.lineH} />
          <View style={styles.lineV} />
        </View>
        <View style={[styles.corner, styles.topRight]}>
          <View style={styles.lineH} />
          <View style={styles.lineV} />
        </View>
        <View style={[styles.corner, styles.bottomLeft]}>
          <View style={styles.lineH} />
          <View style={styles.lineV} />
        </View>
        <View style={[styles.corner, styles.bottomRight]}>
          <View style={styles.lineH} />
          <View style={styles.lineV} />
        </View>
      </View>
    </View>
  )
}

export default FocusBox

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusSquare: { width: squareSize, height: squareSize, position: 'relative' },
  corner: { position: 'absolute', width: cornerLength, height: cornerLength },
  lineH: {
    position: 'absolute',
    height: cornerThickness,
    width: cornerLength,
    backgroundColor: '#fff',
  },
  lineV: {
    position: 'absolute',
    width: cornerThickness,
    height: cornerLength,
    backgroundColor: '#fff',
  },
  topLeft: { top: 0, left: 0 },
  topRight: { top: 0, right: 0, transform: [{ rotate: '90deg' }] },
  bottomLeft: { bottom: 0, left: 0, transform: [{ rotate: '-90deg' }] },
  bottomRight: { bottom: 0, right: 0, transform: [{ rotate: '180deg' }] },
})
