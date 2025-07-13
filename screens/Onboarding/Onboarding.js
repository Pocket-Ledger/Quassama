import { useNavigation } from '@react-navigation/core';
import React from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Onboarding = () => {
  const navigation = useNavigation();

  // Function to navigate to a specified screen
  const navigateTo = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-end px-6 pb-16">
        {/* Title and Description */}
        <View className="mb-16 w-full">
          <Text className="mb-3 text-left font-dmsans-bold text-4xl text-blue-500">
            Easily Share & Track Expenses with Qassama
          </Text>
          <Text className="text-left font-dmsans text-base text-gray-500 ">
            Qassama helps you and your roommates split bills, track purchases, and settle up — all
            in one place. Simple, smart, and in Darija-friendly style.
          </Text>
        </View>

        {/* Buttons */}
        <View className="w-full space-y-4">
          <TouchableOpacity
            className="mb-2 items-center rounded-md bg-blue-500 py-4"
            onPress={() => navigateTo('Register')}>
            <Text className="font-dmsans-medium text-base text-white">Create My Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center rounded-md border border-blue-500 py-4"
            onPress={() => navigateTo('Login')}>
            <Text className="font-dmsans-medium text-base text-blue-500">Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;
