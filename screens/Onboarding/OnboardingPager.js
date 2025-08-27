import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';

const { width } = Dimensions.get('window');

const OnboardingPager = () => {
  const navigation = useNavigation();
  const pagerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleSkip = () => {
    navigation.navigate('Onboarding');
  };

  const handleNext = () => {
    if (currentPage < 2) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      navigation.navigate('Onboarding');
    }
  };

  const onPageSelected = (e) => {
    setCurrentPage(e.nativeEvent.position);
  };

  const renderPage = (pageIndex) => {
    const pages = [
      {
        image: require('../../assets/splashImgs/splash.png'),
        title: 'Welcome to Quassama',
        description: 'Manage your group expenses effortlessly. Track, split, and settle bills with ease — all in one place.',
      },
      {
        image: require('../../assets/splashImgs/splash2.png'),
        title: 'Create and Manage Groups',
        description: 'Add friends, family, or colleagues to your groups. Keep everyone on the same page for shared expenses.',
      },
      {
        image: require('../../assets/splashImgs/splash3.png'),
        title: 'Track, Split, Settle Fast',
        description: 'Add friends, family, or colleagues to your groups. Keep everyone on the same page for shared expenses.',
      },
    ];

    const page = pages[pageIndex];

    return (
      <View key={pageIndex} style={{ width }} className="flex-1 bg-white">
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
              source={page.image}
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
              {page.title}
            </Text>
            <Text className="px-4 text-center font-dmsans text-base leading-6 text-gray-500">
              {page.description}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPageIndicators = () => {
    return (
      <View className="mb-8 flex-row justify-center">
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            className={`mx-1 h-2 rounded-full ${
              currentPage === index ? 'w-6 bg-blue-500' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <View className="flex-1">
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={onPageSelected}
          scrollEnabled={true}
        >
          {renderPage(0)}
          {renderPage(1)}
          {renderPage(2)}
        </PagerView>

        {/* Bottom Section */}
        <View className="px-6 pb-8">
          {/* Swipe hint */}
          <Text className="text-center text-sm text-gray-400 mb-2">
            Swipe to navigate or use the buttons below
          </Text>
          
          {/* Page Indicators */}
          {renderPageIndicators()}

          {/* Next/Get Started Button */}
          <TouchableOpacity
            className="items-center rounded-lg bg-blue-500 py-4"
            onPress={handleNext}
          >
            <Text className="font-dmsans-medium text-base text-white">
              {currentPage === 2 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingPager;
