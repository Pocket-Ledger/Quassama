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
import { View, Text, I18nManager } from 'react-native';
import ErrorBoundary from 'components/ErrorBoundary';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Ask for permission
async function registerForPushNotificationsAsync() {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notifications!');
      return;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }
}

async function scheduleExpenseReminder() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Expense Reminder 💰',
      body: "Don't forget to add your expense!",
    },
    trigger: {
      seconds: 7200, // every 2 hours (2 * 60 * 60 = 7200 seconds)
      repeats: true,
    },
  });
}

// Additional utility functions for notifications
async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

async function scheduleCustomReminder(title, body, hours) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
    },
    trigger: {
      seconds: hours * 3600, // Convert hours to seconds
      repeats: true,
    },
  });
}

async function scheduleOneTimeReminder(title, body, delayInSeconds) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
    },
    trigger: {
      seconds: delayInSeconds,
    },
  });
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [error, setError] = useState(null);

  let [fontsLoaded] = useFonts({
    'DM Sans': DMSans_400Regular,
    'DM Sans Medium': DMSans_500Medium,
    'DM Sans Bold': DMSans_700Bold,
    'DM Sans SemiBold': DMSans_600SemiBold,
  });

  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize language
        await languageUtils.initializeLanguage();

        // Request notification permissions
        await registerForPushNotificationsAsync();

        // Schedule expense reminder
        /* await scheduleExpenseReminder(); */

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
      <StatusBar style="dark" backgroundColor="white" translucent={false} />

      <SafeAreaProvider>
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <I18nextProvider i18n={i18n}>
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
              </I18nextProvider>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
