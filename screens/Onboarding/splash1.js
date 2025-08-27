import React from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const splash1 = () => {
  const navigation = useNavigation();

  const handleNext = () => {
    navigation.navigate('Splash2');
  };

  const handleSkip = () => {
    navigation.navigate('Onboarding');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Skip Button */}
      <View className="flex-row justify-end p-6">
        <TouchableOpacity onPress={handleSkip}>
          <Text className="font-dmsans-medium text-base text-blue-500">skip</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 justify-between px-6">
        {/* Phone Mockup - Takes most of the space */}
        <View className="flex-1 items-center justify-center pt-8">
          <Image
            source={require('../../assets/splashImgs/splash.png')}
            style={{
              width: '90%',
              height: '85%',
              resizeMode: 'contain',
            }}
          />
        </View>

        {/* Title and Description - Bottom section */}
        <View className="pb-4">
          <Text className="mb-4 text-center font-dmsans-bold text-2xl text-gray-900">
            Welcome to Quassama
          </Text>
          <Text className="px-4 text-center font-dmsans text-base leading-6 text-gray-500">
            Manage your group expenses effortlessly. Track, split, and settle bills with ease — all
            in one place.
          </Text>
        </View>
      </View>

      {/* Bottom Section */}
      <View className="px-6 pb-8">
        {/* Page Indicators */}
        <View className="mb-8 flex-row justify-center">
          <View className="mx-1 h-2 w-6 rounded-full bg-blue-500"></View>
          <View className="mx-1 h-2 w-2 rounded-full bg-gray-300"></View>
          <View className="mx-1 h-2 w-2 rounded-full bg-gray-300"></View>
        </View>

        {/* Next Button */}
        <TouchableOpacity className="items-center rounded-lg bg-blue-500 py-4" onPress={handleNext}>
          <Text className="font-dmsans-medium text-base text-white">Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default splash1;
