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
const ResetPasswordScreen = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Password reset successfully');
      Alert.alert('Success', 'Your password has been reset successfully', [
        { text: 'OK', onPress: () => console.log('Navigate to login') },
      ]);
    } catch (error) {
      console.error('Failed to reset password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    console.log('Navigate back to enter code');
    // Add navigation logic here
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="container"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        <View className="login-content relative">
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
            <Text className="title">Reset Password</Text>
            <Text className="subtitle">Please enter your email to receive a code</Text>
          </View>

          {/* Form */}
          <View className="form-container">
            <View className="gap-4">
              {/* New Password Input */}
              <View className="input-group">
                <Text className="input-label">New Password</Text>
                <View className="input-container">
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    style={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: [{ translateY: -10 }],
                      color: errors.newPassword ? 'red' : 'rgba(0, 0, 0, 0.2)',
                      zIndex: 1,
                    }}
                  />
                  <TextInput
                    className={`input-field ${errors.newPassword ? 'input-field-error' : ''}`}
                    placeholder="John.doe@gmail"
                    placeholderTextColor="rgba(0, 0, 0, 0.2)"
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (errors.newPassword) {
                        setErrors((prev) => ({ ...prev, newPassword: null }));
                      }
                    }}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    className="password-toggle"
                    onPress={() => setShowNewPassword(!showNewPassword)}>
                    <Ionicons
                      name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="rgba(0, 0, 0, 0.2)"
                    />
                  </TouchableOpacity>
                </View>
                {errors.newPassword && <Text className="error-text">{errors.newPassword}</Text>}
              </View>

              {/* Confirm Password Input */}
              <View className="input-group">
                <Text className="input-label">Confirm New Password</Text>
                <View className="input-container">
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    style={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: [{ translateY: -10 }],
                      color: errors.confirmPassword ? 'red' : 'rgba(0, 0, 0, 0.2)',
                      zIndex: 1,
                    }}
                  />
                  <TextInput
                    className={`input-field ${errors.confirmPassword ? 'input-field-error' : ''}`}
                    placeholder="John.doe@gmail"
                    placeholderTextColor="rgba(0, 0, 0, 0.2)"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) {
                        setErrors((prev) => ({ ...prev, confirmPassword: null }));
                      }
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    className="password-toggle"
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="rgba(0, 0, 0, 0.2)"
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text className="error-text">{errors.confirmPassword}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              className="btn-primary mt-8"
              onPress={handleSavePassword}
              disabled={isLoading}>
              <Text className="btn-primary-text">{isLoading ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;
