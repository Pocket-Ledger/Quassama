import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from 'components/Logo';
import { BackButton } from 'components/BackButton';
import { useNavigation } from '@react-navigation/native';
import Login from 'models/auth/Login';
import { useTranslation } from 'react-i18next';
import i18n from 'utils/i18n';
import Header from 'components/Header';
import { useRTL } from 'hooks/useRTL'; // Import RTL hook

const LoginScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const {
    isRTL,
    getFlexDirection,
    getTextAlign,
    getMargin,
    getPadding,
    getPosition,
    getIconDirection,
  } = useRTL(); // Use RTL hook

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = t('validation.email_required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('validation.email_invalid');
    }

    if (!password) {
      newErrors.password = t('validation.password_required');
    } else if (password.length < 6) {
      newErrors.password = t('validation.password_min_length');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const loginInstance = new Login(email, password);
      const userCredential = await loginInstance.login();
      console.log('Login successful:', userCredential.user);
      /* navigation.navigate('MainTabs'); */
    } catch (error) {
      console.error('Login failed:', error.message);
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    // Add social login logic here
  };

  const handleSignUp = () => {
    console.log('Navigate to Sign Up');
    // Add navigation to sign up screen here
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="container"
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header with Back Button */}
        <Header />
        <View className="login-content relative">
          <View className="logo-container">
            <Logo />
          </View>
          {/* Title and Subtitle */}
          <View>
            <Text className={`title `}>{t('login.title')}</Text>
            <Text className={`subtitle `}>{t('login.subtitle')}</Text>
          </View>
          {/* Form */}
          <View className="form-container">
            <View className="gap-4">
              <View className="input-group">
                <Text className={`input-label ${getTextAlign('left')}`}>{t('login.email')}</Text>
                <View className="input-container">
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    style={{
                      position: 'absolute',
                      [isRTL ? 'right' : 'left']: 16,
                      top: '50%',
                      transform: [{ translateY: -10 }],
                      color: errors.email ? 'red' : 'rgba(0, 0, 0, 0.2)',
                      zIndex: 1,
                    }}
                  />
                  <TextInput
                    className={`input-field ${errors.email ? 'input-field-error' : ''}`}
                    style={{
                      textAlign: isRTL ? 'right' : 'left',
                      paddingLeft: isRTL ? 16 : 48,
                      paddingRight: isRTL ? 48 : 16,
                    }}
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
                {errors.email && (
                  <Text className={`error-text ${getTextAlign('left')}`}>{errors.email}</Text>
                )}
              </View>

              <View className="input-group">
                <Text className={`input-label ${getTextAlign('left')}`}>{t('login.password')}</Text>
                <View className="input-container">
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    style={{
                      position: 'absolute',
                      [isRTL ? 'right' : 'left']: 16,
                      top: '50%',
                      transform: [{ translateY: -10 }],
                      color: errors.password ? 'red' : 'rgba(0, 0, 0, 0.2)',
                      zIndex: 1,
                    }}
                  />
                  <TextInput
                    className={`input-field ${errors.password ? 'input-field-error' : ''}`}
                    style={{
                      textAlign: isRTL ? 'right' : 'left',
                      paddingLeft: isRTL ? 48 : 48, // Both sides need space for icons
                      paddingRight: isRTL ? 48 : 48,
                    }}
                    placeholder="••••••••••••••••"
                    placeholderTextColor="rgba(0, 0, 0, 0.2)"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
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
                    style={{
                      position: 'absolute',
                      [isRTL ? 'left' : 'right']: 16,
                      top: '50%',
                      transform: [{ translateY: -10 }],
                    }}
                    onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="rgba(0, 0, 0, 0.2)"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text className={`error-text ${getTextAlign('left')}`}>{errors.password}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text className={`forgot-password-link ${getTextAlign('right')}`}>
                {t('login.forgot_password')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="btn-primary" onPress={handleLogin} disabled={isLoading}>
              <Text className={`btn-primary-text ${getTextAlign('center')}`}>
                {isLoading ? t('login.logging_in') : t('login.login_button')}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="divider-container">
            <View className="divider-line" />
            <Text className={`divider-text font-normal ${getTextAlign('center')}`}>
              {t('login.or_continue_with')}
            </Text>
            <View className="divider-line" />
          </View>

          <View className={`flex w-full gap-4 ${getFlexDirection()}`}>
            <TouchableOpacity className="social-button" onPress={() => handleSocialLogin('Google')}>
              <Image
                source={require('../../assets/google.png')}
                className="h-5 w-5"
                resizeMode="contain"
              />
              <Text className={`text-label ${getTextAlign('center')}`}>{t('login.google')}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="social-button" onPress={() => handleSocialLogin('Apple')}>
              <Ionicons name="logo-apple" size={20} color="#000000" />
              <Text className={`text-label ${getTextAlign('center')}`}>{t('login.apple')}</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View className={`signup-container ${getFlexDirection()} items-center justify-center`}>
            <Text className={`signup-text font-normal ${getMargin('right', '1')}`}>
              {t('login.no_account')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="signup-link">{t('login.sign_up')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
