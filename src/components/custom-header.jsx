// react
import { StyleSheet, Text, View } from 'react-native'

// components
import CustomBackBTN from './custom-back-btn'

// Blue header style for pages that should show a header
export const blueHeader = {
  headerShown: true,
  headerStyle: { backgroundColor: '#1e95c9' },
  headerTintColor: '#fff',
  headerTitleStyle: { color: '#fff', fontWeight: '700' },
}

// custom header
export const customHeader = {
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
