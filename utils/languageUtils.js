// utils/languageUtils.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './i18n';

const LANGUAGE_STORAGE_KEY = 'selectedLanguage';

export const languageUtils = {
  // Save language preference
  saveLanguage: async (languageCode) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
      return true;
    } catch (error) {
      console.error('Failed to save language:', error);
      return false;
    }
  },

  // Load saved language preference
  loadSavedLanguage: async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      return savedLanguage;
    } catch (error) {
      console.error('Failed to load saved language:', error);
      return null;
    }
  },

  // Initialize language on app startup
  initializeLanguage: async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && savedLanguage !== i18n.language) {
        await i18n.changeLanguage(savedLanguage);
      }
      return savedLanguage || i18n.language;
    } catch (error) {
      console.error('Failed to initialize language:', error);
      // Return default language instead of throwing
      return 'en';
    }
  },

  // Change and save language
  changeAndSaveLanguage: async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
      return true;
    } catch (error) {
      console.error('Failed to change and save language:', error);
      return false;
    }
  },

  // Clear saved language preference
  clearLanguagePreference: async () => {
    try {
      await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear language preference:', error);
      return false;
    }
  },
};
