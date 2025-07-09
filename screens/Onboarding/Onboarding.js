import { useNavigation } from '@react-navigation/core'
import React from 'react'
import { View, SafeAreaView, Text, TouchableOpacity, Image, StatusBar } from 'react-native'

const Onboarding = () => {
    const navigation = useNavigation()
    
    // Function to navigate to a specified screen
    const navigateTo = (screenName) => {
        navigation.navigate(screenName)
    }
    
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-end items-center pb-16">

        {/* Title and Description */}
        <View className="w-full mb-16">
          <Text className="text-blue-500 text-4xl font-bold mb-3 text-left">
            Easily Share & Track Expenses with Qassama
          </Text>
          <Text className="text-gray-500 text-left text-base">
            Qassama helps you and your roommates split bills, track purchases, and settle up — all in one place. Simple, smart, and in Darija-friendly style.
          </Text>
        </View>

        {/* Buttons */}
        <View className="w-full space-y-4">
          <TouchableOpacity
            className="bg-blue-500 py-4 rounded-md items-center mb-2"
            onPress={() => navigateTo('Register')}
          >
            <Text className="text-white font-semibold text-base">Create My Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="border border-blue-500 py-4 rounded-md items-center"
            onPress={() => navigateTo('Login')}
          >
            <Text className="text-blue-500 font-semibold text-base">Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Onboarding