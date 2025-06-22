import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';

export function CustomTopTabBar({ state, descriptors, navigation }) {
  return (
    <View className="flex-row justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
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
            className="flex-1 items-center py-2"
            onPress={onPress}
            activeOpacity={0.7}>
            <View className="relative mb-1">
              <Ionicons name={getIcon()} size={24} color={isFocused ? '#2979FF' : '#00000040'} />
              {route.name === 'Profile' && (
                <View className="absolute -right-2 -top-1.5 h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1">
                  <Text className="font-dmsans-bold text-xs text-white">1</Text>
                </View>
              )}
            </View>
            <Text
              className={`font-dmsans-bold text-xs ${
                isFocused ? 'text-blue-500' : 'text-gray-400'
              }`}>
              {label}
            </Text>
            {isFocused && <View className="absolute bottom-0 h-0.5 w-8 rounded-full bg-blue-500" />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
