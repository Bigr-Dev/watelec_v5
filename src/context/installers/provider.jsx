import { useReducer, useState } from 'react'
import { useAuth } from '../auth/context'
import { initialInstallerState, InstallerContext } from './context'
import installerReducer from './reducer'

const InstallerProvider = ({ children }) => {
  const {
    auth: { ClientReferences },
  } = useAuth()

  const [installer, installerDispatch] = useReducer(
    installerReducer,
    initialInstallerState
  )

  const [selectedClientRef, setSelectedClientRef] = useState(null)
  const [newMeterNumber, setNewMeterNumber] = useState('')
  const [reading, setReading] = useState('')

  const [taking, setTaking] = useState(false)
  const [uri, setUri] = useState(null)
  const [uris, setUris] = useState([])
  const [thumbUri, setThumbUri] = useState(null)

  return (
    <InstallerContext.Provider
      value={{
        ClientReferences,
        installer,
        installerDispatch,
        selectedClientRef,
        setSelectedClientRef,
        newMeterNumber,
        setNewMeterNumber,
        reading,
        setReading,
        taking,
        setTaking,
        uri,
        setUri,
        uris,
        setUris,
        thumbUri,
        setThumbUri,
      }}
    >
      {children}
    </InstallerContext.Provider>
  )
}

export default InstallerProvider
