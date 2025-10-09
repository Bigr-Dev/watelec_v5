// react
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { Picker } from '@react-native-picker/picker'

// expo
import { useRouter } from 'expo-router'

// context
import { useInspector } from '../../src/context/inspectors/context'

// components
import ScreenContainer from '../../src/components/screen-container'
import ScreenLogo from '../../src/components/screen-logo'
import GradientButton from '../../src/components/GradientButton'

const Dashboard = () => {
  const { replace } = useRouter()
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

  const openCamera = () => {
    if (!meterNumber)
      return Alert.alert('Select meter', 'Please select a meter number')
    if (!reading)
      return Alert.alert('Enter reading', 'Please enter the meter reading')
    replace(
      // {
      // pathname:
      '/inspector/camera'
      // params: {
      //   meterNumber,
      //   readingValue: reading,
      //   clientRef: clientRefs[refIndex],
      // },
      //}
    )
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
