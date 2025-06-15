import React, { useEffect, useState } from 'react';
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
import User from 'models/auth/user';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoadingUser(true);
      try {
        const userDetails = await User.getUserDetails();
        setUser(userDetails);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  const userProfile = {
    username: user?.username,
    email: user?.email,
    initial: user?.username ? user.username.charAt(0).toUpperCase() : 'M',
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
        <View className="items-center px-4 pt-12 pb-8">
          {/* Profile Avatar */}
          <View
            className="items-center justify-center w-20 h-20 mb-4 rounded-full"
            style={{ backgroundColor: isLoadingUser ? '#E5E5E5' : userProfile.color }}>
            {isLoadingUser ? (
              <View className="w-8 h-8 bg-gray-300 rounded-full" />
            ) : (
              <Text className="text-2xl text-white font-dmsans-bold">{userProfile.initial}</Text>
            )}
          </View>

          {/* Profile Name and Email */}
          {isLoadingUser ? (
            <>
              <View className="w-48 h-6 mb-2 bg-gray-200 rounded" />
              <View className="w-64 h-4 bg-gray-200 rounded" />
            </>
          ) : (
            <>
              <Text className="mb-2 text-xl text-black font-dmsans-bold">
                {userProfile.username}
              </Text>
              <Text className="text-base text-gray-500">{userProfile.email}</Text>
            </>
          )}
        </View>

        {/* Menu Items */}
        <View className="flex-1 px-4">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="flex-row items-center justify-between py-4 mb-1 border-b border-gray-250"
              onPress={item.action}
              disabled={item.hasSwitch}>
              <View className="flex-row items-center">
                {/* Icon */}
                <View className="items-center justify-center w-10 h-10 mr-4">
                  <Feather name={item.icon} size={20} color="#666" />
                </View>

                {/* Title */}
                <Text className="text-lg text-black">{item.title}</Text>
              </View>

              {/* Right Side Content */}
              <View className="flex-row items-center">
                {/* Notification Dot */}
                {item.hasNotification && <View className="w-2 h-2 mr-2 bg-red-500 rounded-full" />}

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
          <TouchableOpacity className="flex-row items-center py-4 mb-1" onPress={handleLogout}>
            <View className="items-center justify-center w-10 h-10 mr-4">
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
