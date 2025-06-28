import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from 'components/Logo';
import { useTranslation } from 'react-i18next';
import ResetPassword from 'models/auth/ResetPassword';
import { useAlert } from 'hooks/useAlert';
import CustomAlert from 'components/CustomALert';
import Header from 'components/Header';
import { useRTL } from 'hooks/useRTL'; // Import RTL hook

// Forget Password Screen
const ForgetPasswordScreen = () => {
  const { t } = useTranslation();
  const { isRTL, getFlexDirection, getTextAlign, getMargin, getPadding } = useRTL(); // Use RTL hook

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Use the custom alert hook
  const { alertConfig, showSuccess, showError, hideAlert } = useAlert();

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = t('passwordRecovery.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('passwordRecovery.validation.emailInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await ResetPassword.initiatePasswordReset(email);
      showSuccess(
        t('customAlert.titles.success'),
        t('passwordRecovery.forgetPassword.successMessage'),
        () => {
          console.log('Navigate to OTP verification');
          hideAlert();
          // TODO: Navigate to OTPVerificationScreen, pass email if needed
        }
      );
    } catch (error) {
      showError(
        t('customAlert.titles.error'),
        error.message || t('passwordRecovery.forgetPassword.errorMessage'),
        () => hideAlert()
      );
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
        <View className="relative">
          {/* Header with Back Button */}
          <Header />

          {/* Title and Subtitle */}
          <View className="mt-8">
            <Text className={`title `}>{t('passwordRecovery.forgetPassword.title')}</Text>
            <Text className={`subtitle `}>{t('passwordRecovery.forgetPassword.subtitle')}</Text>
          </View>

          {/* Form */}
          <View className="form-container gap-6">
            <View className="input-group">
              <Text className={`input-label ${getTextAlign('left')}`}>
                {t('passwordRecovery.forgetPassword.email')}
              </Text>
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
                  placeholder={t('passwordRecovery.forgetPassword.emailPlaceholder')}
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

            <TouchableOpacity className="btn-primary" onPress={handleSendCode} disabled={isLoading}>
              <Text className={`btn-primary-text ${getTextAlign('center')}`}>
                {isLoading
                  ? t('passwordRecovery.forgetPassword.sending')
                  : t('passwordRecovery.forgetPassword.sendButton')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Custom Alert */}
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

export default ForgetPasswordScreen;
