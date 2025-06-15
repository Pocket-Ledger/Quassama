import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PlusIconButton = ({
  route,
  params = {},
  size = 'w-10 h-10',
  bgColor = 'bg-blue-500',
  iconColor = 'bg-white',
  className = '',
  onPress, // Optional custom onPress handler
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (route) {
      navigation.navigate(route, params);
    }
  };

  return (
    <TouchableOpacity
      className={`${size} ${bgColor} items-center justify-center rounded-full shadow-lg ${className}`}
      onPress={handlePress}
      activeOpacity={0.7}>
      <View className="items-center justify-center">
        <View className={`h-0.5 w-3 ${iconColor} absolute`} />
        <View className={`h-3 w-0.5 ${iconColor} absolute`} />
      </View>
    </TouchableOpacity>
  );
};

export default PlusIconButton;
