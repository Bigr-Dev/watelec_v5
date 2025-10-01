export const normalizeRef = (s = '') =>
  String(s)
    .replace(/\u00A0/g, ' ') // non-breaking spaces → normal spaces
    .trim() // drop leading/trailing spaces
