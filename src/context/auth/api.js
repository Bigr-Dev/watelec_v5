import * as actions from './actions'

import { LOGIN_URL } from '../../config/env'

// fetch current user
export const fetchCurrentUser = async ({
  Email,
  Password,
  role,
  authDispatch,
  replace,
}) => {
  authDispatch(actions.loginStart())
  try {
    if (!Email) {
      alert('login failed: Please enter a valid email address')
      return
    }

    if (!Password) {
      alert('login failed: Please enter a valid password')
      return
    }
    const r = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Email, Password }),
    })
    const result = await r.json()

    if (!result)
      authDispatch(actions.loginFailure('login failed, please try again later'))
    if (result.success === false)
      authDispatch(actions.loginFailure('login failed:', result.Message))

    const userData = {
      role: role,
      email: Email,
      ClientReferences: result.ClientReferences,
    }

    authDispatch(actions.loginSuccess(userData))
    replace(`/${role}/dashboard`)
  } catch (error) {
    authDispatch(actions.loginFailure('login failed:', error?.Message))
    alert('login failed:' + error)
  }
}

// logout user
export const logout = (authDispatch) => {
  authDispatch(actions.logout())
}
