import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Minimal diagnostic app
SplashScreen.preventAutoHideAsync();

const checkpoints = {
  START: 'App started',
  SPLASH_READY: 'Splash screen ready',
  ASYNC_STORAGE: 'AsyncStorage accessible',
  FONTS_LOADING: 'Fonts loading...',
  FONTS_LOADED: 'Fonts loaded',
  LANGUAGE_INIT: 'Language initialization',
  APP_READY: 'App ready'
};

export default function DiagnosticApp() {
  const [status, setStatus] = useState('Initializing...');
  const [checkpointsPassed, setCheckpointsPassed] = useState([]);
  const [error, setError] = useState(null);

  const addCheckpoint = (checkpoint) => {
    setCheckpointsPassed(prev => [...prev, checkpoint]);
    setStatus(checkpoints[checkpoint] || checkpoint);
  };

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        addCheckpoint('START');
        await new Promise(resolve => setTimeout(resolve, 100));

        addCheckpoint('SPLASH_READY');
        await new Promise(resolve => setTimeout(resolve, 100));

        // Test AsyncStorage
        try {
          await AsyncStorage.setItem('test', 'value');
          await AsyncStorage.getItem('test');
          addCheckpoint('ASYNC_STORAGE');
        } catch (asyncErr) {
          throw new Error(`AsyncStorage failed: ${asyncErr.message}`);
        }

        addCheckpoint('FONTS_LOADING');
        // Simulate font loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        addCheckpoint('FONTS_LOADED');

        addCheckpoint('LANGUAGE_INIT');
        // Simulate language initialization
        await new Promise(resolve => setTimeout(resolve, 500));

        addCheckpoint('APP_READY');
        
        // Hide splash screen
        await SplashScreen.hideAsync();
        
      } catch (err) {
        setError(err.message);
        console.error('Diagnostic error:', err);
        Alert.alert('Diagnostic Error', err.message);
      }
    };

    runDiagnostics();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Diagnostic Failed</Text>
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.subtitle}>Checkpoints Passed:</Text>
        {checkpointsPassed.map((checkpoint, index) => (
          <Text key={index} style={styles.checkpoint}>
            ✓ {checkpoints[checkpoint] || checkpoint}
          </Text>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Diagnostics</Text>
      <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
      <Text style={styles.status}>{status}</Text>
      
      <View style={styles.checkpointsContainer}>
        <Text style={styles.subtitle}>Progress:</Text>
        {checkpointsPassed.map((checkpoint, index) => (
          <Text key={index} style={styles.checkpoint}>
            ✓ {checkpoints[checkpoint] || checkpoint}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  loader: {
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  checkpointsContainer: {
    width: '100%',
    maxWidth: 300,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  checkpoint: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 5,
    paddingLeft: 10,
  },
  error: {
    fontSize: 16,
    color: '#f44336',
    marginBottom: 20,
    textAlign: 'center',
  },
});
