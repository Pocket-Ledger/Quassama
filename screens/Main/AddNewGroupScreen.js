import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BackButton } from 'components/BackButton';
import { useNavigation } from '@react-navigation/native';
import Group from 'models/group/group';
import { getAuth } from 'firebase/auth';
import Header from 'components/Header';
import User from 'models/auth/user';
import Invitation from 'models/invitation/invitation';
import { useAlert } from 'hooks/useAlert';
import CustomAlert from 'components/CustomALert';

const AddNewGroupScreen = () => {
  const navigation = useNavigation();
  const { alertConfig, hideAlert, showSuccess, showError } = useAlert();

  const [groupName, setGroupName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [allowInviteOthers, setAllowInviteOthers] = useState(true);
  const [notifyForExpenses, setNotifyForExpenses] = useState(true);
  const [errors, setErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Now holds { docId, id, username, email }
  const [selectedMembers, setSelectedMembers] = useState([]);

  const handleSearch = async () => {
    if (!memberInput.trim()) return;
    setIsSearching(true);
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
      showError('Search Error', 'Failed to search for users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!groupName.trim()) {
      newErrors.groupName = 'Group name is required';
    }
    if (selectedMembers.length === 0) {
      newErrors.members = 'Please add at least one member';
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

      // Create group
      const groupInstance = new Group();
      const groupId = await groupInstance.creatGroup(
        groupName,
        created_by,
        currency,
        selectedMembers,
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

      showSuccess('Success', 'Group created successfully!', () => {
        hideAlert();
        navigation.goBack();
      });
    } catch (error) {
      console.error('Error creating group:', error);
      showError('Creation Error', 'Failed to create group. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleInviteOthers = () => setAllowInviteOthers((v) => !v);

  const handleToggleNotifications = () => setNotifyForExpenses((v) => !v);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="container"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        <Header title="Add New Group" />
        <View className="flex-1 gap-6">
          {/* Group Name */}
          <View className="input-group">
            <Text className="text-base font-medium text-black input-label">Group Name</Text>
            <View className="input-container">
              <TextInput
                className={`input-field rounded-lg border px-4 py-4 text-black ${
                  errors.groupName ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder='Eg: "Roommates", "Vacation Agadir"'
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
              <Text className="mt-1 text-sm text-red-500 error-text">{errors.groupName}</Text>
            )}
          </View>

          {/* Member Search */}
          <View className="flex-row input-container">
            <TextInput
              className="flex-1 px-4 py-4 text-black border border-gray-200 rounded-lg input-field"
              placeholder='Eg: "user02718"'
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={memberInput}
              onChangeText={setMemberInput}
              autoCapitalize="none"
            />
            <TouchableOpacity
              className="justify-center px-4 ml-2 rounded-lg bg-primary"
              onPress={handleSearch}
              disabled={isSearching}>
              <Text className="text-white">{isSearching ? '...' : 'Search'}</Text>
            </TouchableOpacity>
          </View>
          {searchResults.length > 0 ? (
            <View className="mt-2">
              <Text className="mb-2 text-sm text-gray-600">Search Results:</Text>
              {searchResults.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  className="flex-row items-center px-4 py-2 mb-2 border border-gray-200 rounded-lg"
                  onPress={() => {
                    if (!selectedMembers.some((m) => m.id === user.id)) {
                      setSelectedMembers((prev) => [
                        ...prev,
                        {
                          id: user.id, // the UID
                          docId: user.docId, // in case you need it
                          name: user.username,
                          initial: user.username[0]?.toUpperCase() || '',
                          color: '#2979FF',
                        },
                      ]);
                      setSearchResults([]);
                      setMemberInput('');
                    }
                  }}>
                  <Text className="text-base text-black">{user.username}</Text>
                  <Text className="ml-2 text-xs text-gray-400">{user.email}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            !isSearching &&
            memberInput.trim() !== '' && (
              <Text className="mt-2 text-sm text-gray-500">No matching users</Text>
            )
          )}

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <View className="mb-4">
              <Text className="mb-1 text-sm text-gray-600">Added Members:</Text>
              {selectedMembers.map((m) => (
                <View
                  key={m.id}
                  className="flex-row items-center justify-between px-4 py-2 mb-2 border rounded-lg">
                  <Text>{m.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveMember(m.id)}>
                    <Feather name="x" size={20} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Settings */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-base text-black">Allow members to invite others</Text>
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
              <Text className="text-base text-black">Notify for new expenses</Text>
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
            <Text className="text-base font-semibold text-center text-white btn-primary-text">
              {isCreating ? 'Creating...' : 'Add Group'}
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

export default AddNewGroupScreen;
