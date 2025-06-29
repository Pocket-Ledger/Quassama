import { Timestamp } from 'firebase/firestore';

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

export const formatDateForBackend = (date) => {
  if (!date) return null;

  // Format: "June 19, 2025 at 4:55:48 PM UTC+1"
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  });
};

// Convert JavaScript Date to Firebase Timestamp for filtering
export const dateToTimestamp = (date) => {
  if (!date) return null;

  // Handle different types of date inputs
  let dateObj;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    console.warn('Invalid date format passed to dateToTimestamp:', date);
    return null;
  }

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date passed to dateToTimestamp:', date);
    return null;
  }

  return Timestamp.fromDate(dateObj);
};

export const formatDate = (timestamp) => {
  if (!timestamp) return t('common.unknown');

  const date =
    timestamp instanceof Date
      ? timestamp
      : timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (timestamp) => {
  if (!timestamp) return t('common.unknown');

  const date =
    timestamp instanceof Date
      ? timestamp
      : timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
