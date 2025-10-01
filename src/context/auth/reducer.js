import * as types from '../../constants/types'

const authReducer = (state, action) => {
  switch (action.type) {
    // login
    case types.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: false,
      }
    case types.LOGIN_SUCCESS:
      return {
        // ...state,
        role: action.payload.role,
        email: action.payload.email,
        ClientReferences: action.payload.ClientReferences,

        loading: false,
        error: false,
      }
    case types.LOGIN_FAILURE:
      return {
        ...state,
        error_message: action.payload?.Message,
        loading: false,
        error: true,
      }

    case types.LOGOUT:
      return {
        role: null,
        email: '',
        ClientReferences: [],
        loading: false,
        error: null,
      }

    default:
      return { ...state }
  }
}
export default authReducer
