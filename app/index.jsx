// react
import { StyleSheet, Text, View, Image, ImageBackground } from 'react-native'

// expo
import { useRouter } from 'expo-router'

// icons
import AntDesign from '@expo/vector-icons/AntDesign'
import Octicons from '@expo/vector-icons/Octicons'
import DashboardCard from '../src/components/dashboard-card'

// context
import { useAuth } from '../src/context/auth/context'

// images
const watelec_bg = require('../assets/splash.png')
const watelec_logo = require('../assets/logo-icon.png')

const Index = () => {
  return (
    <ImageBackground
      source={watelec_bg}
      style={styles.backgroundImage}
      resizeMode="cover"
      imageStyle={{ objectFit: 'cover' }}
    >
      <View
        style={{
          marginTop: '15%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={watelec_logo}
          resizeMethod="contain"
          style={{ height: 80, width: 80 }}
        />
        <Text style={styles.title}>WATELEC</Text>
        <Text style={styles.subtitle}>Water Meter Management</Text>
      </View>
      <View style={{ height: '15%' }} />
      <View style={styles.content}>
        <View style={styles.cardsContainer}>
          <DashboardCard title={`INSTALLER`} href={'installer'}>
            <AntDesign name="user-add" size={38} color="white" />
          </DashboardCard>
          <DashboardCard title="READINGS" href={'inspector'}>
            <AntDesign name="user" size={38} color="white" />
          </DashboardCard>
        </View>
      </View>
    </ImageBackground>
  )
}

export default Index

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1e95c9' },
  subtitle: { fontSize: 14, color: '#4c5a66' },
  content: {
    // flex: 1,
    padding: 20,
    // marginTop: '10%',

    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    // flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
    paddingTop: 20,
  },
})
