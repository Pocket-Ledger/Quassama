import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from 'components/BackButton';
import { useNavigation } from '@react-navigation/native';
import User from 'models/auth/user';
import Header from 'components/Header';
import { useAlert } from 'hooks/useAlert';
import CustomAlert from 'components/CustomALert';
import { useTranslation } from 'react-i18next';
import { useRTL } from 'hooks/useRTL'; // Import RTL hook

const SkeletonPlaceholder = ({ width, height, style = {} }) => {
  const shimmerValue = new Animated.Value(0);

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, []);

  const backgroundColor = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#F3F4F6'],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor,
          borderRadius: 8,
        },
        style,
      ]}
    />
  );
};

// Input Field Skeleton
const InputFieldSkeleton = () => {
  const { getTextAlign } = useRTL();

  return (
    <View className="input-group">
      <View
        style={{ alignItems: getTextAlign('left') === 'text-left' ? 'flex-start' : 'flex-end' }}>
        <SkeletonPlaceholder width={60} height={16} style={{ marginBottom: 8 }} />
      </View>
      <View className="input-container">
        <SkeletonPlaceholder width="100%" height={56} style={{ borderRadius: 12 }} />
      </View>
    </View>
  );
};

// Loading Screen Component
const LoadingScreen = () => {
  const { t } = useTranslation();
  const { getTextAlign } = useRTL();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="container"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        <Header title={t('profile.title')} />
        <View
          style={{ alignItems: getTextAlign('left') === 'text-left' ? 'flex-start' : 'flex-end' }}>
          <SkeletonPlaceholder width="80%" height={16} style={{ marginBottom: 16 }} />
        </View>
        <View className="relative pt-4">
          <View className="form-container gap-4">
            <View className="gap-4">
              <InputFieldSkeleton />
              <InputFieldSkeleton />
              <SkeletonPlaceholder
                width="100%"
                height={56}
                style={{ borderRadius: 12, marginTop: 8 }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ProfileDetailsScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { isRTL, getFlexDirection, getTextAlign, getMargin, getPadding, getPosition } = useRTL(); // Use RTL hook

  const { alertConfig, showSuccess, showError, hideAlert } = useAlert();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoadingUser(true);
      try {
        const userDetails = await User.getUserDetails();
        setName(userDetails?.username || '');
        setEmail(userDetails?.email || '');
      } catch (error) {
        console.error('Error fetching user details:', error);
        showError(t('customAlert.titles.error'), t('profileDetails.fetchError'));
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, [t]);

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = t('profileDetails.validation.nameRequired');
    }

    if (!email.trim()) {
      newErrors.email = t('profileDetails.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('profileDetails.validation.emailInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Add your update profile logic here
      // await User.updateProfile({ name, email });
      showSuccess(t('customAlert.titles.success'), t('profileDetails.updateSuccess'));
      navigation.goBack();
    } catch (error) {
      console.error('Update failed:', error.message);
      showError(t('customAlert.titles.error'), t('profileDetails.updateError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Get icon position for RTL
  const getIconStyle = (hasError) => ({
    position: 'absolute',
    [isRTL ? 'right' : 'left']: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    color: hasError ? 'red' : 'rgba(0, 0, 0, 0.2)',
    zIndex: 1,
  });

  // Get text input style for RTL
  const getInputStyle = (hasError) => ({
    textAlign: isRTL ? 'right' : 'left',
    [isRTL ? 'paddingRight' : 'paddingLeft']: 48, // Space for icon
    [isRTL ? 'paddingLeft' : 'paddingRight']: 16,
  });

  // Show skeleton loading screen while user data is loading
  if (isLoadingUser) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="container"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        <Header title={t('profile.title')} />
        <Text className={`text-sm font-normal ${getTextAlign('left')}`}>
          {t('profileDetails.subtitle')}
        </Text>
        <View className="relative pt-4">
          <View className="form-container gap-4">
            <View className="gap-4">
              {/* Name Input */}
              <View className="input-group">
                <Text className={`input-label ${getTextAlign('left')}`}>
                  {t('profileDetails.name')}
                </Text>
                <View className="input-container">
                  <Ionicons name="person-outline" size={20} style={getIconStyle(errors.name)} />
                  <TextInput
                    className={`input-field ${errors.name ? 'input-field-error' : ''}`}
                    style={getInputStyle(errors.name)}
                    placeholder={t('profileDetails.namePlaceholder')}
                    placeholderTextColor="rgba(0, 0, 0, 0.2)"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (errors.name) {
                        setErrors((prev) => ({ ...prev, name: null }));
                      }
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
                {errors.name && (
                  <Text className={`error-text ${getTextAlign('left')}`}>{errors.name}</Text>
                )}
              </View>

              {/* Email Input */}
              <View className="input-group">
                <Text className={`input-label ${getTextAlign('left')}`}>
                  {t('profileDetails.email')}
                </Text>
                <View className="input-container">
                  <Ionicons name="mail-outline" size={20} style={getIconStyle(errors.email)} />
                  <TextInput
                    className={`input-field ${errors.email ? 'input-field-error' : ''}`}
                    style={getInputStyle(errors.email)}
                    placeholder={t('profileDetails.emailPlaceholder')}
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

              {/* Update Button */}
              <TouchableOpacity
                className={`btn-primary ${isLoading ? 'opacity-50' : ''}`}
                onPress={handleUpdateProfile}
                disabled={isLoading}>
                {isLoading ? (
                  <View className={`${getFlexDirection()} items-center justify-center`}>
                    <SkeletonPlaceholder
                      width={20}
                      height={20}
                      style={{
                        borderRadius: 10,
                        [isRTL ? 'marginLeft' : 'marginRight']: 8,
                      }}
                    />
                    <Text className="btn-primary-text">{t('profileDetails.updating')}</Text>
                  </View>
                ) : (
                  <Text className="btn-primary-text">{t('profileDetails.updateButton')}</Text>
                )}
              </TouchableOpacity>
            </View>
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
        isRTL={isRTL} // Pass RTL prop to alert
      />
    </SafeAreaView>
  );
};

export default ProfileDetailsScreen;
