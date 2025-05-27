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

const OTPVerificationScreen = () => {
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

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate wrong code for demo
      if (enteredCode === '2528') {
        setHasError(true);
        // Reset code
        setCode(['', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        console.log('Code verified successfully');
        // Navigate to ResetPasswordScreen here
      }
    } catch (error) {
      console.error('Code verification failed:', error);
      setHasError(true);
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="container "
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        <View className="relative flex">
          {/* Header with Back Button and Support */}
          <View className="absolute left-0 top-0 w-full flex-row items-center justify-between">
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-[10px] border border-border-light"
              onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={24} color="rgba(0, 0, 0, 0.7)" />
            </TouchableOpacity>

            <SmallLogo />
          </View>

          <View className="top-[107px]">
            {/* Title and Subtitle */}
            <View className="">
              <Text className="title">Enter Code</Text>
              <Text className="subtitle">
                We've sent an email with an activation code to your phone john.doe@gmail.com
              </Text>
            </View>

            {/* Code Input */}
            <View className="mb-4 flex items-center justify-center">
              <View className="flex-row justify-center gap-6">
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    className={`h-[72px] w-[64px] rounded-[16px] border text-center text-2xl font-semibold ${
                      hasError
                        ? 'border-error text-error'
                        : digit
                          ? 'border-primary text-primary'
                          : 'border-gray-200 text-gray-400'
                    } bg-gray-50`}
                    value={digit}
                    onChangeText={(value) => handleCodeChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              {hasError && (
                <Text className="mt-4 text-center text-error">Wrong Code, Please try again</Text>
              )}
            </View>

            {/* Resend Link */}
            <View className="mb-8 ">
              <View className="flex-row items-center justify-center p-0 text-label">
                <Text className="text-center text-text-secondary">Didn't receive the code? </Text>
                <TouchableOpacity onPress={handleResendCode} disabled={!canResend}>
                  <Text
                    className={`${canResend ? 'font-medium text-primary' : 'font-medium text-gray-300'}`}>
                    Resend
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity className="btn-primary" onPress={handleConfirm} disabled={isLoading}>
              <Text className="btn-primary-text">{isLoading ? 'Confirming...' : 'Confirm'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OTPVerificationScreen;
