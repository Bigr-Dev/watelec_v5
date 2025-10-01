import * as types from '../../constants/types'

const inspectorReducer = (state, action) => {
  switch (action.type) {
    // upload meter reading
    case types.UPLOAD_READING_START:
      return {
        ...state,
        loading: true,
        error: false,
      }
    case types.UPLOAD_READING_SUCCESS:
      return {
        ...state,
        loading: false,
        error: false,
      }
    case types.UPLOAD_READING_FAILURE:
      return {
        ...state,
        loading: false,
        error: true,
      }

    // fetch meter readings
    case types.FETCH_READINGS_START:
      return {
        ...state,
        loading: true,
        error: false,
      }
    case types.FETCH_READINGS_SUCCESS:
      return {
        ...state,
        meters: action.payload,
        loading: false,
        error: false,
      }
    case types.FETCH_READINGS_FAILURE:
      return {
        ...state,
        loading: false,
        error: true,
      }

    // set meter reading
    case types.SET_METER_READING_START:
      return {
        ...state,
        loading: true,
        error: false,
      }
    case types.SET_METER_READING_SUCCESS:
      return {
        ...state,
        meterReading: action.payload,
        loading: false,
        error: false,
      }
    case types.SET_METER_READING_FAILURE:
      return {
        ...state,
        loading: false,
        error: true,
      }

    default:
      return { ...state }
  }
}
export default inspectorReducer
