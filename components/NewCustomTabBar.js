import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigationType } from 'hooks/useNavigationType';
import Svg, { Path } from 'react-native-svg';

export function NewCustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { isGestureNavigation } = useNavigationType();
  const colorScheme = useColorScheme();

  // Dynamic padding based on navigation type
  const bottomPadding = isGestureNavigation ? insets.bottom + 8 : 12;

  // Separate tabs into left and right groups
  const leftTabs = ['Home', 'Expenses'];
  const rightTabs = ['Groups', 'Profile'];

  const renderTabButton = (route, index) => {
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
        case 'Expenses':
          return isFocused ? 'receipt' : 'receipt-outline';
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
        className="flex-1 items-center justify-center py-2"
        onPress={onPress}
        activeOpacity={0.7}>
        <View className="relative">
          <Ionicons name={getIcon()} size={24} color={isFocused ? '#ffffff' : '#80CBC4'} />
        </View>
        <Text
          className={`mt-1 font-dmsans-bold text-xs ${isFocused ? 'text-white' : 'text-teal-200'}`}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={{ backgroundColor: '#0f766e' }}
      className="relative bg-white dark:bg-slate-900">
      {/* Main Tab Bar with rounded top */}
      <View className="relative h-16 flex-row items-center bg-white">
        {/* Left Section: Home + Expenses */}
        <Svg
          height="100%"
          width="100%"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            top: 0,
            zIndex: 0,
          }}
          viewBox="0 0 512 80">
          <Path
            fill="#0f766e"
            d="M-2,0 H182 C220,0 235,40 256,40 C277,40 292,0 330,0 H514 V80 H-2 Z"
          />
        </Svg>
        <View className="flex-1 flex-row items-center pr-4">
          {state.routes
            .filter((route) => leftTabs.includes(route.name))
            .map((route, index) => renderTabButton(route, state.routes.indexOf(route)))}
        </View>

        {/* Right Section: Groups + Profile */}
        <View className="flex-1 flex-row items-center pl-4">
          {state.routes
            .filter((route) => rightTabs.includes(route.name))
            .map((route, index) => renderTabButton(route, state.routes.indexOf(route)))}
        </View>

        {/* Floating Action Button (FAB) */}
        <View
          style={{
            position: 'absolute',
            top: -32,
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 10,
          }}>
          {' '}
          {/* Wrapper that ensures transparent top area */}
          {/* Mask: inner circle matches the tab bar background */}
          <TouchableOpacity
            className="h-14 w-14 items-center justify-center rounded-full bg-teal-600 dark:bg-teal-700"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
            onPress={() => navigation.navigate('NewExpense')}
            activeOpacity={0.8}>
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
