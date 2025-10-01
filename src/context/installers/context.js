// react
import { createContext, useContext } from 'react'

export const initialInstallerState = {
  role: null,
  email: '',
  ClientReferences: [],
  loading: false,
  error: null,
}

// context
export const InstallerContext = createContext(initialInstallerState)

// context provider
export const useInstaller = () => {
  const context = useContext(InstallerContext)
  return context
}
