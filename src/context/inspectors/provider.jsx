// react
import { useEffect, useReducer, useState } from 'react'

// context
import { useAuth } from '../auth/context'
import { initialInspectorState, InspectorContext } from './context'

// reducer
import inspectorReducer from './reducer'
import { fetchMeters, uploadMeterReading } from './api'

const InspectorProvider = ({ children }) => {
  const {
    auth: { ClientReferences },
  } = useAuth()

  const [inspector, inspectorDispatch] = useReducer(
    inspectorReducer,
    initialInspectorState
  )

  const [selectedClientRef, setSelectedClientRef] = useState(null)
  const [meterOptions, setMeterOptions] = useState(inspector.meters)
  const [meterNumber, setMeterNumber] = useState('')
  const [reading, setReading] = useState('')
  const [taking, setTaking] = useState(false)
  const [uri, setUri] = useState(null)
  const [thumbUri, setThumbUri] = useState(null)

  useEffect(() => {
    if (selectedClientRef !== null) {
      ;(async () => {
        const meters = await fetchMeters({
          selectedClientRef,
          inspectorDispatch,
        })
        setMeterOptions(meters)
      })()
    }
  }, [selectedClientRef])

  // useEffect(() => {
  //   if (uri !== null) {
  //     ;(async () => {
  //       const thumb = await makeThumbnail(uri)

  //       setThumbUri?.(thumb)
  //     })()
  //   }
  // }, [uri])

  const handleUpload = async () => {
    const now = new Date()
    const readingDateISO = now.toISOString().slice(0, 10)
    const readingTimeISO = now.toTimeString().slice(0, 8)

    const meter_reading = {
      MeterNumber: String(meterNumber ?? ''),
      ReadingValue: Number(reading ?? 0),
      ReadingDate: readingDateISO,
      ReadingTime: readingTimeISO,
      uri,
    }

    await uploadMeterReading({ meter_reading, inspectorDispatch })
  }

  return (
    <InspectorContext.Provider
      value={{
        ClientReferences: ClientReferences,
        inspector,
        inspectorDispatch,
        selectedClientRef,
        setSelectedClientRef,
        meterOptions,
        setMeterOptions,
        meterNumber,
        setMeterNumber,
        reading,
        setReading,
        taking,
        setTaking,
        uri,
        thumbUri,
        setThumbUri,
        setUri,
        fetchMeters,
        handleUpload,
      }}
    >
      {children}
    </InspectorContext.Provider>
  )
}

export default InspectorProvider
