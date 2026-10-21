// Time utility functions for 12-hour AM/PM conversions

export function parse12h(timeStr) {
  if (!timeStr) return { hour: 7, minute: 0, ampm: 'AM' };
  const clean = String(timeStr).trim().toUpperCase();
  if (clean.includes('AM') || clean.includes('PM')) {
    const isPM = clean.includes('PM');
    const [hPart, mPart] = clean.replace(/AM|PM/g, '').trim().split(':');
    let h = parseInt(hPart, 10) || 7;
    const m = parseInt(mPart, 10) || 0;
    return { hour: Math.min(12, Math.max(1, h)), minute: Math.min(59, Math.max(0, m)), ampm: isPM ? 'PM' : 'AM' };
  }
  const [h24, m24] = clean.split(':');
  let h = parseInt(h24, 10) || 7;
  const m = parseInt(m24, 10) || 0;
  const isPM = h >= 12;
  h = h % 12;
  if (h === 0) h = 12;
  return { hour: h, minute: m, ampm: isPM ? 'PM' : 'AM' };
}

export function formatTime12h(timeStr) {
  if (!timeStr) return '--:--';
  const clean = String(timeStr).trim();
  if (/AM|PM/i.test(clean)) return clean.toUpperCase();
  const parts = clean.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] ? parts[1].slice(0, 2).padStart(2, '0') : '00';
  if (isNaN(h)) return clean;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}
