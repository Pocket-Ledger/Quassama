import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

const CategoryItem = ({ category, isSelected, onPress, size = 'medium', showName = true }) => {
  // Size configurations
  const sizeConfig = {
    small: {
      container: 'w-[50px] h-[60px]',
      iconContainer: 'h-8 w-8',
      iconSize: 16,
      textSize: 'text-xs',
      padding: 'p-1',
    },
    medium: {
      container: 'w-[61px] h-[78px]',
      iconContainer: 'h-12 w-12',
      iconSize: 20,
      textSize: 'text-sm',
      padding: 'p-1',
    },
    large: {
      container: 'w-[80px] h-[90px]',
      iconContainer: 'h-16 w-16',
      iconSize: 24,
      textSize: 'text-base',
      padding: 'p-2',
    },
  };

  const config = sizeConfig[size];

  return (
    <TouchableOpacity
      className={`${config.container} items-center rounded-lg ${config.padding}`}
      onPress={() => onPress(category.id)}
      activeOpacity={0.7}>
      <View
        className={`${config.iconContainer} mb-2 items-center justify-center rounded-full ${
          isSelected ? 'bg-primary' : 'bg-blue-50'
        }`}>
        <Feather
          name={category.icon === 'plus' ? 'plus' : category.icon}
          size={config.iconSize}
          color={isSelected ? '#ffff' : '#2979FF'}
        />
      </View>
      {showName && (
        <Text
          className={`${config.textSize} text-center  ${
            isSelected ? 'text-primary' : 'text-gray-600'
          }`}
          numberOfLines={1}>
          {category.name}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CategoryItem;
