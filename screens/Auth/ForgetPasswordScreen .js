import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from 'components/Logo';

// Forget Password Screen
const ForgetPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Password reset code sent to:', email);
      // Navigate to EnterCodeScreen here
    } catch (error) {
      console.error('Failed to send reset code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    console.log('Navigate back to login');
    // Add navigation logic here
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="container"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        <View className="relative ">
          {/* Header with Back Button */}
          <View className="absolute left-0 top-0 flex-row items-center">
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-[10px] border border-border-light"
              onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={24} color="rgba(0, 0, 0, 0.7)" />
            </TouchableOpacity>
          </View>

          {/* Title and Subtitle */}
          <View className="mt-16">
            <Text className="title">Forget Password</Text>
            <Text className="subtitle">Please enter your email to receive a code</Text>
          </View>

          {/* Form */}
          <View className="form-container gap-6 ">
            <View className="input-group ">
              <Text className="input-label">Email</Text>
              <View className="input-container">
                <Ionicons
                  name="mail-outline"
                  size={20}
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: [{ translateY: -10 }],
                    color: errors.email ? 'red' : 'rgba(0, 0, 0, 0.2)',
                    zIndex: 1,
                  }}
                />
                <TextInput
                  className={`input-field ${errors.email ? 'input-field-error' : ''}`}
                  placeholder="John.doe@gmail"
                  placeholderTextColor="rgba(0, 0, 0, 0.2)"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: null }));
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && <Text className="error-text">{errors.email}</Text>}
            </View>

            <TouchableOpacity
              className="btn-primary "
              onPress={handleSendCode}
              disabled={isLoading}>
              <Text className="btn-primary-text">{isLoading ? 'Sending...' : 'Send'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgetPasswordScreen;
