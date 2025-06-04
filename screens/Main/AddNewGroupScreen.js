import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BackButton } from 'components/BackButton';
import { useNavigation } from '@react-navigation/native';

const AddNewGroupScreen = () => {
  const navigation = useNavigation();

  const [groupName, setGroupName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [allowInviteOthers, setAllowInviteOthers] = useState(true);
  const [notifyForExpenses, setNotifyForExpenses] = useState(true);
  const [errors, setErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  const [selectedMembers, setSelectedMembers] = useState([
    { id: 1, initial: 'M', name: 'Mehdi', color: '#2979FF' },
    { id: 2, initial: 'S', name: 'Sara', color: '#FF9800' },
    { id: 3, initial: 'R', name: 'Rabie', color: '#673AB7' },
  ]);

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
    setSelectedMembers(selectedMembers.filter((member) => member.id !== memberId));
  };

  const handleAddGroup = async () => {
    if (!validateForm()) return;

    setIsCreating(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert('Success', 'Group created successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleInviteOthers = () => {
    setAllowInviteOthers(!allowInviteOthers);
  };

  const handleToggleNotifications = () => {
    setNotifyForExpenses(!notifyForExpenses);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="container "
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="mb-6 flex flex-row items-center justify-start px-4 pb-4">
          <BackButton />
          <Text className="ml-12 mt-2 text-xl font-bold text-black">Add New Group</Text>
        </View>

        <View className="flex-1 gap-6 ">
          {/* Group Name */}
          <View className="input-group">
            <Text className="input-label text-base font-medium text-black">Group Name</Text>
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
                    setErrors((prev) => ({ ...prev, groupName: null }));
                  }
                }}
                autoCapitalize="words"
              />
            </View>
            {errors.groupName && (
              <Text className="error-text mt-1 text-sm text-red-500">{errors.groupName}</Text>
            )}
          </View>

          {/* Add Members */}
          <View className="input-group">
            <Text className="input-label text-base font-medium text-black">Add Members</Text>
            <View className="input-container">
              <TextInput
                className="input-field rounded-lg border border-gray-200 px-4 py-4 text-black"
                placeholder='Eg: "user02718"'
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={memberInput}
                onChangeText={setMemberInput}
                autoCapitalize="none"
              />
            </View>
            {errors.members && (
              <Text className="error-text mt-1 text-sm text-red-500">{errors.members}</Text>
            )}
          </View>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <View className="flex-row flex-wrap gap-4">
              {selectedMembers.map((member) => (
                <View key={member.id} className="items-center">
                  <View className="relative">
                    <View
                      className="h-16 w-16 items-center justify-center rounded-full"
                      style={{ backgroundColor: member.color }}>
                      <Text className="text-lg font-bold text-white">{member.initial}</Text>
                    </View>
                    <TouchableOpacity
                      className="absolute -right-1 -top-1 h-6 w-6 items-center justify-center rounded-full bg-red-500"
                      onPress={() => handleRemoveMember(member.id)}>
                      <Feather name="x" size={12} color="white" />
                    </TouchableOpacity>
                  </View>
                  <Text className="mt-2 text-sm text-gray-600">{member.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Settings */}
          <View className="gap-2 ">
            {/* Allow members to invite others */}
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

            {/* Notify for new expenses */}
            <View className="flex-row items-center justify-between border-b-[0.5px] border-gray-250  py-2">
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

          {/* Add Group Button */}
          <TouchableOpacity
            className={`btn-primary mb-8 rounded-lg py-4 ${
              isCreating ? 'bg-gray-400' : 'bg-primary'
            }`}
            onPress={handleAddGroup}
            disabled={isCreating}>
            <Text className="btn-primary-text text-center text-base font-semibold text-white">
              {isCreating ? 'Creating...' : 'Add Group'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddNewGroupScreen;
