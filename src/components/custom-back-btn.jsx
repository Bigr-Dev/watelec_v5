// react
import { Pressable, View } from 'react-native'

// expo
import { Ionicons } from '@expo/vector-icons'

// custom btn
const CustomBackBTN = ({ title, navigation }) => {
  if (title?.includes('Submission') || title?.includes('Installations')) {
    return (
      <Pressable onPress={navigation.goBack} style={{ width: '20%' }}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </Pressable>
    )
  } else {
    return <View style={{ width: '20%' }}></View>
  }
}
export default CustomBackBTN
