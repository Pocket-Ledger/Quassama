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
import { useTranslation } from 'react-i18next';
import ResetPassword from 'models/auth/ResetPassword';
import Header from 'components/Header';
import { useAlert } from 'hooks/useAlert';
import CustomAlert from 'components/CustomALert';

const ResetPasswordScreen = () => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState(''); // Add this if you want to receive the code via navigation params
  const { alertConfig, showSuccess, showError, hideAlert } = useAlert();

  const validateForm = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = t('passwordRecovery.resetPassword.validation.newPasswordRequired');
    } else if (newPassword.length < 6) {
      newErrors.newPassword = t('passwordRecovery.resetPassword.validation.passwordTooShort');
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t(
        'passwordRecovery.resetPassword.validation.confirmPasswordRequired'
      );
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t(
        'passwordRecovery.resetPassword.validation.passwordsDoNotMatch'
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // You need to get the code from navigation params or state
      await ResetPassword.resetPassword(code, newPassword);
      showSuccess(
        t('customAlert.titles.success'),
        t('passwordRecovery.resetPassword.successMessage'),
        () => {
          console.log('Navigate to login');
          // Add navigation logic here
        }
      );
    } catch (error) {
      showError(
        t('customAlert.titles.error'),
        error.message || t('passwordRecovery.resetPassword.errorMessage')
      );
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
        <View className="relative ">
          {/* Header with Back Button */}
          <Header />

          {/* Title and Subtitle */}
          <View className="mt-8">
            <Text className="title">{t('passwordRecovery.resetPassword.title')}</Text>
            <Text className="subtitle">{t('passwordRecovery.resetPassword.subtitle')}</Text>
          </View>

          {/* Form */}
          <View className="form-container">
            <View className="gap-6">
              {/* New Password Input */}
              <View className="input-group">
                <Text className="input-label">
                  {t('passwordRecovery.resetPassword.newPassword')}
                </Text>
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
                    placeholder={t('passwordRecovery.resetPassword.newPasswordPlaceholder')}
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
                <Text className="input-label">
                  {t('passwordRecovery.resetPassword.confirmPassword')}
                </Text>
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
                    placeholder={t('passwordRecovery.resetPassword.confirmPasswordPlaceholder')}
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
              <TouchableOpacity
                className="btn-primary "
                onPress={handleSavePassword}
                disabled={isLoading}>
                <Text className="btn-primary-text">
                  {isLoading
                    ? t('passwordRecovery.resetPassword.saving')
                    : t('passwordRecovery.resetPassword.saveButton')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
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

export default ResetPasswordScreen;
