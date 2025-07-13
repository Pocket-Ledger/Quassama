import { AuthProvider } from 'utils/AuthContext';
import './global.css';
import i18n from 'utils/i18n';
import { I18nextProvider } from 'react-i18next';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from 'utils/AppNavigator';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { languageUtils } from 'utils/languageUtils';
import { View, Text } from 'react-native';
import ErrorBoundary from 'components/ErrorBoundary';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [error, setError] = useState(null);
  
  let [fontsLoaded] = useFonts({
    'DM Sans': DMSans_400Regular,
    'DM Sans Medium': DMSans_500Medium,
    'DM Sans Bold': DMSans_700Bold,
    'DM Sans SemiBold': DMSans_600SemiBold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize language
        await languageUtils.initializeLanguage();
        
        // Wait for fonts to load
        if (fontsLoaded) {
          setAppIsReady(true);
        }
      } catch (e) {
        console.error('App initialization error:', e);
        setError(e);
        // Even if there's an error, we should still try to show the app
        setAppIsReady(true);
      }
    }

    prepare();
  }, [fontsLoaded]);

  useEffect(() => {
    if (appIsReady) {
      // Hide the splash screen once the app is ready
      SplashScreen.hideAsync().catch(console.warn);
    }
  }, [appIsReady]);

  // Show loading until everything is ready
  if (!appIsReady) {
    return null;
  }

  // Show error if something went wrong
  if (error) {
    console.warn('App started with error:', error);
    // Continue to show the app even with errors
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <I18nextProvider i18n={i18n}>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </I18nextProvider>
          </GestureHandlerRootView>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
