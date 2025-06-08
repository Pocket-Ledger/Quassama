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

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const checkPasswordRequirements = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordRequirements(requirements);
    return requirements;
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
      const unmetRequirements = [];

      if (!requirements.length) unmetRequirements.push('at least 8 characters');
      if (!requirements.uppercase) unmetRequirements.push('one uppercase letter');
      if (!requirements.lowercase) unmetRequirements.push('one lowercase letter');
      if (!requirements.number) unmetRequirements.push('one number');
      if (!requirements.special) unmetRequirements.push('one special character');

      if (unmetRequirements.length > 0) {
        newErrors.password = `Password must contain ${unmetRequirements.join(', ')}`;
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
          <View className="login-content relative">
            {/* Header with Back Button and Logo */}
            <BackButton />
            <View className="logo-container">
              <Logo />
            </View>

            {/* Title and Subtitle */}
            <View className="">
              <Text className="title">Create an Account</Text>
              <Text className="subtitle">Please enter your details to enjoy the experience</Text>
            </View>

            {/* Form */}
            <View className="form-container">
              <View className="gap-4">
                {/* Username Input */}
                <View className="input-group">
                  <Text className="input-label">Username</Text>
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
                  <Text className="input-label">Password</Text>
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

                  {/* Password Requirements */}
                  {password.length > 0 && (
                    <View className="mt-2 gap-1">
                      <View className="flex-row items-center">
                        <Ionicons
                          name={passwordRequirements.length ? 'checkmark' : 'close'}
                          size={16}
                          color={passwordRequirements.length ? '#34C759' : '#ff3b30'}
                        />
                        <Text
                          className={`ml-2 text-sm ${passwordRequirements.length ? 'text-green-500' : 'text-red-500'}`}>
                          At least 8 characters
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons
                          name={passwordRequirements.uppercase ? 'checkmark' : 'close'}
                          size={16}
                          color={passwordRequirements.uppercase ? '#34C759' : '#ff3b30'}
                        />
                        <Text
                          className={`ml-2 text-sm ${passwordRequirements.uppercase ? 'text-green-500' : 'text-red-500'}`}>
                          One uppercase letter
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons
                          name={passwordRequirements.lowercase ? 'checkmark' : 'close'}
                          size={16}
                          color={passwordRequirements.lowercase ? '#34C759' : '#ff3b30'}
                        />
                        <Text
                          className={`ml-2 text-sm ${passwordRequirements.lowercase ? 'text-green-500' : 'text-red-500'}`}>
                          One lowercase letter
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons
                          name={passwordRequirements.number ? 'checkmark' : 'close'}
                          size={16}
                          color={passwordRequirements.number ? '#34C759' : '#ff3b30'}
                        />
                        <Text
                          className={`ml-2 text-sm ${passwordRequirements.number ? 'text-green-500' : 'text-red-500'}`}>
                          One number
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons
                          name={passwordRequirements.special ? 'checkmark' : 'close'}
                          size={16}
                          color={passwordRequirements.special ? '#34C759' : '#ff3b30'}
                        />
                        <Text
                          className={`ml-2 text-sm ${passwordRequirements.special ? 'text-green-500' : 'text-red-500'}`}>
                          One special character
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Confirm Password Input */}
                <View className="input-group">
                  <Text className="input-label">Confirm Password</Text>
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
                <Text className="text-body font-medium text-primary">Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="btn-primary btn-primary-text"
                onPress={handleRegister}
                disabled={isLoading}>
                <Text className="btn-primary-text">
                  {isLoading ? 'Creating Account...' : 'Create an Account'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="divider-container">
              <View className="divider-line" />
              <Text className="divider-text">OR use</Text>
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
                <Text className="text-label">Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="social-button"
                onPress={() => handleSocialLogin('Apple')}>
                <Ionicons name="logo-apple" size={20} color="#000000" />
                <Text className="text-label">Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View className="signup-container mt-6">
              <Text className="signup-text">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="signup-link">Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
