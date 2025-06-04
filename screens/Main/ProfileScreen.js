import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Logout from 'models/auth/Logout';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const userProfile = {
    name: 'Essekhyry El Mahdi',
    email: 'essekhyry.mahdi@gmail.com',
    initial: 'M',
    color: '#2979FF',
  };

  const menuItems = [
    {
      id: 'profile',
      title: 'Profile',
      icon: 'user',
      hasArrow: true,
      action: () => navigation.navigate('EditProfile'),
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      hasArrow: true,
      hasNotification: true,
      action: () => navigation.navigate('Settings'),
    },
    {
      id: 'language',
      title: 'Language',
      icon: 'globe',
      hasArrow: true,
      rightText: 'English',
      action: () => navigation.navigate('Language'),
    },
    {
      id: 'darkmode',
      title: 'Dark Mode',
      icon: 'moon',
      hasSwitch: true,
      switchValue: isDarkMode,
      onSwitchChange: setIsDarkMode,
    },
  ];

  const handleLogout = async () => {
    const logoutInstance = new Logout();
    try {
      await logoutInstance.logout();
      Alert.alert('Success', 'You have been logged out.');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="container"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header - Profile Info */}
        <View className="items-center px-4 pb-8 pt-12">
          {/* Profile Avatar */}
          <View
            className="mb-4 h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: userProfile.color }}>
            <Text className="font-dmsans-bold text-2xl text-white">{userProfile.initial}</Text>
          </View>

          {/* Profile Name and Email */}
          <Text className="mb-2 font-dmsans-bold text-xl text-black">{userProfile.name}</Text>
          <Text className="text-base text-gray-500">{userProfile.email}</Text>
        </View>

        {/* Menu Items */}
        <View className="flex-1 px-4">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="mb-1 flex-row items-center justify-between border-b border-gray-250 py-4"
              onPress={item.action}
              disabled={item.hasSwitch}>
              <View className="flex-row items-center">
                {/* Icon */}
                <View className="mr-4 h-10 w-10 items-center justify-center">
                  <Feather name={item.icon} size={20} color="#666" />
                </View>

                {/* Title */}
                <Text className="text-lg text-black">{item.title}</Text>
              </View>

              {/* Right Side Content */}
              <View className="flex-row items-center">
                {/* Notification Dot */}
                {item.hasNotification && <View className="mr-2 h-2 w-2 rounded-full bg-red-500" />}

                {/* Right Text */}
                {item.rightText && (
                  <Text className="mr-2 text-base text-gray-500">{item.rightText}</Text>
                )}

                {/* Switch */}
                {item.hasSwitch && (
                  <Switch
                    value={item.switchValue}
                    onValueChange={item.onSwitchChange}
                    trackColor={{ false: '#E5E5E5', true: '#2979FF' }}
                    thumbColor={item.switchValue ? '#ffffff' : '#ffffff'}
                    ios_backgroundColor="#E5E5E5"
                  />
                )}

                {/* Arrow */}
                {item.hasArrow && <Feather name="chevron-right" size={20} color="#C7C7CC" />}
              </View>
            </TouchableOpacity>
          ))}

          {/* Logout Button */}
          <TouchableOpacity className="mb-1 flex-row items-center py-4" onPress={handleLogout}>
            <View className="mr-4 h-10 w-10 items-center justify-center">
              <Feather name="log-out" size={20} color="#FF3B30" />
            </View>
            <Text className="text-lg text-error">Logout</Text>
          </TouchableOpacity>

          {/* Bottom Spacing */}
          <View className="h-20" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
