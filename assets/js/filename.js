function safe(s) {
  return (s || '').toString().trim().replace(/[^A-Za-z0-9_-]+/g, '');
}
function shortId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
export function makeFilename({ formCode, part, lot, ext }) {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g,'').slice(0,15).replace('T','-');
  return `KPI_${safe(formCode)}_${safe(part)}_${safe(lot)}_${stamp}_${shortId()}.${ext}`;
}