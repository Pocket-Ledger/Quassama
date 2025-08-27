import React from 'react';
import { View, Text } from 'react-native';

const Avatar = ({
  initial,
  name,
  color = '#2979FF',
  size = 'medium',
  textColor = '#FFFFFF',
  showName = false,
  nameStyle = {},
  style = {},
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      container: 'h-8 w-8',
      text: 'text-sm',
    },
    medium: {
      container: 'h-12 w-12',
      text: 'text-base',
    },
    large: {
      container: 'h-16 w-16',
      text: 'text-xl',
    },
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;

  return (
    <View className="items-center" style={style}>
      <View
        className={`${currentSize.container} mb-1 items-center justify-center rounded-full`}
        style={{ backgroundColor: color }}>
        <Text className={`font-dmsans-bold ${currentSize.text}`} style={{ color: textColor }}>
          {initial}
        </Text>
      </View>
      {showName && name && (
        <Text className="text-center font-dmsans-medium text-sm text-black/50" style={nameStyle}>
          {name}
        </Text>
      )}
    </View>
  );
};

export default Avatar;
