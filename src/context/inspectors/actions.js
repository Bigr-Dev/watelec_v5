import * as types from '../../constants/types'

// fetch meters
export const fetchMeterDataStart = () => ({
  type: types.FETCH_READINGS_START,
})
export const fetchMeterDataSuccess = (meters) => ({
  type: types.FETCH_READINGS_SUCCESS,
  payload: meters,
})
export const fetchMeterDataFailure = (error) => ({
  type: types.FETCH_READINGS_FAILURE,
  payload: error,
})

// upload meter reading
export const uploadReadingStart = () => ({
  type: types.UPLOAD_READING_START,
})
export const uploadReadingSuccess = (data) => ({
  type: types.UPLOAD_READING_SUCCESS,
  payload: data ?? {},
})
export const uploadReadingFailure = (error) => ({
  type: types.UPLOAD_READING_FAILURE,
  payload: error,
})
