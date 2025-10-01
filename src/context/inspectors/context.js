// react
import { createContext, useContext } from 'react'

export const initialInspectorState = {
  meters: [],
  MeterNumber: '',
  ReadingValue: 0,
  ReadingDate: undefined,
  ReadingTime: undefined,
  ImageBase64: '',
  loading: false,
  error: null,
}

// context
export const InspectorContext = createContext(initialInspectorState)

// context provider
export const useInspector = () => {
  const context = useContext(InspectorContext)
  return context
}
