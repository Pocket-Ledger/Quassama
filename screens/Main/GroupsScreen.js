import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BackButton } from 'components/BackButton';
import { useNavigation } from '@react-navigation/native';
import PlusIconButton from 'components/PlusIconButton';

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
      <View className="container ">
        {/* Header */}

        <View className="mb-6 flex flex-row items-center justify-start pb-4">
          <BackButton />
          <View className="w-full flex-row items-start justify-between ">
            <Text className="ml-12 mt-2 font-dmsans-bold text-xl text-black ">Groups</Text>
            <PlusIconButton route="AddNewGroup" />
          </View>
        </View>

        {/* Tabs */}
        <View className="mb-6 px-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={index}
                className={`mr-4 rounded-[3px] border border-gray-100 px-4 py-2 ${
                  activeTab === tab ? 'bg-primary' : 'bg-white'
                }`}
                onPress={() => handleTabPress(tab)}>
                <Text className={`text-sm  ${activeTab === tab ? 'text-white' : 'text-gray-600'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          className="flex-1 px-[10px]"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Groups List */}
          {groupsData.map((group) => (
            <TouchableOpacity
              key={group.id}
              className="mb-4 h-[123px] flex-row items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <View className="flex-1 flex-row items-center">
                {/* Group Members */}
                <View className="h-full flex-1 justify-between">
                  <Text className="text-[20px] font-medium text-black">{group.name}</Text>
                  <View className="mr-4 flex-row">
                    {group.members.map((member, index) => (
                      <View
                        key={index}
                        className={`h-10 w-10 items-center justify-center rounded-full border-2 border-white ${
                          index > 0 ? '-ml-2' : ''
                        }`}
                        style={{ backgroundColor: member.color }}>
                        <Text className="font-dmsans-bold text-sm text-white">
                          {member.initial}
                        </Text>
                      </View>
                    ))}
                    {group.additionalMembers > 0 && (
                      <View className="-ml-2 h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-300">
                        <Text className="font-dmsans-bold text-xs text-gray-600">
                          +{group.additionalMembers}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="font-dmsans-bold text-red-500">{group.amount}</Text>
                </View>
              </View>

              {/* Right Side Info */}
              <View className="h-full flex-col items-end justify-between">
                <TouchableOpacity onPress={() => handleStarPress(group.id)}>
                  <Feather
                    name="star"
                    size={20}
                    color={group.isStarred ? '#FFCC00' : '#E5E5E5'}
                    fill={group.isStarred ? '#FFCC00' : 'none'}
                  />
                </TouchableOpacity>
                <View className="items-end">
                  <Text className="text-gray-500">
                    {group.lastExpense} - {group.time}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Invitation Card */}
          <View className="my-6 rounded-xl bg-blue-50 p-4">
            <View className="flex-row items-center">
              <View
                className="mr-3 h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: invitation.color }}>
                <Text className="font-dmsans-bold text-lg text-white">{invitation.initial}</Text>
              </View>

              <View className="flex-1">
                <Text className="font-dmsans-bold text-base text-black">
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
                <Text className="text-center font-semibold text-gray-900">Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default GroupsScreen;
