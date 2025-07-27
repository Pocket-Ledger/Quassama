import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Feather } from '@expo/vector-icons';
import { BackButton } from 'components/BackButton';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Group from 'models/group/group';
import { getAuth } from 'firebase/auth';
import Header from 'components/Header';
import User from 'models/auth/user';
import Invitation from 'models/invitation/invitation';
import { useAlert } from 'hooks/useAlert';
import CustomAlert from 'components/CustomALert';
import { useTranslation } from 'react-i18next';

const AddNewGroupScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { alertConfig, hideAlert, showSuccess, showError } = useAlert();

  const [groupName, setGroupName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('MAD');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [allowInviteOthers, setAllowInviteOthers] = useState(true);
  const [notifyForExpenses, setNotifyForExpenses] = useState(true);
  const [errors, setErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);

  /* useFocusEffect(
    React.useCallback(() => {
      if (shouldReset) {
        setGroupName('');
        setMemberInput('');
        setSelectedMembers([]);
        setSearchResults([]);
        setErrors({});
        setHasSearched(false);
        setAllowInviteOthers(true);
        setNotifyForExpenses(true);
        setShouldReset(false);
      }
    }, [shouldReset])
  ); */
  // Now holds { docId, id, username, email }
  const [selectedMembers, setSelectedMembers] = useState([]);
  const avatarColors = [
    '#2979FF', // Blue
    '#FF9800', // Orange
    '#9C27B0', // Purple
    '#4CAF50', // Green
    '#F44336', // Red
    '#00BCD4', // Cyan
    '#FF5722', // Deep Orange
    '#3F51B5', // Indigo
  ];

  const currencyOptions = [
    { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  ];

  const handleSearch = async () => {
    if (!memberInput.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const users = await User.searchUsersByUsername(memberInput.trim());
      // map each Firestore doc to { docId, id: user_id, ... }
      setSearchResults(
        users.map((u) => ({
          docId: u.id,
          id: u.user_id,
          username: u.username,
          email: u.email,
        }))
      );
    } catch (error) {
      console.error('Error searching for users:', error);
      showError(t('addGroup.search_error_title'), t('addGroup.search_error_message'));
    } finally {
      setIsSearching(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!groupName.trim()) {
      newErrors.groupName = t('addGroup.errors.group_name_required');
    } else if (groupName.length > 50) {
      newErrors.groupName = t('addGroup.errors.maxLength');
    }
    /*     if (selectedMembers.length === 0) {
      newErrors.members = t('addGroup.errors.members_required');
    } */
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRemoveMember = (memberId) => {
    setSelectedMembers((m) => m.filter((member) => member.id !== memberId));
  };

  const handleAddGroup = async () => {
    if (!validateForm()) return;
    setIsCreating(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const created_by = user.uid;
      const currency = selectedCurrency;
      const description = '';

      // Create group (the creatGroup method will handle adding the creator as initial member)
      const groupInstance = new Group();
      const groupId = await groupInstance.creatGroup(
        groupName,
        created_by,
        currency,
        [], // Empty array - let creatGroup handle the creator member
        description
      );

      // Send invitations to selected members
      for (const member of selectedMembers) {
        if (member.id !== created_by) {
          try {
            const invitation = new Invitation(
              created_by, // sender
              groupId, // group
              groupName, // group name
              'pending', // status
              member.id // receiver UID
            );
            await invitation.createNew(member.id);
            console.log('Invitation sent to', member.id);
          } catch (err) {
            console.error('Error inviting', member.name, err);
          }
        }
      }
      //setShouldReset(true);

      showSuccess(t('addGroup.success_title'), t('addGroup.success_message'), () => {
        hideAlert();
        navigation.goBack();
      });
    } catch (error) {
      console.error('Error creating group:', error);
      showError(t('addGroup.error_title'), t('addGroup.error_message'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleInviteOthers = () => setAllowInviteOthers((v) => !v);

  const handleToggleNotifications = () => setNotifyForExpenses((v) => !v);

  // Helper function to render members in grid or horizontal scroll
  const renderMembers = () => {
    if (selectedMembers.length <= 6) {
      // Horizontal scroll for 6 or fewer members
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}
          className="flex-row">
          {selectedMembers.map((m) => (
            <MemberAvatar key={m.id} member={m} onRemove={handleRemoveMember} />
          ))}
        </ScrollView>
      );
    } else {
      // Grid layout for more than 6 members
      return (
        <View className="flex-row flex-wrap justify-start">
          {selectedMembers.map((m) => (
            <MemberAvatar key={m.id} member={m} onRemove={handleRemoveMember} isGrid={true} />
          ))}
        </View>
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="container"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        <Header title={t('addGroup.title')} />
        <View className="flex-1 gap-6">
          {/* Group Name */}
          <View className="input-group">
            <View className="flex-row items-center justify-between">
              <Text className="input-label text-base font-medium text-black">
                {t('addGroup.group_name')}
              </Text>
              <Text
                className={`text-sm ${groupName.length > 50 ? 'text-red-500' : 'text-gray-500'}`}>
                {groupName.length}/50
              </Text>
            </View>
            <View className="input-container">
              <TextInput
                className={`input-field rounded-lg border px-4  text-black ${
                  errors.groupName ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder={t('addGroup.group_name_placeholder')}
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={groupName}
                onChangeText={(text) => {
                  setGroupName(text);
                  if (errors.groupName) {
                    setErrors((e) => ({ ...e, groupName: null }));
                  }
                }}
                autoCapitalize="words"
                maxLength={50}
              />
            </View>
            {errors.groupName && (
              <Text className="error-text mt-1 text-sm text-red-500">{errors.groupName}</Text>
            )}
          </View>

          {/* Currency Selection */}
          {/*  <View className="input-group">
            <Text className="text-base font-medium text-black input-label">
              {t('addGroup.currency')}
            </Text>
            <View className="input-container">
              <TouchableOpacity
                className="flex-row items-center justify-between px-4 py-3 border border-gray-200 rounded-lg input-field"
                onPress={() => setShowCurrencyDropdown(!showCurrencyDropdown)}>
                <View className="flex-row items-center">
                  <Text className="mr-2 text-base text-black">
                    {currencyOptions.find((c) => c.code === selectedCurrency)?.symbol}
                  </Text>
                  <Text className="text-base text-black">
                    {selectedCurrency} -{' '}
                    {currencyOptions.find((c) => c.code === selectedCurrency)?.name}
                  </Text>
                </View>
                <Feather
                  name={showCurrencyDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="rgba(0, 0, 0, 0.4)"
                />
              </TouchableOpacity>

              {showCurrencyDropdown && (
                <View className="mt-2 border border-gray-100 rounded-lg max-h-52 bg-gray-50">
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {currencyOptions.map((currency, index) => (
                      <TouchableOpacity
                        key={currency.code}
                        className={`flex-row items-center px-4 py-3 ${
                          index !== currencyOptions.length - 1 ? 'border-b border-gray-100' : ''
                        } ${selectedCurrency === currency.code ? 'bg-blue-50' : 'bg-white'}`}
                        onPress={() => {
                          setSelectedCurrency(currency.code);
                          setShowCurrencyDropdown(false);
                        }}>
                        <Text className="mr-3 text-base font-medium text-black">
                          {currency.symbol}
                        </Text>
                        <View className="flex-1">
                          <Text className="text-base font-medium text-black">{currency.code}</Text>
                          <Text className="text-sm text-gray-500">{currency.name}</Text>
                        </View>
                        {selectedCurrency === currency.code && (
                          <View className="items-center justify-center w-6 h-6 rounded-full bg-primary">
                            <Feather name="check" size={14} color="white" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View> */}

          {/* Member Search */}
          <View>
            <Text className="mb-2 text-base font-medium text-black">
              {t('addGroup.add_members')}
            </Text>
            <View className="input-container flex-row">
              <TextInput
                className="input-field flex-1 rounded-lg border border-gray-200 px-4 text-black"
                placeholder={t('addGroup.search_placeholder')}
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={memberInput}
                onChangeText={(text) => {
                  setMemberInput(text);
                  // Clear search results when input is empty
                  if (text.trim() === '') {
                    setSearchResults([]);
                    setHasSearched(false);
                  }
                }}
                autoCapitalize="none"
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <TouchableOpacity
                className="ml-2 justify-center rounded-lg bg-primary px-4"
                onPress={handleSearch}>
                <Feather name="search" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Loading Indicator */}
            {isSearching && (
              <View className="mt-3 flex-row items-center justify-center px-2">
                <ActivityIndicator size="small" color="#2979FF" />
                <Text className="ml-2 text-sm text-gray-600">{t('addGroup.searching')}</Text>
              </View>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <View className="mt-3 rounded-lg border border-gray-100 bg-gray-50">
                <Text className="border-b border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
                  {t('addGroup.search_results')}
                </Text>
                {searchResults.map((user, index) => (
                  <TouchableOpacity
                    key={user.id}
                    className={`flex-row items-center px-4 py-3 ${
                      index !== searchResults.length - 1 ? 'border-b border-gray-100' : ''
                    } ${selectedMembers.some((m) => m.id === user.id) ? 'bg-blue-50' : 'bg-white'}`}
                    onPress={() => {
                      if (!selectedMembers.some((m) => m.id === user.id)) {
                        setSelectedMembers((prev) => [
                          ...prev,
                          {
                            id: user.id,
                            docId: user.docId,
                            name: user.username,
                            initial: user.username[0]?.toUpperCase() || '',
                            color: avatarColors[prev.length % avatarColors.length],
                          },
                        ]);
                        setSearchResults([]);
                        setMemberInput('');
                      }
                    }}
                    disabled={selectedMembers.some((m) => m.id === user.id)}>
                    <View className="flex-1">
                      <Text className="text-base font-medium text-black">{user.username}</Text>
                      <Text className="text-sm text-gray-500">{user.email}</Text>
                    </View>

                    {selectedMembers.some((m) => m.id === user.id) ? (
                      <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Feather name="check" size={14} color="white" />
                      </View>
                    ) : (
                      <Feather name="plus-circle" size={20} color="#2979FF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* No Results */}
            {!isSearching &&
              hasSearched &&
              memberInput.trim() !== '' &&
              searchResults.length === 0 && (
                <View className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                  <Text className="text-center text-sm text-gray-500">
                    {t('addGroup.no_users_found')}
                  </Text>
                </View>
              )}
          </View>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <View className="mb-4">
              <Text className="mb-3 text-base font-medium text-black">
                {t('addGroup.selected_members', { count: selectedMembers.length })}
              </Text>
              {renderMembers()}
            </View>
          )}

          {/* Validation Error */}
          {errors.members && (
            <Text className="error-text -mt-4 text-sm text-red-500">{errors.members}</Text>
          )}

          {/* Settings */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-base font-normal text-black">
                {t('addGroup.allow_invite_others')}
              </Text>
              <TouchableOpacity
                className={`h-8 w-14 rounded-full ${
                  allowInviteOthers ? 'bg-primary' : 'bg-gray-300'
                }`}
                onPress={handleToggleInviteOthers}>
                <View
                  className={`h-6 w-6 rounded-full bg-white shadow-sm ${
                    allowInviteOthers ? 'ml-7 mt-1' : 'ml-1 mt-1'
                  }`}
                />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center justify-between border-b-[0.5px] border-gray-250 py-2">
              <Text className="text-base font-normal text-black">
                {t('addGroup.notify_new_expenses')}
              </Text>
              <TouchableOpacity
                className={`h-8 w-14 rounded-full ${
                  notifyForExpenses ? 'bg-primary' : 'bg-gray-300'
                }`}
                onPress={handleToggleNotifications}>
                <View
                  className={`h-6 w-6 rounded-full bg-white shadow-sm ${
                    notifyForExpenses ? 'ml-7 mt-1' : 'ml-1 mt-1'
                  }`}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Create */}
          <TouchableOpacity
            className={`btn-primary mb-8 rounded-lg py-4 ${
              isCreating ? 'bg-gray-400' : 'bg-primary'
            }`}
            onPress={handleAddGroup}
            disabled={isCreating}>
            <Text className="btn-primary-text text-center text-base font-semibold text-white">
              {isCreating ? t('addGroup.creating') : t('addGroup.add_group')}
            </Text>
          </TouchableOpacity>
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

// Separate component for member avatars
const MemberAvatar = ({ member, onRemove, isGrid = false }) => {
  return (
    <View className={`items-center ${isGrid ? 'mb-4 w-1/4' : 'mr-6 p-2'}`}>
      {/* Avatar Container */}
      <View className="relative">
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: member.color }}>
          <Text className="text-lg font-semibold text-white">{member.initial}</Text>
        </View>

        {/* Red X Remove Button */}
        <TouchableOpacity
          className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500 shadow-md"
          onPress={() => onRemove(member.id)}
          activeOpacity={0.7}>
          <Feather name="x" size={12} color="white" />
        </TouchableOpacity>
      </View>

      {/* Name */}
      <Text
        className={`mt-2 text-center text-xs text-gray-700 ${isGrid ? 'max-w-16' : 'max-w-14'}`}
        numberOfLines={1}>
        {member.name}
      </Text>
    </View>
  );
};

export default AddNewGroupScreen;
