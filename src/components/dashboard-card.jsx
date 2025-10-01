// react native
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native'

// expo
import { Link } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'

// context
import { useAuth } from '../context/auth/context'

const DashboardCard = ({ img, title, href, children, role }) => {
  const { setRole } = useAuth()
  return (
    <Link style={styles.card} href={href} asChild>
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setRole(href)
        }}
      >
        <LinearGradient
          colors={['#89CEE8', '#1D8FBB']}
          style={styles.cardGradient}
        >
          {children}

          <Text style={styles.cardTitle}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Link>
  )
}
export default DashboardCard

const styles = StyleSheet.create({
  card: {
    width: '45%',
    height: 200,
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: '#ffffff',
  },
  cardGradient: {
    flex: 1,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
    letterSpacing: 0.5,
  },
})
