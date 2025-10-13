// react
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native'
import { Picker } from '@react-native-picker/picker'

// expo
import { useRouter } from 'expo-router'

// context
import { useInspector } from '../../src/context/inspectors/context'

// components
import ScreenContainer from '../../src/components/screen-container'
import ScreenLogo from '../../src/components/screen-logo'
import GradientButton from '../../src/components/GradientButton'
import { useSQLiteContext } from 'expo-sqlite'
import { getLastLocalReading } from '../../src/context/inspectors/api'

const Dashboard = () => {
  const { replace } = useRouter()
  const db = useSQLiteContext()

  //const last = await getLastLocalReading(db, { clientRef, meterNumber })
  const {
    ClientReferences,
    inspector: { loading },

    selectedClientRef,
    setSelectedClientRef,
    meterOptions,

    meterNumber,
    setMeterNumber,
    reading,
    setReading,
  } = useInspector()
  // const checkData = async () => {
  //   const clientRef = selectedClientRef
  //   const data = await getLastLocalReading(db, {
  //     clientRef,
  //     meterNumber,
  //   })
  //   console.log('data :>> ',await data)
  //   return data
  // }
  // checkData()

  // const openCamera = async () => {
  //   if (!meterNumber)
  //     return Alert.alert('Select meter', 'Please select a meter number')
  //   if (!reading)
  //     return Alert.alert('Enter reading', 'Please enter the meter reading')
  //   console.log('test :>> ')
  //   //replace('/inspector/camera')
  //   return
  // }

  const openCamera = async () => {
    // B) Count how many rows match your expected role/kind
    const counts = await db.getAllAsync(`
  SELECT role, kind, clientRef, status, COUNT(*) AS n
  FROM queued_items
  GROUP BY role, kind, clientRef, status
  ORDER BY n DESC
`)
    console.log('rows by role/kind/clientRef/status:', counts)
    // Basic input guards
    if (!meterNumber) {
      return Alert.alert('Select meter', 'Please select a meter number')
    }
    if (reading == null || String(reading).trim() === '') {
      return Alert.alert('Enter reading', 'Please enter the meter reading')
    }

    const currentNum = Number(String(reading).replace(',', '.'))
    if (!Number.isFinite(currentNum)) {
      return Alert.alert('Invalid reading', 'Reading must be a number')
    }

    try {
      const last = await getLastLocalReading(db, {
        clientRef: selectedClientRef,
        meterNumber: String(meterNumber).trim(),
      })
      console.log('last :>> ', last)
      // If a previous reading exists, enforce strictly greater
      if (last && currentNum <= Number(last.value)) {
        const when = last.when ? ` on ${last.when}` : ''
        return Alert.alert(
          'Reading too low',
          `This reading (${currentNum}) is not greater than the last recorded value (${last.value}${when}). Please recheck the meter.`
        )
      }

      // OK to proceed
      replace('/inspector/camera')
    } catch (e) {
      // Fail open if lookup has an unexpected issue (optional: tighten to fail closed)
      console.warn('last-reading check failed:', e?.message || e)
      replace('/inspector/camera')
    }
  }

  const canSubmit = selectedClientRef && meterNumber ? false : true
  return (
    <ScreenContainer>
      <ScreenLogo />
      <View style={styles.wrap}>
        <Text style={styles.label}>
          SELECT THE METER YOU WILL BE INSPECTING
        </Text>
        <Text style={styles.pill}>
          Client Ref: {selectedClientRef || 'select a client ref'}
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            mode="dropdown"
            selectedValue={selectedClientRef}
            onValueChange={setSelectedClientRef}
            style={styles.picker}
          >
            <Picker.Item label="Select client reference" value="" />
            {ClientReferences?.map((ref) => (
              <Picker.Item key={ref} label={ref} value={ref} />
            ))}
          </Picker>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            mode="dropdown"
            enabled={!!selectedClientRef}
            selectedValue={meterNumber}
            onValueChange={setMeterNumber}
            style={styles.picker}
          >
            <Picker.Item
              label={
                loading
                  ? 'Loading meters…'
                  : selectedClientRef
                  ? meterOptions.length
                    ? 'Select a meter'
                    : 'No meters found'
                  : 'Select client first'
              }
              value=""
              style={{ maxWidth: '80%' }}
            />
            {meterOptions?.map((m) => (
              <Picker.Item
                key={m.id ?? m.number}
                label={`${m.number}${m.address ? ` — ${m.address}` : ''}`}
                value={m.number}
              />
            ))}
          </Picker>
        </View>
        <TextInput
          placeholder="Meter Reading"
          style={styles.input}
          keyboardType="numeric"
          value={reading}
          onChangeText={setReading}
          placeholderTextColor={'#333'}
        />
        <GradientButton
          title="SUBMIT METER READING"
          onPress={openCamera}
          disabled={canSubmit}
        />
      </View>
    </ScreenContainer>
  )
}

export default Dashboard

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
    marginHorizontal: 24,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
  },
  label: {
    textAlign: 'center',
    color: '#1e95c9',
    marginBottom: 24,
    fontSize: 16,
  },
  pill: {
    alignSelf: 'center',
    backgroundColor: '#e7f5fc',
    color: '#1e95c9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#eef2f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#c7d4de',
    height: 52,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#BFD5E1',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#fff',
    // maxWidth: '80%',
  },
  picker: { height: 52, color: '#333' },
})
