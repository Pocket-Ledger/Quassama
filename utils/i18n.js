import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

import en from './locales/en/translation.json';
import ar from './locales/ar/translation.json';
import fr from './locales/fr/translation.json';

const LANGUAGE_PREFERENCE = 'appLanguage';

// Define RTL languages
const RTL_LANGUAGES = ['ar'];

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    const saved = await AsyncStorage.getItem(LANGUAGE_PREFERENCE);
    const lng = saved || 'en';
    callback(lng);
  },
  init: () => {},
  cacheUserLanguage: async (lng) => {
    await AsyncStorage.setItem(LANGUAGE_PREFERENCE, lng);
  },
};

// Function to handle RTL/LTR switching
export const switchLanguageDirection = async (language) => {
  const isRTL = RTL_LANGUAGES.includes(language);

  // Only force restart if the direction needs to change
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);

    // Note: You might need to restart the app for RTL changes to take effect
    // This can be done by showing a modal asking user to restart
    // or using libraries like react-native-restart
    console.log('Language direction changed. App restart may be required.');

    // Uncomment if you're using react-native-restart
    // import RNRestart from 'react-native-restart';
    // RNRestart.Restart();
  }
};

// Function to check if current language is RTL
export const isRTLLanguage = (language = i18n.language) => {
  return RTL_LANGUAGES.includes(language);
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      fr: { translation: fr },
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Handle language change
i18n.on('languageChanged', (lng) => {
  switchLanguageDirection(lng);
});

export default i18n;
