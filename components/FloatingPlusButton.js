import React from 'react';
import { TouchableOpacity, Text, View, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const FloatingPlusButton = ({
  onPress,
  navigateTo,
  size = 56,
  bottom = 20,
  right = 20,
  icon = '+',
  disabled = false,
  iconSize = 24,
}) => {
  const navigation = useNavigation();
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled) return;

    // Add press animation
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Handle navigation or custom action
    setTimeout(() => {
      if (onPress) {
        onPress();
      } else if (navigateTo) {
        navigation.navigate(navigateTo);
      }
    }, 150);
  };

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: bottom,
        right: right,
        transform: [{ scale: scaleValue }],
      }}>
      <TouchableOpacity
        onPress={handlePress}
        className={`items-center justify-center rounded-full bg-blue-500 shadow-lg ${
          disabled ? 'opacity-50' : ''
        }`}
        style={{
          width: size,
          height: size,
          elevation: disabled ? 4 : 8,
        }}
        activeOpacity={0.8}
        disabled={disabled}>
        {icon === '+' ? (
          <Ionicons name="add" size={iconSize} color="white" />
        ) : (
          <View className="items-center justify-center">{icon}</View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default FloatingPlusButton;
