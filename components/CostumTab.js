import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigationType } from 'hooks/useNavigationType';

export function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { isGestureNavigation } = useNavigationType();

  // Dynamic padding based on navigation type
  const bottomPadding = isGestureNavigation
    ? insets.bottom + 8 // More space for gesture navigation
    : 12; // Standard padding for button navigation

  return (
    <View
      className="flex-row justify-between border-t border-gray-200 bg-white px-4 shadow-box"
      style={{
        paddingTop: 8,
        paddingBottom: bottomPadding,
      }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Get icon based on route name
        const getIcon = () => {
          switch (route.name) {
            case 'Home':
              return isFocused ? 'home' : 'home-outline';
            case 'NewExpense':
              return isFocused ? 'add-circle' : 'add-circle-outline';
            case 'Groups':
              return isFocused ? 'people' : 'people-outline';
            case 'Profile':
              return isFocused ? 'person' : 'person-outline';
            default:
              return 'home-outline';
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            className="flex-1 items-center py-1"
            onPress={onPress}
            activeOpacity={0.7}>
            <View className="relative mb-1">
              <Ionicons name={getIcon()} size={24} color={isFocused ? '#2979FF' : '#00000040'} />
              {/* {route.name === 'Profile' && (
                <View className="absolute -right-2 -top-1.5 h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1">
                  <Text className="text-xs text-white font-dmsans-bold">1</Text>
                </View>
              )} */}
            </View>
            <Text
              className={`font-dmsans-bold text-xs ${isFocused ? ' text-blue-500' : ' text-gray-250'}`}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
