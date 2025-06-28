import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
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
import { useRTL } from 'hooks/useRTL'; // Import RTL hook

const AddNewGroupScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { isRTL, getFlexDirection, getTextAlign, getMargin, getPadding } = useRTL(); // Use RTL hook

  const { alertConfig, hideAlert, showSuccess, showError } = useAlert();

  const [groupName, setGroupName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [allowInviteOthers, setAllowInviteOthers] = useState(true);
  const [notifyForExpenses, setNotifyForExpenses] = useState(true);
  const [errors, setErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);

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

  // Get text input style for RTL
  const getInputStyle = () => ({
    textAlign: isRTL ? 'right' : 'left',
    writingDirection: isRTL ? 'rtl' : 'ltr',
  });

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
    }
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
      const currency = 'MAD';
      const description = '';

      // Fetch current user's info to include as initial member
      const currentUserDetails = await User.getUserDetails();
      const creatorMember = {
        id: created_by,
        name: currentUserDetails.username,
        initial: currentUserDetails.username ? currentUserDetails.username[0].toUpperCase() : '',
        color: '#2979FF',
      };

      // Create group with only the creator as a member
      const groupInstance = new Group();
      const groupId = await groupInstance.creatGroup(
        groupName,
        created_by,
        currency,
        [creatorMember],
        description
      );

      // Send invitations by UID!
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
          className={getFlexDirection()}>
          {selectedMembers.map((m) => (
            <MemberAvatar key={m.id} member={m} onRemove={handleRemoveMember} isRTL={isRTL} />
          ))}
        </ScrollView>
      );
    } else {
      // Grid layout for more than 6 members
      return (
        <View className={`${getFlexDirection()} flex-wrap justify-start`}>
          {selectedMembers.map((m) => (
            <MemberAvatar
              key={m.id}
              member={m}
              onRemove={handleRemoveMember}
              isGrid={true}
              isRTL={isRTL}
            />
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
            <Text
              className={`input-label text-base font-medium text-black ${getTextAlign('left')}`}>
              {t('addGroup.group_name')}
            </Text>
            <View className="input-container">
              <TextInput
                className={`input-field rounded-lg border px-4 text-black ${
                  errors.groupName ? 'border-red-500' : 'border-gray-200'
                }`}
                style={getInputStyle()}
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
              />
            </View>
            {errors.groupName && (
              <Text className={`error-text mt-1 text-sm text-red-500 ${getTextAlign('left')}`}>
                {errors.groupName}
              </Text>
            )}
          </View>

          {/* Member Search */}
          <View>
            <Text className={`mb-2 text-base font-medium text-black ${getTextAlign('left')}`}>
              {t('addGroup.add_members')}
            </Text>
            <View className={`input-container ${getFlexDirection()}`}>
              <TextInput
                className="input-field flex-1 rounded-lg border border-gray-200 px-4 text-black"
                style={getInputStyle()}
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
                className={`${getMargin('left', '2')} justify-center rounded-lg bg-primary px-4`}
                onPress={handleSearch}>
                <Feather name="search" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Loading Indicator */}
            {isSearching && (
              <View className={`mt-3 ${getFlexDirection()} items-center justify-center px-2`}>
                <ActivityIndicator size="small" color="#2979FF" />
                <Text
                  className={`${getMargin('left', '2')} text-sm text-gray-600 ${getTextAlign('left')}`}>
                  {t('addGroup.searching')}
                </Text>
              </View>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <View className="mt-3 rounded-lg border border-gray-100 bg-gray-50">
                <Text
                  className={`border-b border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 ${getTextAlign('left')}`}>
                  {t('addGroup.search_results')}
                </Text>
                {searchResults.map((user, index) => (
                  <TouchableOpacity
                    key={user.id}
                    className={`${getFlexDirection()} items-center px-4 py-3 ${
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
                      <Text className={`text-base font-medium text-black ${getTextAlign('left')}`}>
                        {user.username}
                      </Text>
                      <Text className={`text-sm text-gray-500 ${getTextAlign('left')}`}>
                        {user.email}
                      </Text>
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
                  <Text className={`text-center text-sm text-gray-500 ${getTextAlign('center')}`}>
                    {t('addGroup.no_users_found')}
                  </Text>
                </View>
              )}
          </View>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <View className="mb-4">
              <Text className={`mb-3 text-base font-medium text-black ${getTextAlign('left')}`}>
                {t('addGroup.selected_members', { count: selectedMembers.length })}
              </Text>
              {renderMembers()}
            </View>
          )}

          {/* Validation Error */}
          {errors.members && (
            <Text className={`error-text -mt-4 text-sm text-red-500 ${getTextAlign('left')}`}>
              {errors.members}
            </Text>
          )}

          {/* Settings */}
          <View className="gap-2">
            <View className={`${getFlexDirection()} items-center justify-between py-2`}>
              <Text className={`text-base font-normal text-black ${getTextAlign('left')}`}>
                {t('addGroup.allow_invite_others')}
              </Text>
              <TouchableOpacity
                className={`h-8 w-14 rounded-full ${
                  allowInviteOthers ? 'bg-primary' : 'bg-gray-300'
                }`}
                onPress={handleToggleInviteOthers}>
                <View
                  className={`h-6 w-6 rounded-full bg-white shadow-sm ${
                    allowInviteOthers ? (isRTL ? 'ml-1 mt-1' : 'ml-7 mt-1') : 'ml-1 mt-1'
                  }`}
                />
              </TouchableOpacity>
            </View>
            <View
              className={`${getFlexDirection()} items-center justify-between border-b-[0.5px] border-gray-250 py-2`}>
              <Text className={`text-base font-normal text-black ${getTextAlign('left')}`}>
                {t('addGroup.notify_new_expenses')}
              </Text>
              <TouchableOpacity
                className={`h-8 w-14 rounded-full ${
                  notifyForExpenses ? 'bg-primary' : 'bg-gray-300'
                }`}
                onPress={handleToggleNotifications}>
                <View
                  className={`h-6 w-6 rounded-full bg-white shadow-sm ${
                    notifyForExpenses ? (isRTL ? 'ml-1 mt-1' : 'ml-7 mt-1') : 'ml-1 mt-1'
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
            <Text
              className={`btn-primary-text text-center text-base font-semibold text-white ${getTextAlign('center')}`}>
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
        isRTL={isRTL} // Pass RTL prop
      />
    </SafeAreaView>
  );
};

// Separate component for member avatars
const MemberAvatar = ({ member, onRemove, isGrid = false, isRTL }) => {
  const { getMargin } = useRTL();

  return (
    <View className={`items-center ${isGrid ? 'mb-4 w-1/4' : `${getMargin('right', '6')} p-2`}`}>
      {/* Avatar Container */}
      <View className="relative">
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: member.color }}>
          <Text className="text-lg font-semibold text-white">{member.initial}</Text>
        </View>

        {/* Red X Remove Button */}
        <TouchableOpacity
          className={`absolute ${isRTL ? '-left-1' : '-right-1'} -top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500 shadow-md`}
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
