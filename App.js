import { AuthProvider } from 'utils/AuthContext';
import './global.css';
import { NavigationContainer } from '@react-navigation/native';
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
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
