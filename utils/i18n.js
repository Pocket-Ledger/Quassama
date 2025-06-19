import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en/translation.json';
import ar from './locales/ar/translation.json';
import fr from './locales/fr/translation.json';

const LANGUAGE_PREFERENCE = 'appLanguage';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async callback => {
    const saved = await AsyncStorage.getItem(LANGUAGE_PREFERENCE);
    const lng = saved || 'en';
    callback(lng);
  },
  init: () => {},
  cacheUserLanguage: async lng => {
    await AsyncStorage.setItem(LANGUAGE_PREFERENCE, lng);
  },
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

export default i18n;
