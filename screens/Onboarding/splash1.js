import React from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';

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
          <Text className="text-blue-500 text-base font-medium">skip</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 px-6 justify-between">
        {/* Phone Mockup - Takes most of the space */}
        <View className="flex-1 justify-center items-center pt-8">
          <Image
            source={require('../../assets/splashImgs/splash.png')}
            style={{
              width: '90%',
              height: '85%',
              resizeMode: 'contain'
            }}
          />
        </View>

        {/* Title and Description - Bottom section */}
        <View className="pb-4">
          <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
            Welcome to Quassama
          </Text>
          <Text className="text-gray-500 text-center text-base leading-6 px-4">
            Manage your group expenses effortlessly. Track, split, and settle bills with ease — all in one place.
          </Text>
        </View>
      </View>

      {/* Bottom Section */}
      <View className="px-6 pb-8">
        {/* Page Indicators */}
        <View className="flex-row justify-center mb-8">
          <View className="w-6 h-2 bg-blue-500 rounded-full mx-1"></View>
          <View className="w-2 h-2 bg-gray-300 rounded-full mx-1"></View>
          <View className="w-2 h-2 bg-gray-300 rounded-full mx-1"></View>
        </View>

        {/* Next Button */}
        <TouchableOpacity
          className="bg-blue-500 py-4 rounded-lg items-center"
          onPress={handleNext}
        >
          <Text className="text-white font-semibold text-base">Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default splash1