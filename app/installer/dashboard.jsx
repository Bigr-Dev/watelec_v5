// react
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native'

// components
import ScreenContainer from '../../src/components/screen-container'
import ScreenLogo from '../../src/components/screen-logo'
import { useRouter } from 'expo-router'

import { useState } from 'react'
import { useInstaller } from '../../src/context/installers/context'
import { Picker } from '@react-native-picker/picker'
import GradientButton from '../../src/components/GradientButton'

const Dashboard = () => {
  const { replace, push } = useRouter()

  const {
    ClientReferences,
    selectedClientRef,
    setSelectedClientRef,
    newMeterNumber,
    setNewMeterNumber,
    // inspector: { loading },
    // selectedClientRef,
    // setSelectedClientRef,
    // meterOptions,
    // meterNumber,
    // setMeterNumber,
    // reading,
    // setReading,
  } = useInstaller()

  const openCamera = () => {
    if (!newMeterNumber)
      return Alert.alert(
        'New meter number missing',
        'Please enter a meter number'
      )
    push('/installer/camera')
  }

  const canSubmit = selectedClientRef && newMeterNumber ? false : true
  return (
    <ScreenContainer>
      <ScreenLogo />
      <View style={styles.wrap}>
        <Text style={styles.label}>
          SELECT THE CLIENT YOU WILL BE INSTALLING A METER FOR
        </Text>
        <Text style={styles.pill}>
          Client Ref: {selectedClientRef || 'select a client ref'}
        </Text>
        <Text style={{ marginBottom: 5 }}>Select Client Ref</Text>
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
        <Text style={{ marginBottom: 5 }}>New Meter Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new meter number"
          value={newMeterNumber}
          onChangeText={setNewMeterNumber}
          keyboardType="number-pad"
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
