import React from 'react';
import { Text } from 'react-native';

const Timer = ({ seconds, maxSeconds = 30 }) => {
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isNearLimit = maxSeconds - seconds <= 5;

  return (
    <Text
      className={`font-mono text-3xl font-semibold ${
        isNearLimit ? 'text-red-500' : 'text-gray-800'
      }`}>
      {formatTime(seconds)}
    </Text>
  );
};

export default Timer;
