import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BottomNavigation = () => {
  const [activeTab, setActiveTab] = useState('Home');

  const tabs = [
    {
      name: 'Home',
      icon: 'home',
      iconActive: 'home',
    },
    {
      name: 'New Expense',
      icon: 'add',
      iconActive: 'add',
    },
    {
      name: 'Groups',
      icon: 'people-outline',
      iconActive: 'people',
    },
    {
      name: 'Profile',
      icon: 'person-outline',
      iconActive: 'person',
      badge: true,
    },
  ];

  const handleTabPress = (tabName) => {
    setActiveTab(tabName);
    // Add your navigation logic here
    console.log(`Navigated to ${tabName}`);
  };

  return (
    <SafeAreaView className="bg-white">
      <View className="flex-row border-t border-gray-200 bg-white px-4 py-2">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            className="flex-1 items-center py-1"
            onPress={() => handleTabPress(tab.name)}
            activeOpacity={0.7}>
            <View className="relative mb-1">
              <Ionicons
                name={activeTab === tab.name ? tab.iconActive : tab.icon}
                size={24}
                color={activeTab === tab.name ? '#007AFF' : '#8E8E93'}
              />
              {tab.badge && (
                <View className="absolute -right-2 -top-1.5 h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1">
                  <Text className="text-xs font-bold text-white">1</Text>
                </View>
              )}
            </View>
            <Text
              className={`text-xs ${
                activeTab === tab.name ? 'font-medium text-blue-500' : 'font-normal text-gray-500'
              }`}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default BottomNavigation;
