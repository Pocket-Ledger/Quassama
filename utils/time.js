export function extractHourMinutePeriod(timeString) {
  if (!timeString) return '';

  const parts = timeString.split(':');
  if (parts.length !== 4) return '';

  const [hour, minute, , period] = parts;
  console.log(`${hour}:${minute} ${period}`);

  return `${hour}:${minute} ${period}`;
}
