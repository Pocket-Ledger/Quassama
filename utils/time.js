export function extractHourMinutePeriod(timeString) {
  if (!timeString) return '';

  const parts = timeString.split(':');
  if (parts.length !== 4) return '';

  const [hour, minute, , period] = parts;
  console.log(`${hour}:${minute} ${period}`);

  return `${hour}:${minute} ${period}`;
}

export const formatDateForDisplay = (date) => {
  if (!date) return null;

  const dateObj = date.toDate ? date.toDate() : new Date(date);

  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short',
  });
};
