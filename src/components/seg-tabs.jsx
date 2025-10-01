import { Pressable, StyleSheet, Text, View } from 'react-native'

const SegTabs = ({ tab, setTab }) => {
  return (
    <View style={styles.tabsWrap}>
      <Pressable
        onPress={() => setTab('pending')}
        style={[styles.tab, tab === 'pending' && styles.tabActive]}
      >
        <Text
          style={[styles.tabLabel, tab === 'pending' && styles.tabLabelActive]}
        >
          Pending
        </Text>
      </Pressable>
      <Pressable
        onPress={() => setTab('uploaded')}
        style={[styles.tab, tab === 'uploaded' && styles.tabActive]}
      >
        <Text
          style={[styles.tabLabel, tab === 'uploaded' && styles.tabLabelActive]}
        >
          Uploaded
        </Text>
      </Pressable>
    </View>
  )
}
export default SegTabs

const styles = StyleSheet.create({
  tabsWrap: {
    flexDirection: 'row',
    backgroundColor: '#eef3f7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    marginTop: 12,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  tabActive: { backgroundColor: '#fff', elevation: 2 },
  tabLabel: { fontWeight: '600', color: '#6b7b8c' },
  tabLabelActive: { color: '#000' },
})
