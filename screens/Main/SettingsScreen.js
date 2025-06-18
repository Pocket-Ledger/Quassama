import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackButton } from 'components/BackButton';
import { useNavigation } from '@react-navigation/native';
import Header from 'components/Header';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('MAD');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const currencies = [
    { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
  ];

  const handleUpdateSettings = async () => {
    setIsLoading(true);
    try {
      // Add your update settings logic here
      // await Settings.updateSettings({ notifications: notificationsEnabled, currency: selectedCurrency });
      Alert.alert('Success', 'Settings updated successfully');
    } catch (error) {
      console.error('Update failed:', error.message);
      Alert.alert('Error', 'Failed to update settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency.code);
    setShowCurrencyDropdown(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="container"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        <Header title="Settings" />
        <Text className="text-sm font-normal">Customize app preferences.</Text>
        <View className="relative pt-4">
          <View className="form-container">
            {/* Notifications Setting */}
            <View className="flex-row items-center justify-between py-4 mb-4 border-b border-gray-200">
              <View className="flex-row items-center">
                <View className="items-center justify-center w-10 h-10 mr-4">
                  <Ionicons name="notifications-outline" size={20} color="#666" />
                </View>
                <Text className="text-lg text-black">Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E5E5E5', true: '#2979FF' }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#ffffff'}
                ios_backgroundColor="#E5E5E5"
              />
            </View>

            {/* Currency Setting */}
            <View className="mb-6">
              <Text className="mb-2 input-label">Currency</Text>
              <TouchableOpacity
                className="input-container"
                onPress={() => setShowCurrencyDropdown(!showCurrencyDropdown)}>
                <View className="flex-row items-center justify-between input-field">
                  <Text className="text-base text-black">{selectedCurrency}</Text>
                  <Ionicons
                    name={showCurrencyDropdown ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#666"
                  />
                </View>
              </TouchableOpacity>

              {/* Currency Dropdown */}
              {showCurrencyDropdown && (
                <View className="mt-2 bg-white border border-gray-200 rounded-lg">
                  {currencies.map((currency) => (
                    <TouchableOpacity
                      key={currency.code}
                      className={`border-b border-gray-100 p-4 ${
                        selectedCurrency === currency.code ? 'bg-blue-50' : ''
                      }`}
                      onPress={() => handleCurrencySelect(currency)}>
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text className="font-medium text-black">{currency.code}</Text>
                          <Text className="text-sm text-gray-500">{currency.name}</Text>
                        </View>
                        {selectedCurrency === currency.code && (
                          <Ionicons name="checkmark" size={20} color="#2979FF" />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity
              className="btn-primary"
              onPress={handleUpdateSettings}
              disabled={isLoading}>
              <Text className="btn-primary-text">{isLoading ? 'Updating...' : 'Update Info'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
