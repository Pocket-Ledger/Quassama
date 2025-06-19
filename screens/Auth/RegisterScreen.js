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
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from 'components/Logo';
import { BackButton } from 'components/BackButton';
import { useNavigation } from '@react-navigation/native';
import Register from 'models/auth/Register';
import User from 'models/auth/user';
import { useTranslation } from 'react-i18next';
import i18n from 'utils/i18n';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    complexity: false, // Combined uppercase, lowercase, number, special
  });

  const checkPasswordRequirements = (password) => {
    const requirements = {
      length: password.length >= 6, // Reduced from 8 to 6
      complexity:
        (/[A-Z]/.test(password) ? 1 : 0) + // uppercase
          (/[a-z]/.test(password) ? 1 : 0) + // lowercase
          (/\d/.test(password) ? 1 : 0) + // number
          (/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 1 : 0) >=
        2, // at least 2 of 4 types
    };

    // Calculate password strength (0-100)
    let strength = 0;
    if (password.length >= 6) strength += 30;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 10;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 10;

    setPasswordStrength(strength);
    setPasswordRequirements(requirements);
    return requirements;
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return '#ff3b30'; // Red
    if (passwordStrength < 70) return '#ff9500'; // Orange
    return '#34C759'; // Green
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Medium';
    return 'Strong';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!username) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const requirements = checkPasswordRequirements(password);

      if (!requirements.length) {
        newErrors.password = 'Password must be at least 6 characters';
      } else if (!requirements.complexity) {
        newErrors.password =
          'Password needs at least 2 of: uppercase, lowercase, number, or special character';
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const registerInstance = new Register(email, password, confirmPassword, username);
      const userCredential = await registerInstance.register();
      console.log('Registration successful:', userCredential.user);

      const user = new User(username, email);
      await user.save();
      console.log('User saved successfully:', user);

      navigation.navigate('MainTabs');
    } catch (error) {
      console.error('Registration error:', error.message);
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Register with ${provider}`);
    // Add social registration logic here
  };

  const handleLogin = () => {
    console.log('Navigate to Login');
    // Add navigation to login screen here
  };

  const handleGoBack = () => {
    console.log('Navigate back');
    // Add navigation logic here
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView
          className="container "
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={true}>
          <View className="relative login-content">
            {/* Header with Back Button and Logo */}
            <BackButton />
            <View className="logo-container">
              <Logo />
            </View>

            {/* Title and Subtitle */}
            <View className="">
              <Text className="title">{t('register.title')}</Text>
              <Text className="subtitle">{t('register.subtitle')}</Text>
            </View>

            {/* Form */}
            <View className="form-container">
              <View className="gap-4">
                {/* Username Input */}
                <View className="input-group">
                  <Text className="input-label">{t('register.username')}</Text>
                  <View className="input-container">
                    <Ionicons
                      name="person-outline"
                      size={20}
                      style={{
                        position: 'absolute',
                        left: 16,
                        top: '50%',
                        transform: [{ translateY: -10 }],
                        color: errors.username ? 'red' : 'rgba(0, 0, 0, 0.2)',
                        zIndex: 1,
                      }}
                    />
                    <TextInput
                      className={`input-field ${errors.username ? 'input-field-error' : ''}`}
                      placeholder="johndoe123"
                      placeholderTextColor="rgba(0, 0, 0, 0.2)"
                      value={username}
                      onChangeText={(text) => {
                        setUsername(text);
                        if (errors.username) {
                          setErrors((prev) => ({ ...prev, username: null }));
                        }
                      }}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {errors.username && <Text className="error-text">{errors.username}</Text>}
                </View>

                {/* Email Input */}
                <View className="input-group">
                  <Text className="input-label">{t('register.email')}</Text>
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
                      placeholder="John.doe@gmail.com"
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

                {/* Password Input */}
                <View className="input-group">
                  <Text className="input-label">{t('register.password')}</Text>
                  <View className="input-container">
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      style={{
                        position: 'absolute',
                        left: 16,
                        top: '50%',
                        transform: [{ translateY: -10 }],
                        color: errors.password ? 'red' : 'rgba(0, 0, 0, 0.2)',
                        zIndex: 1,
                      }}
                    />
                    <TextInput
                      className={`input-field ${errors.password ? 'input-field-error' : ''}`}
                      placeholder="••••••••••••••••"
                      placeholderTextColor="rgba(0, 0, 0, 0.2)"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        checkPasswordRequirements(text);
                        if (errors.password) {
                          setErrors((prev) => ({ ...prev, password: null }));
                        }
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      className="password-toggle z-99"
                      onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color="rgba(0, 0, 0, 0.2)"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && <Text className="error-text">{errors.password}</Text>}

                  {/* Simplified Password Strength Indicator */}
                  {password.length > 0 && (
                    <View className="mt-3">
                      {/* Password Strength Bar */}
                      <View className="mb-2">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="text-sm text-gray-600">Password Strength</Text>
                          <Text
                            className="text-sm font-medium"
                            style={{ color: getPasswordStrengthColor() }}>
                            {getPasswordStrengthText()}
                          </Text>
                        </View>
                        <View className="h-2 overflow-hidden bg-gray-200 rounded-full">
                          <View
                            className="h-full transition-all duration-300 rounded-full"
                            style={{
                              width: `${passwordStrength}%`,
                              backgroundColor: getPasswordStrengthColor(),
                            }}
                          />
                        </View>
                      </View>

                      {/* Simple Requirements */}
                      <View className="gap-2">
                        <View className="flex-row items-center">
                          <Ionicons
                            name={
                              passwordRequirements.length ? 'checkmark-circle' : 'ellipse-outline'
                            }
                            size={16}
                            color={passwordRequirements.length ? '#34C759' : '#D1D5DB'}
                          />
                          <Text
                            className={`ml-2 text-sm ${passwordRequirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                            At least 6 characters
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons
                            name={
                              passwordRequirements.complexity
                                ? 'checkmark-circle'
                                : 'ellipse-outline'
                            }
                            size={16}
                            color={passwordRequirements.complexity ? '#34C759' : '#D1D5DB'}
                          />
                          <Text
                            className={`ml-2 text-sm ${passwordRequirements.complexity ? 'text-green-600' : 'text-gray-500'}`}>
                            Mix of letters, numbers, or symbols
                          </Text>
                        </View>
                      </View>

                      {/* Helpful Tips */}
                      {passwordStrength < 70 && (
                        <View className="p-2 mt-2 rounded-lg bg-blue-50">
                          <Text className="text-xs text-blue-700">
                            💡 Tip: Try adding {password.length < 8 ? 'more characters, ' : ''}
                            {!/[A-Z]/.test(password) ? 'uppercase letters, ' : ''}
                            {!/\d/.test(password) ? 'numbers, ' : ''}
                            {!/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'symbols ' : ''}
                            for a stronger password
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* Confirm Password Input */}
                <View className="input-group">
                  <Text className="input-label">{t('register.confirm_password')}</Text>
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
                      placeholder="••••••••••••••••"
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
                      className="password-toggle z-99"
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

                  {/* Password Match Indicator */}
                  {confirmPassword.length > 0 && (
                    <View className="flex-row items-center mt-1">
                      <Ionicons
                        name={password === confirmPassword ? 'checkmark-circle' : 'close-circle'}
                        size={16}
                        color={password === confirmPassword ? '#34C759' : '#ff3b30'}
                      />
                      <Text
                        className={`ml-2 text-sm ${password === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                        {password === confirmPassword
                          ? 'Passwords match'
                          : 'Passwords do not match'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Remember Me Checkbox */}
              <TouchableOpacity
                className="flex-row items-center mt-4 mb-6"
                onPress={() => setRememberMe(!rememberMe)}>
                <View
                  className={`mr-3 h-5 w-5 items-center justify-center rounded border-2 ${
                    rememberMe ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
                  }`}>
                  {rememberMe && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
                <Text className="font-medium text-body text-primary">{t('register.remember_me')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="btn-primary btn-primary-text"
                onPress={handleRegister}
                disabled={isLoading}>
                <Text className="btn-primary-text">
                  {isLoading ? t('register.creating_account') : t('register.create_account')}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="divider-container">
              <View className="divider-line" />
              <Text className="divider-text">{t('register.or_use')}</Text>
              <View className="divider-line" />
            </View>

            {/* Social Login Buttons */}
            <View className="flex flex-row w-full gap-4">
              <TouchableOpacity
                className="social-button"
                onPress={() => handleSocialLogin('Google')}>
                <Image
                  source={require('../../assets/google.png')}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
                <Text className="text-label">{t('register.google')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="social-button"
                onPress={() => handleSocialLogin('Apple')}>
                <Ionicons name="logo-apple" size={20} color="#000000" />
                <Text className="text-label">{t('register.apple')}</Text>
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View className="mt-6 signup-container">
              <Text className="signup-text">{t('register.already_have_account')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="signup-link">{t('register.login')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
