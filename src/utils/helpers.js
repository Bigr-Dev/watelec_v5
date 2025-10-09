// ****************************************
// DATE AND TIME OBJECTS
// ****************************************

// new date
export const now = new Date()

// midnight date-only ISO for ReadingDate
export const readingDateISO = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate()
).toISOString()

// date and time
export const readingTimeISO = now.toISOString()
