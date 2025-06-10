import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from 'components/Header';
import GroupsList from 'components/GroupsList';

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

  const handleGroupPress = (group) => {
    console.log('Navigate to group:', group.name);
    // navigation.navigate('GroupDetails', { groupId: group.id });
  };

  const handleStarPress = (groupId) => {
    console.log('Toggle star for group:', groupId);
    // Update the groups data state here
  };

  const handleAcceptInvitation = () => {
    console.log('Accept invitation');
  };

  const handleDeclineInvitation = () => {
    console.log('Decline invitation');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="container">
        {/* Header */}
        <Header title="Groups" showIcon={true} route="AddNewGroup" />

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
                <Text className={`text-sm ${activeTab === tab ? 'text-white' : 'text-gray-600'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Groups List with Invitation */}
        <ScrollView
          className="flex-1 "
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Groups List */}
          <GroupsList
            groups={groupsData}
            onGroupPress={handleGroupPress}
            onStarPress={handleStarPress}
          />

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
