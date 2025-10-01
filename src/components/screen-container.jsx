// react
import {
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
} from 'react-native'

// images
import bg from '../../assets/splash.png'

const ScreenContainer = ({ children }) => {
  return (
    <ImageBackground
      source={bg}
      resizeMode="cover"
      imageStyle={{ flex: 1 }}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#00000015' }}
        behavior="padding"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  )
}

export default ScreenContainer

const styles = StyleSheet.create({})
