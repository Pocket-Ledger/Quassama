import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BackButton } from 'components/BackButton';
import { useNavigation } from '@react-navigation/native';

const GroupsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'You Owed', 'You Ow', 'Settled'];

  const groupsData = [
    {
      id: 1,
      name: 'Faculty SM',
      members: [
        { initial: 'M', color: '#2979FF' },
        { initial: 'S', color: '#FF9800' },
        { initial: 'R', color: '#00BCD4' },
      ],
      additionalMembers: 2,
      amount: '250 MAD',
      lastExpense: 'Groceries',
      time: '2h Ago',
      isStarred: true,
    },
    {
      id: 2,
      name: 'Faculty SM',
      members: [
        { initial: 'M', color: '#2979FF' },
        { initial: 'S', color: '#FF9800' },
        { initial: 'R', color: '#00BCD4' },
      ],
      additionalMembers: 2,
      amount: '250 MAD',
      lastExpense: 'Internet',
      time: 'Yesterday',
      isStarred: false,
    },
    {
      id: 3,
      name: 'Faculty SM',
      members: [
        { initial: 'M', color: '#2979FF' },
        { initial: 'S', color: '#FF9800' },
        { initial: 'R', color: '#00BCD4' },
      ],
      additionalMembers: 2,
      amount: '250 MAD',
      lastExpense: 'Cleaning',
      time: '1d Ago',
      isStarred: false,
    },
  ];

  const invitation = {
    groupName: 'Gueliz Appartement',
    invitedBy: 'Salim',
    initial: 'S',
    color: '#E91E63',
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  const handleStarPress = (groupId) => {
    // Handle star/unstar functionality
    console.log('Toggle star for group:', groupId);
  };

  const handleAcceptInvitation = () => {
    console.log('Accept invitation');
  };

  const handleDeclineInvitation = () => {
    console.log('Decline invitation');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="container"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pb-4 pt-12">
          <View className="flex-row items-center">
            <BackButton />
            <Text className="ml-4 text-xl font-bold text-black">Groups</Text>
          </View>
          <TouchableOpacity className="h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Feather name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="mb-6 px-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={index}
                className={`mr-4 rounded-full px-4 py-2 ${
                  activeTab === tab ? 'bg-primary' : 'bg-gray-100'
                }`}
                onPress={() => handleTabPress(tab)}>
                <Text
                  className={`text-sm font-medium ${
                    activeTab === tab ? 'text-white' : 'text-gray-600'
                  }`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Groups List */}
        <View className="flex-1 px-4">
          {groupsData.map((group) => (
            <TouchableOpacity
              key={group.id}
              className="mb-4 flex-row items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <View className="flex-1 flex-row items-center">
                {/* Group Members */}
                <View className="mr-4 flex-row">
                  {group.members.map((member, index) => (
                    <View
                      key={index}
                      className={`h-10 w-10 items-center justify-center rounded-full border-2 border-white ${
                        index > 0 ? '-ml-2' : ''
                      }`}
                      style={{ backgroundColor: member.color }}>
                      <Text className="text-sm font-bold text-white">{member.initial}</Text>
                    </View>
                  ))}
                  {group.additionalMembers > 0 && (
                    <View className="-ml-2 h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-300">
                      <Text className="text-xs font-bold text-gray-600">
                        +{group.additionalMembers}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Group Info */}
                <View className="flex-1">
                  <Text className="text-base font-bold text-black">{group.name}</Text>
                  <Text className="text-sm text-red-500">{group.amount}</Text>
                </View>
              </View>

              {/* Right Side Info */}
              <View className="flex-row items-center">
                <View className="mr-3 items-end">
                  <Text className="text-sm text-gray-500">
                    {group.lastExpense} - {group.time}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => handleStarPress(group.id)}>
                  <Feather
                    name="star"
                    size={20}
                    color={group.isStarred ? '#FFD700' : '#E5E5E5'}
                    fill={group.isStarred ? '#FFD700' : 'none'}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {/* Invitation Card */}
          <View className="mb-6 rounded-xl bg-blue-50 p-4">
            <View className="flex-row items-center">
              <View
                className="mr-3 h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: invitation.color }}>
                <Text className="text-lg font-bold text-white">{invitation.initial}</Text>
              </View>

              <View className="flex-1">
                <Text className="text-base font-bold text-black">
                  Join "{invitation.groupName}" ?
                </Text>
                <Text className="text-sm text-gray-500">Invited By {invitation.invitedBy}</Text>
              </View>
            </View>

            <View className="mt-4 flex-row gap-3">
              <TouchableOpacity
                className="flex-1 rounded-lg bg-primary py-3"
                onPress={handleAcceptInvitation}>
                <Text className="text-center font-semibold text-white">Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 rounded-lg border border-gray-300 py-3"
                onPress={handleDeclineInvitation}>
                <Text className="text-center font-semibold text-gray-600">Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GroupsScreen;
