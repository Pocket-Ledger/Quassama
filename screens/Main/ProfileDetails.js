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
const InputFieldSkeleton = () => (
  <View className="input-group">
    <SkeletonPlaceholder width={60} height={16} style={{ marginBottom: 8 }} />
    <View className="input-container">
      <SkeletonPlaceholder width="100%" height={56} style={{ borderRadius: 12 }} />
    </View>
  </View>
);

// Loading Screen Component
const LoadingScreen = () => (
  <SafeAreaView className="flex-1 bg-white">
    <ScrollView
      className="container"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}>
      <Header title="Profile" />
      <SkeletonPlaceholder width="80%" height={16} style={{ marginBottom: 16 }} />
      <View className="relative pt-4">
        <View className="gap-4 form-container">
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
const ProfileDetailsScreen = () => {
  const navigation = useNavigation();
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
        showError('Error', 'Failed to fetch user details. Please try again.');
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
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
      showSuccess('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Update failed:', error.message);
      showError('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        <Header title="Profile" />
        <Text className="text-sm font-normal">View and update your personal information.</Text>
        <View className="relative pt-4">
          <View className="gap-4 form-container">
            <View className="gap-4">
              <View className="input-group">
                <Text className="input-label">Name</Text>
                <View className="input-container">
                  <Ionicons
                    name="person-outline"
                    size={20}
                    style={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: [{ translateY: -10 }],
                      color: errors.name ? 'red' : 'rgba(0, 0, 0, 0.2)',
                      zIndex: 1,
                    }}
                  />
                  <TextInput
                    className={`input-field ${errors.name ? 'input-field-error' : ''}`}
                    placeholder="Enter your name"
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
                {errors.name && <Text className="error-text">{errors.name}</Text>}
              </View>

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
                    placeholder="Enter your email"
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

              <TouchableOpacity
                className={`btn-primary ${isLoading ? 'opacity-50' : ''}`}
                onPress={handleUpdateProfile}
                disabled={isLoading}>
                {isLoading ? (
                  <View className="flex-row items-center justify-center">
                    <SkeletonPlaceholder
                      width={20}
                      height={20}
                      style={{ borderRadius: 10, marginRight: 8 }}
                    />
                    <Text className="btn-primary-text">Updating...</Text>
                  </View>
                ) : (
                  <Text className="btn-primary-text">Update Info</Text>
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
      />
    </SafeAreaView>
  );
};

export default ProfileDetailsScreen;
