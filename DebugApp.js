import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Simple app for debugging
SplashScreen.preventAutoHideAsync();

export default function DebugApp() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Simulate app initialization
        await new Promise(resolve => setTimeout(resolve, 2000));
        await SplashScreen.hideAsync();
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    initApp();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.success}>App loaded successfully!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  success: {
    color: 'green',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
