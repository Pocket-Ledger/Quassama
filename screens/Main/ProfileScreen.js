import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Logout from 'models/auth/Logout';
import User from 'models/auth/user';
import LogoutModal from 'components/LogoutModal';
import { useAlert } from 'hooks/useAlert';
import CustomAlert from 'components/CustomALert';
import { useTranslation } from 'react-i18next';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  console.log('User', user);

  // Add custom alert hook
  const { alertConfig, showSuccess, showError, hideAlert } = useAlert();

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

  // Get current language display name
  const getCurrentLanguageDisplayName = () => {
    const currentLang = i18n.language;
    switch (currentLang) {
      case 'en':
        return t('languages.english');
      case 'ar':
        return t('languages.arabic');
      case 'fr':
        return t('languages.french');
      default:
        return t('languages.english');
    }
  };

  const menuItems = [
    {
      id: 'profile',
      title: t('profile.profile'),
      icon: 'user',
      hasArrow: true,
      action: () => navigation.navigate('ProfileDetails'),
    },
    {
      id: 'settings',
      title: t('profile.settings'),
      icon: 'settings',
      hasArrow: true,
      hasNotification: true,
      action: () => navigation.navigate('Settings'),
    },
    {
      id: 'language',
      title: t('profile.language'),
      icon: 'globe',
      hasArrow: true,
      //rightText: getCurrentLanguageDisplayName(),
      action: () => navigation.navigate('Languages'),
    },
    {
      id: 'darkmode',
      title: t('profile.darkMode'),
      icon: 'moon',
      hasSwitch: true,
      switchValue: isDarkMode,
      onSwitchChange: setIsDarkMode,
    },
  ];

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    const logoutInstance = new Logout();
    try {
      await logoutInstance.logout();
      setShowLogoutModal(false);
      // Use custom success alert instead of native Alert
      showSuccess(t('alerts.success'), t('logout.success'));
    } catch (error) {
      // Use custom error alert instead of native Alert
      showError(t('alerts.error'), t('logout.error'));
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
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
            style={{ backgroundColor: isLoadingUser ? '#E5E5E5' : userProfile.color }}>
            {isLoadingUser ? (
              <View className="h-8 w-8 rounded-full bg-gray-300" />
            ) : (
              <Text className="font-dmsans-bold text-2xl text-white">{userProfile.initial}</Text>
            )}
          </View>

          {/* Profile Name and Email */}
          {isLoadingUser ? (
            <>
              <View className="mb-2 h-6 w-48 rounded bg-gray-200" />
              <View className="h-4 w-64 rounded bg-gray-200" />
            </>
          ) : (
            <>
              <Text className="mb-2 font-dmsans-bold text-xl text-black">
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
              className="mb-1 flex-row items-center justify-between border-b border-gray-250 py-4"
              onPress={item.action}
              disabled={item.hasSwitch}>
              <View className="flex-row items-center">
                {/* Icon */}
                <View className="mr-4 h-10 w-10 items-center justify-center">
                  <Feather name={item.icon} size={20} color="#666" />
                </View>

                {/* Title */}
                <Text className="text-lg font-normal text-black">{item.title}</Text>
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
          <TouchableOpacity className="mb-1 flex-row items-center py-4" onPress={handleLogoutPress}>
            <View className="mr-4 h-10 w-10 items-center justify-center">
              <Feather name="log-out" size={20} color="#FF3B30" />
            </View>
            <Text className="text-lg font-normal text-error">{t('profile.logout')}</Text>
          </TouchableOpacity>

          {/* Bottom Spacing */}
          <View className="h-20" />
        </View>
      </ScrollView>

      {/* Logout Modal - Keep this for logout confirmation */}
      <LogoutModal
        visible={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />

      {/* Custom Alert - Add this for success/error messages */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
        onConfirm={alertConfig.onConfirm}
        showCancel={alertConfig.showCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;
