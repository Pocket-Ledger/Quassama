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
import Header from 'components/Header';
import CustomAlert from 'components/CustomALert';
import { useAlert } from 'hooks/useAlert';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { alertConfig, showError, showSuccess, hideAlert } = useAlert();

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

  // Function to convert Firebase error codes to user-friendly messages
  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return t('auth.errors.email_already_in_use');

      case 'auth/invalid-email':
        return t('auth.errors.invalid_email');

      case 'auth/operation-not-allowed':
        return t('auth.errors.operation_not_allowed');

      case 'auth/weak-password':
        return t('auth.errors.weak_password');

      case 'auth/network-request-failed':
        return t('auth.errors.network_error');

      case 'auth/too-many-requests':
        return t('auth.errors.too_many_requests');

      case 'auth/user-disabled':
        return t('auth.errors.user_disabled');

      case 'auth/requires-recent-login':
        return t('auth.errors.requires_recent_login');

      case 'auth/credential-already-in-use':
        return t('auth.errors.credential_already_in_use');

      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return t('auth.errors.invalid_credentials');

      default:
        return t('auth.errors.general');
    }
  };

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
    if (passwordStrength < 40) return t('validation.weak');
    if (passwordStrength < 70) return t('validation.medium');
    return t('validation.strong');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!username) {
      newErrors.username = t('validation.username_required');
    } else if (username.length < 3) {
      newErrors.username = t('validation.username_min_length');
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = t('validation.username_invalid');
    }

    if (!email) {
      newErrors.email = t('validation.email_required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('validation.email_invalid');
    }

    if (!password) {
      newErrors.password = t('validation.password_required');
    } else {
      const requirements = checkPasswordRequirements(password);

      if (!requirements.length) {
        newErrors.password = t('validation.password_min_length');
      } else if (!requirements.complexity) {
        newErrors.password = t('validation.password_complexity');
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('validation.confirm_password_required');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('validation.passwords_no_match');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({}); // Clear any previous errors

    try {
      const registerInstance = new Register(email, password, confirmPassword, username);
      const userCredential = await registerInstance.register();
      console.log('Registration successful:', userCredential.user);

      const user = new User(username, email);
      await user.save();
      console.log('User saved successfully:', user);

      // Show success message
      /* showSuccess(
        t('register.success_title', 'Registration Successful'),
        t('register.success_message', 'Your account has been created successfully!'),
        () => {
          hideAlert();
          navigation.navigate('MainTabs');
        }
      ); */
    } catch (error) {
      console.error('Registration error:', error);

      // Extract Firebase error code
      let errorCode = '';
      let errorMessage = '';

      if (error.code) {
        errorCode = error.code;
        errorMessage = getFirebaseErrorMessage(errorCode);
      } else if (error.message) {
        // Handle other error formats
        if (error.message.includes('auth/email-already-in-use')) {
          errorCode = 'auth/email-already-in-use';
          errorMessage = getFirebaseErrorMessage(errorCode);
        } else if (error.message.includes('auth/weak-password')) {
          errorCode = 'auth/weak-password';
          errorMessage = getFirebaseErrorMessage(errorCode);
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = getFirebaseErrorMessage('default');
      }

      // Show custom error alert
      showError(t('register.error_title'), errorMessage);
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
          {/* Header with Back Button and Logo */}
          <Header />
          <View className="login-content relative">
            <View className="logo-container">
              <Logo />
            </View>

            {/* Title and Subtitle */}
            <View className="w-full ">
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
                        <View className="mb-1 flex-row items-center justify-between">
                          <Text className="text-sm text-gray-600">
                            {' '}
                            {t('register.password_strength')}
                          </Text>
                          <Text
                            className="text-sm font-medium"
                            style={{ color: getPasswordStrengthColor() }}>
                            {getPasswordStrengthText()}
                          </Text>
                        </View>
                        <View className="h-2 overflow-hidden rounded-full bg-gray-200">
                          <View
                            className="h-full rounded-full transition-all duration-300"
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
                            {t('validation.at_least_6_chars')}
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
                            {t('validation.mix_chars')}
                          </Text>
                        </View>
                      </View>

                      {/* Helpful Tips */}
                      {passwordStrength < 70 && (
                        <View className="mt-2 rounded-lg bg-blue-50 p-2">
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
                    <View className="mt-1 flex-row items-center">
                      <Ionicons
                        name={password === confirmPassword ? 'checkmark-circle' : 'close-circle'}
                        size={16}
                        color={password === confirmPassword ? '#34C759' : '#ff3b30'}
                      />
                      <Text
                        className={`ml-2 text-sm ${password === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                        {password === confirmPassword
                          ? t('validation.passwords_match')
                          : t('validation.passwords_no_match')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Remember Me Checkbox */}
              <TouchableOpacity
                className="mb-6 mt-4 flex-row items-center"
                onPress={() => setRememberMe(!rememberMe)}>
                <View
                  className={`mr-3 h-5 w-5 items-center justify-center rounded border-2 ${
                    rememberMe ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
                  }`}>
                  {rememberMe && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
                <Text className="text-body font-medium text-primary">
                  {t('register.remember_me')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="btn-primary btn-primary-text"
                onPress={handleRegister}
                disabled={isLoading}>
                <Text className="btn-primary-text font-dmsans-bold">
                  {isLoading ? t('register.creating_account') : t('register.create_account')}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="divider-container">
              <View className="divider-line" />
              <Text className="divider-text font-normal">{t('register.or_use')}</Text>
              <View className="divider-line" />
            </View>

            {/* Social Login Buttons */}
            <View className="flex w-full flex-row gap-4">
              <TouchableOpacity
                className="social-button"
                onPress={() => handleSocialLogin('Google')}>
                <Image
                  source={require('../../assets/google.png')}
                  className="h-5 w-5"
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
            <View className="signup-container mt-6">
              <Text className="signup-text font-normal">{t('register.already_have_account')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="signup-link">{t('register.login')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Alert - OUTSIDE KeyboardAvoidingView but INSIDE SafeAreaView */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
        onConfirm={alertConfig.onConfirm}
        showCancel={alertConfig.showCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
      />
    </SafeAreaView>
  );
};

export default RegisterScreen;
