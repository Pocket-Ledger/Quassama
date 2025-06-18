import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from 'components/BackButton';
import { useNavigation } from '@react-navigation/native';
import Header from 'components/Header';

const LanguagesScreen = () => {
  const navigation = useNavigation();
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    {
      code: 'en',
      name: 'English',
      flag: '🇺🇸',
      nativeName: 'English',
    },
    {
      code: 'ar',
      name: 'Arabic',
      flag: '🇲🇦',
      nativeName: 'العربية',
    },
    {
      code: 'fr',
      name: 'French',
      flag: '🇫🇷',
      nativeName: 'Français',
    },
    {
      code: 'es',
      name: 'Spanish',
      flag: '🇪🇸',
      nativeName: 'Español',
    },
    {
      code: 'de',
      name: 'German',
      flag: '🇩🇪',
      nativeName: 'Deutsch',
    },
  ];

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.name);
  };

  const handleChangeLanguage = async () => {
    setIsLoading(true);
    try {
      // Add your language change logic here
      // await Language.changeLanguage(selectedLanguage);
      Alert.alert('Success', `Language changed to ${selectedLanguage}`);
      navigation.goBack();
    } catch (error) {
      console.error('Language change failed:', error.message);
      Alert.alert('Error', 'Failed to change language. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="container"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        <Header title="Languages" />
        <Text className="text-sm font-normal">Change the app language.</Text>
        <View className="relative pt-4">
          <View className="form-container">
            {/* Language Options */}
            <View className="mb-6">
              {languages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  className={`mb-2 flex-row items-center justify-between rounded-lg border p-4 ${
                    selectedLanguage === language.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  onPress={() => handleLanguageSelect(language)}>
                  <View className="flex-row items-center">
                    <Text className="mr-3 text-2xl">{language.flag}</Text>
                    <View>
                      <Text
                        className={`text-lg font-medium ${
                          selectedLanguage === language.name ? 'text-blue-600' : 'text-black'
                        }`}>
                        {language.name}
                      </Text>
                      <Text className="text-sm text-gray-500">{language.nativeName}</Text>
                    </View>
                  </View>

                  <View
                    className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                      selectedLanguage === language.name
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                    {selectedLanguage === language.name && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className="btn-primary"
              onPress={handleChangeLanguage}
              disabled={isLoading}>
              <Text className="btn-primary-text">
                {isLoading ? 'Changing...' : 'Change language'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LanguagesScreen;
