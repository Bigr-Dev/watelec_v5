// react
import { Image, StyleSheet, View } from 'react-native'

// images
import logo from '../../assets/logo.png'

const ScreenLogo = () => {
  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.img} resizeMode="contain" />
    </View>
  )
}

export default ScreenLogo

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  img: { width: 150, height: 150 },
})
