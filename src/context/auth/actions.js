import * as types from '../../constants/types'

// login
export const loginStart = () => ({
  type: types.LOGIN_START,
})
export const loginSuccess = (uid) => ({
  type: types.LOGIN_SUCCESS,
  payload: uid,
})
export const loginFailure = (error) => ({
  type: types.LOGIN_FAILURE,
  payload: error,
})

// logout
export const logout = () => ({
  type: types.LOGOUT,
})
