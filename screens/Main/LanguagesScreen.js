import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Header from 'components/Header';
import { useTranslation } from 'react-i18next';
import { useRTL } from 'hooks/useRTL'; // Import RTL hook
import i18n from 'utils/i18n';
import { useAlert } from 'hooks/useAlert';
import CustomAlert from 'components/CustomALert';
import { languageUtils } from 'utils/languageUtils';

const LanguagesScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { isRTL, getFlexDirection, getTextAlign, getMargin, getPadding, getIconDirection } =
    useRTL(); // Use RTL hook

  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [isLoading, setIsLoading] = useState(false);

  // Use the custom alert hook
  const { alertConfig, hideAlert, showSuccess, showError } = useAlert();

  const languages = [
    {
      code: 'ar',
      name: 'Arabic',
      flag: '🇲🇦',
      nativeName: 'العربية',
    },
    {
      code: 'en',
      name: 'English',
      flag: '🇺🇸',
      nativeName: 'English',
    },
    {
      code: 'fr',
      name: 'French',
      flag: '🇫🇷',
      nativeName: 'Français',
    },
  ];

  // Load saved language on component mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await languageUtils.loadSavedLanguage();
        if (savedLanguage) {
          setSelectedLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Failed to load saved language:', error);
      }
    };

    loadLanguage();
  }, []);

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.code);
  };

  const handleChangeLanguage = async () => {
    setIsLoading(true);
    try {
      const success = await languageUtils.changeAndSaveLanguage(selectedLanguage);

      if (success) {
        // Use custom success alert
        showSuccess(t('languages.success_title'), t('languages.success_message'), () => {
          hideAlert();
          navigation.goBack();
        });
      } else {
        throw new Error('Failed to change and save language');
      }
    } catch (error) {
      console.error('Language change failed:', error.message);
      // Use custom error alert
      showError(t('languages.error_title'), t('languages.error_message'), () => {
        hideAlert();
      });
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
        <Header title={t('languages.title')} />
        <Text className={`text-sm font-normal ${getTextAlign('left')}`}>
          {t('languages.subtitle')}
        </Text>
        <View className="relative pt-4">
          <View className="form-container">
            {/* Language Options */}
            <View className="mb-6">
              {languages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  className={`mb-2 ${getFlexDirection()} items-center justify-between rounded-lg border p-4 ${
                    selectedLanguage === language.code
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  onPress={() => handleLanguageSelect(language)}>
                  <View className={`${getFlexDirection()} items-center`}>
                    <Text className={`${getMargin('right', '3')} text-2xl`}>{language.flag}</Text>
                    <View>
                      <Text
                        className={`text-lg font-medium ${getTextAlign('left')} ${
                          selectedLanguage === language.code ? 'text-blue-600' : 'text-black'
                        }`}>
                        {language.name}
                      </Text>
                      <Text className={`text-sm text-gray-500 ${getTextAlign('left')}`}>
                        {language.nativeName}
                      </Text>
                    </View>
                  </View>

                  <View
                    className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                      selectedLanguage === language.code
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                    {selectedLanguage === language.code && (
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
                {isLoading ? t('languages.changing') : t('languages.change')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Custom Alert Component */}
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
        isRTL={isRTL} // Pass RTL prop to alert
      />
    </SafeAreaView>
  );
};

export default LanguagesScreen;
