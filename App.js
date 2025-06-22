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
import { useEffect } from 'react';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  let [fontsLoaded] = useFonts({
    'DM Sans': DMSans_400Regular,
    'DM Sans Medium': DMSans_500Medium,
    'DM Sans Bold': DMSans_700Bold,
    'DM Sans SemiBold': DMSans_600SemiBold,
  });

  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        // Hide the splash screen once fonts are loaded
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [fontsLoaded]);

  // Don't render the app until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <I18nextProvider i18n={i18n}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </I18nextProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
