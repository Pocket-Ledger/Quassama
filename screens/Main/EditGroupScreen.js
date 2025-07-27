import React, { useState, useCallback } from 'react';
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
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Group from 'models/group/group';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Header from 'components/Header';
import User from 'models/auth/user';
import Invitation from 'models/invitation/invitation';
import { useAlert } from 'hooks/useAlert';
import CustomAlert from 'components/CustomALert';
import { useTranslation } from 'react-i18next';

const EditGroupScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = route.params;
  const { t } = useTranslation();
  const { alertConfig, hideAlert, showSuccess, showError } = useAlert();

  const [groupName, setGroupName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [allowInviteOthers, setAllowInviteOthers] = useState(true);
  const [notifyForExpenses, setNotifyForExpenses] = useState(true);
  const [errors, setErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Now holds { docId, id, username, email }
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [originalMembers, setOriginalMembers] = useState([]);
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

  // Fetch group data when screen loads
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      setIsLoading(true);

      const fetchGroupData = async () => {
        try {
          const groupRef = doc(db, 'groups', groupId);
          const groupSnap = await getDoc(groupRef);

          if (groupSnap.exists() && mounted) {
            const data = groupSnap.data();

            // Check if current user is admin
            const auth = getAuth();
            if (data.created_by !== auth.currentUser?.uid) {
              showError(t('editGroup.error_title'), t('editGroup.not_admin_error'));
              navigation.goBack();
              return;
            }

            setGroupName(data.name || '');
            setAllowInviteOthers(data.allowInviteOthers ?? true);
            setNotifyForExpenses(data.notifyForExpenses ?? true);

            const members = data.members || [];
            setSelectedMembers(members);
            setOriginalMembers(members);
          }
        } catch (error) {
          console.error('Error fetching group data:', error);
          showError(t('editGroup.error_title'), t('editGroup.fetch_error_message'));
        } finally {
          if (mounted) setIsLoading(false);
        }
      };

      fetchGroupData();
      return () => {
        mounted = false;
      };
    }, [groupId])
  );

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
      showError(t('editGroup.search_error_title'), t('editGroup.search_error_message'));
    } finally {
      setIsSearching(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!groupName.trim()) {
      newErrors.groupName = t('editGroup.errors.group_name_required');
    }
    if (selectedMembers.length === 0) {
      newErrors.members = t('editGroup.errors.members_required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRemoveMember = (memberId) => {
    // Don't allow removing the current user (group creator)
    const auth = getAuth();
    const currentUserId = auth.currentUser?.uid;

    if (memberId === currentUserId) {
      showError(t('editGroup.error_title'), t('editGroup.cannot_remove_self'));
      return;
    }

    setSelectedMembers((m) => m.filter((member) => member.id !== memberId));
  };

  const handleUpdateGroup = async () => {
    if (!validateForm()) return;
    setIsUpdating(true);
    try {
      const auth = getAuth();

      // Update group basic info
      // Update group basic info
      await Group.updateGroup(
        groupId,
        {
          name: groupName,
          allowInviteOthers,
          notifyForExpenses,
          members: selectedMembers,
        },
        auth.currentUser.uid
      ); // Pass current user ID

      // Find new members to invite
      const originalMemberIds = originalMembers.map((m) => m.id);
      const newMembers = selectedMembers.filter((m) => !originalMemberIds.includes(m.id));

      // Send invitations to new members
      for (const member of newMembers) {
        if (member.id !== auth.currentUser?.uid) {
          try {
            const invitation = new Invitation(
              auth.currentUser.uid, // sender
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

      showSuccess(t('editGroup.success_title'), t('editGroup.success_message'), () => {
        hideAlert();
        navigation.goBack();
      });
    } catch (error) {
      console.error('Error updating group:', error);
      showError(t('editGroup.error_title'), t('editGroup.error_message'));
    } finally {
      setIsUpdating(false);
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

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2979FF" />
        <Text className="mt-4">{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="container"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        <Header title={t('editGroup.title')} />
        <View className="flex-1 gap-6">
          {/* Group Name */}
          <View className="input-group">
            <Text className="input-label text-base font-medium text-black">
              {t('editGroup.group_name')}
            </Text>
            <View className="input-container">
              <TextInput
                className={`input-field rounded-lg border px-4 text-black ${
                  errors.groupName ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder={t('editGroup.group_name_placeholder')}
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
              <Text className="error-text mt-1 text-sm text-red-500">{errors.groupName}</Text>
            )}
          </View>

          {/* Member Search */}
          <View>
            <Text className="mb-2 text-base font-medium text-black">
              {t('editGroup.add_members')}
            </Text>
            <View className="input-container flex-row">
              <TextInput
                className="input-field flex-1 rounded-lg border border-gray-200 px-4 text-black"
                placeholder={t('editGroup.search_placeholder')}
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
                <Text className="ml-2 text-sm text-gray-600">{t('editGroup.searching')}</Text>
              </View>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <View className="mt-3 rounded-lg border border-gray-100 bg-gray-50">
                <Text className="border-b border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">
                  {t('editGroup.search_results')}
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
                    {t('editGroup.no_users_found')}
                  </Text>
                </View>
              )}
          </View>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <View className="mb-4">
              <Text className="mb-3 text-base font-medium text-black">
                {t('editGroup.current_members', { count: selectedMembers.length })}
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
                {t('editGroup.allow_invite_others')}
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
                {t('editGroup.notify_new_expenses')}
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

          {/* Update Button */}
          <TouchableOpacity
            className={`btn-primary mb-8 rounded-lg py-4 ${
              isUpdating ? 'bg-gray-400' : 'bg-primary'
            }`}
            onPress={handleUpdateGroup}
            disabled={isUpdating}>
            <Text className="btn-primary-text text-center text-base font-semibold text-white">
              {isUpdating ? t('editGroup.updating') : t('editGroup.update_group')}
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
  const { t } = useTranslation();
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;
  const isCurrentUser = member.id === currentUserId;

  return (
    <View className={`items-center ${isGrid ? 'mb-4 w-1/4' : 'mr-6 p-2'}`}>
      {/* Avatar Container */}
      <View className="relative">
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: member.color }}>
          <Text className="text-lg font-semibold text-white">{member.initial}</Text>
        </View>

        {/* Red X Remove Button - Hide for current user */}
        {!isCurrentUser && (
          <TouchableOpacity
            className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500 shadow-md"
            onPress={() => onRemove(member.id)}
            activeOpacity={0.7}>
            <Feather name="x" size={12} color="white" />
          </TouchableOpacity>
        )}

        {/* "You" badge for current user */}
        {isCurrentUser && (
          <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-green-500 shadow-md">
            <Text className="text-xs font-bold text-white">!</Text>
          </View>
        )}
      </View>

      {/* Name */}
      <Text
        className={`mt-2 text-center text-xs text-gray-700 ${isGrid ? 'max-w-16' : 'max-w-14'}`}
        numberOfLines={1}>
        {isCurrentUser ? t('editGroup.you') : member.name}
      </Text>
    </View>
  );
};

export default EditGroupScreen;
