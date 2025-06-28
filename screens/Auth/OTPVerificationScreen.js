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
import { Logo, SmallLogo } from 'components/Logo';
import { useTranslation } from 'react-i18next';
import ResetPassword from 'models/auth/ResetPassword';
import { useRTL } from 'hooks/useRTL'; // Import RTL hook
import Header from 'components/Header';

const OTPVerificationScreen = () => {
  const { t } = useTranslation();
  const { isRTL, getFlexDirection, getTextAlign, getMargin, getPadding, getIconDirection } =
    useRTL(); // Use RTL hook

  const [code, setCode] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Enable resend after 30 seconds (you can adjust this)
    const timer = setTimeout(() => setCanResend(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  const handleCodeChange = (value, index) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setHasError(false);

    // Auto-focus next input - adjust direction for RTL
    if (value && index < 3) {
      const nextIndex = isRTL ? index - 1 : index + 1;
      if (nextIndex >= 0 && nextIndex < 4) {
        inputRefs.current[nextIndex]?.focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index]) {
      const prevIndex = isRTL ? index + 1 : index - 1;
      if (prevIndex >= 0 && prevIndex < 4) {
        inputRefs.current[prevIndex]?.focus();
      }
    }
  };

  const handleConfirm = async () => {
    const enteredCode = code.join('');
    if (enteredCode.length !== 4) {
      setHasError(true);
      return;
    }

    setIsLoading(true);
    try {
      await ResetPassword.verifyCode(enteredCode);
      // Code verified, navigate to ResetPasswordScreen
      Alert.alert(
        t('customAlert.titles.success'),
        t('passwordRecovery.otpVerification.successMessage'),
        [
          {
            text: t('customAlert.buttons.ok'),
            onPress: () => console.log('Navigate to ResetPasswordScreen'),
          },
        ]
      );
      // TODO: Navigate to ResetPasswordScreen, pass code if needed
    } catch (error) {
      setHasError(true);
      setCode(['', '', '', '']);
      inputRefs.current[0]?.focus();
      Alert.alert(
        t('customAlert.titles.error'),
        error.message || t('passwordRecovery.otpVerification.wrongCode')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    try {
      // Simulate resend API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Code resent');
      setCanResend(false);
      // Reset timer for next resend
      setTimeout(() => setCanResend(true), 30000);
    } catch (error) {
      console.error('Failed to resend code:', error);
    }
  };

  const handleGoBack = () => {
    console.log('Navigate back to forget password');
    // Add navigation logic here
  };

  // For RTL, we might want to reverse the order of OTP inputs
  const otpInputs = isRTL ? [3, 2, 1, 0] : [0, 1, 2, 3];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="container"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        <View className="relative flex">
          {/* Header with Back Button and Support */}
          <Header rightIcon={<SmallLogo />} />

          <View className="mt-8">
            {/* Title and Subtitle */}
            <View>
              <Text className={`title `}>{t('passwordRecovery.otpVerification.title')}</Text>
              <Text className={`subtitle `}>
                {t('passwordRecovery.otpVerification.subtitle', { email: 'john.doe@gmail.com' })}
              </Text>
            </View>

            {/* Code Input */}
            <View className="mb-4 flex items-center justify-center">
              <View className={`justify-center gap-6 ${getFlexDirection()}`}>
                {otpInputs.map((actualIndex, displayIndex) => (
                  <TextInput
                    key={actualIndex}
                    ref={(ref) => (inputRefs.current[actualIndex] = ref)}
                    className={`h-[72px] w-[64px] rounded-[16px] border text-center text-2xl font-semibold ${
                      hasError
                        ? 'border-error text-error'
                        : code[actualIndex]
                          ? 'border-primary text-primary'
                          : 'border-gray-200 text-gray-400'
                    } bg-gray-50`}
                    value={code[actualIndex]}
                    onChangeText={(value) => handleCodeChange(value, actualIndex)}
                    onKeyPress={(e) => handleKeyPress(e, actualIndex)}
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              {hasError && (
                <Text className={`mt-4 text-center text-error ${getTextAlign('center')}`}>
                  {t('passwordRecovery.otpVerification.wrongCode')}
                </Text>
              )}
            </View>

            {/* Resend Link */}
            <View className="mb-8">
              <View className={`items-center justify-center p-0 text-label ${getFlexDirection()}`}>
                <Text className={`text-center text-text-secondary ${getTextAlign('center')}`}>
                  {t('passwordRecovery.otpVerification.didntReceive')}{' '}
                </Text>
                <TouchableOpacity onPress={handleResendCode} disabled={!canResend}>
                  <Text
                    className={`${canResend ? 'font-medium text-primary' : 'font-medium text-gray-300'} ${getTextAlign('center')}`}>
                    {t('passwordRecovery.otpVerification.resend')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity className="btn-primary" onPress={handleConfirm} disabled={isLoading}>
              <Text className={`btn-primary-text ${getTextAlign('center')}`}>
                {isLoading
                  ? t('passwordRecovery.otpVerification.confirming')
                  : t('passwordRecovery.otpVerification.confirmButton')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OTPVerificationScreen;
