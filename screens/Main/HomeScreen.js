import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { CircularProgress } from 'components/CircularProgress';
import Expense from 'models/expense/Expense';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import User from 'models/auth/user';
import { DEFAULT_CATEGORIES } from 'constants/category';
import ExpenseListItem from 'components/ExpenseListItem';
import Avatar from 'components/Avatar';
import Group from 'models/group/group';
import { auth } from 'firebase';

const HomeScreen = () => {
  const navigation = useNavigation();

  const [user, setUser] = useState('');
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoadingUser(true);
      try {
        const userDetails = await User.getUserDetails();
        setUser(userDetails);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  const [RecentlyActivity, setRecentlyActivity] = useState([]);
  const [transformedRecentActivity, setTransformedRecentActivity] = useState([]);
  const [oweYou, setOweYou] = useState(0);
  const [youOwe, setYouOwe] = useState(0);
  const [groupName, setGroupName] = useState('No group set yet');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);

  // Function to fetch recent activity for selected group
  const fetchRecentlyActivity = useCallback(async () => {
    try {
      if (selectedGroup) {
        // Fetch recent activity for the selected group (limit to 3)
        const recentActivity = await Expense.getExpensesByGroupWithLimit(selectedGroup, 3);
        setRecentlyActivity(recentActivity);
        
        // Transform the data to include usernames
        const transformedData = await Promise.all(
          recentActivity.map(item => transformExpenseData(item))
        );
        setTransformedRecentActivity(transformedData);
      } else {
        // Fallback to user's recent activity if no group is selected
        const recentActivity = await Expense.RecentlyActivityByUser();
        setRecentlyActivity(recentActivity);
        
        // Transform the data to include usernames
        const transformedData = await Promise.all(
          recentActivity.map(item => transformExpenseData(item))
        );
        setTransformedRecentActivity(transformedData);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  }, [selectedGroup]);

  useFocusEffect(
    useCallback(() => {
      fetchRecentlyActivity();
    }, [fetchRecentlyActivity])
  );

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoadingUser(true);
      try {
        const userDetails = auth.currentUser.uid;
        setUser(userDetails);
        console.log('User ID:', userDetails);
        const userGroups = await Group.getGroupsByUser(userDetails);
        setGroups(userGroups);
        console.log('User Groups:', userGroups);

        // Set initial group if groups exist
        if (userGroups.length > 0) {
          const firstGroup = userGroups[0];
          setSelectedGroup(firstGroup.id);
          setGroupName(firstGroup.name);
          
          // Fetch members for the first group
          const members = await Group.getMembersByGroup(firstGroup.id);
          setGroupMembers(members);
          
          // Fetch recent activity for the first group
          const recentActivity = await Expense.getExpensesByGroupWithLimit(firstGroup.id, 3);
          setRecentlyActivity(recentActivity);
          
          // Transform the data to include usernames
          const transformedData = await Promise.all(
            recentActivity.map(item => transformExpenseData(item))
          );
          setTransformedRecentActivity(transformedData);
          
          console.log('Group Members:', members);
          console.log('Initial Group Activity:', recentActivity);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  // Function to handle group selection
  const handleGroupSelection = async (groupId, groupName) => {
    try {
      setSelectedGroup(groupId);
      setGroupName(groupName);
      setShowGroupModal(false);
      
      // Fetch members for the selected group
      const members = await Group.getMembersByGroup(groupId);
      setGroupMembers(members);
      
      // Fetch recent activity for the selected group
      const recentActivity = await Expense.getExpensesByGroupWithLimit(groupId, 3);
      setRecentlyActivity(recentActivity);
      
      // Transform the data to include usernames
      const transformedData = await Promise.all(
        recentActivity.map(item => transformExpenseData(item))
      );
      setTransformedRecentActivity(transformedData);
      
      console.log('Selected Group ID:', groupId);
      console.log('Selected Group Name:', groupName);
      console.log('Group Members:', members);
      console.log('Group Recent Activity:', recentActivity);
    } catch (error) {
      console.error('Error fetching group data:', error);
    }
  };

  const expenseData = [
    { category: 'Groceries', percentage: 50, color: '#2979FF' },
    { category: 'Rent', percentage: 30, color: '#2A67BF' },
    { category: 'Cleaning', percentage: 15, color: '#83B1FF' },
    { category: 'Others', percentage: 5, color: '#E6F0FF' },
  ];

  const transformExpenseData = async (activity) => {
    try {
      // Get username from user_id
      const username = await User.getUsernameById(activity.user_id);
      return {
        id: activity.id,
        name: activity.title,
        amount: activity.amount,
        category: activity.category,
        time: activity.time,
        paidBy: username,
      };
    } catch (error) {
      console.error('Error fetching username:', error);
      return {
        id: activity.id,
        name: activity.title,
        amount: activity.amount,
        category: activity.category,
        time: activity.time,
        paidBy: 'Unknown User',
      };
    }
  };

  const handleExpensePress = (expenseData) => {
    console.log('Expense pressed:', expenseData);
    // Navigate to expense details or perform other actions
  };

  // Convert group members to friends format for display
  const friends = groupMembers.map((member, index) => ({
    name: member.name || member.username || 'Unknown',
    initial: (member.name || member.username || 'U').charAt(0).toUpperCase(),
    color: ['#2979FF', '#FF9800', '#00BCD4', '#673AB7', '#E91E63'][index % 5],
  }));

  return (
    <ScrollView className="container flex flex-1 gap-6 bg-white pb-6 pt-2 ">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-4 pt-12">
        <View className="flex-row items-center">
          <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Text className="font-dmsans-bold text-lg text-white">M</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-500">Good morning 👋</Text>
            {isLoadingUser ? (
              <>
                <View className="mb-2 h-6 w-48 rounded bg-gray-100" />
              </>
            ) : (
              <>
                <Text className="mb-2 font-dmsans-bold text-xl text-black">{user.username}</Text>
              </>
            )}
          </View>
        </View>
        <TouchableOpacity className="relative" onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={24} color="#666" />
          <View className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500" />
        </TouchableOpacity>
      </View>

      {/* Balance Cards */}
      <View className="flex gap-8 pb-4">
        <View className="flex-row rounded-md border border-gray-100 px-4 py-2">
          <View className="mr-2 flex-1">
            <Text className="mb-1 text-lg font-medium text-gray-500">Owe You</Text>
            <Text className="font-dmsans-bold text-2xl text-error">
              {oweYou} <Text className="text-sm">MAD</Text>
            </Text>
          </View>
          <View className="ml-2 flex-1">
            <Text className="mb-1 text-lg font-medium text-gray-500">You Owe</Text>
            <Text className="font-dmsans-bold text-2xl text-green-500">
              {youOwe} <Text className="text-sm">MAD</Text>
            </Text>
          </View>
        </View>

        {/* Overview Section */}
        <View className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <Text className="mb-4 text-lg font-medium text-black">April 2025 Overview</Text>

          <View className="flex-row items-center">
            <View className="relative mr-6">
              <CircularProgress percentage={50} color="#2979FF" />
            </View>

            <View className="flex-1">
              {expenseData.map((item, index) => (
                <View key={index} className="mb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View
                      className="mr-2 h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text className="text-lg font-normal text-gray-500">{item.category}</Text>
                  </View>
                  <Text className="text-lg font-medium text-black">{item.percentage}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="mx-4 ">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-medium text-black">Recently Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllExpenses')}>
              <Text className="font-medium text-primary">See All</Text>
            </TouchableOpacity>
          </View>

          <View>
            {transformedRecentActivity.map((item) => (
              <ExpenseListItem
                key={item.id}
                {...item}
                onPress={handleExpensePress}
                showBorder={false}
                currency="MAD"
              />
            ))}
          </View>
        </View>

        {/* Group Members */}
        <View className="mx-4 ">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-medium text-black">{groupName}</Text>
            <TouchableOpacity onPress={() => setShowGroupModal(true)}>
              <Text className="font-medium text-primary">Switch Group</Text>
            </TouchableOpacity>
          </View>

          {/* Group selection modal */}
          <Modal
            visible={showGroupModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowGroupModal(false)}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
              <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 20, minWidth: 250 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Select Group</Text>
                {groups.map((group) => (
                  <Pressable
                    key={group.id}
                    onPress={() => handleGroupSelection(group.id, group.name)}
                    style={{ 
                      paddingVertical: 10,
                      backgroundColor: selectedGroup === group.id ? '#f0f0f0' : 'transparent',
                      borderRadius: 5,
                      paddingHorizontal: 10
                    }}
                  >
                    <Text style={{ 
                      fontSize: 16,
                      fontWeight: selectedGroup === group.id ? 'bold' : 'normal'
                    }}>
                      {group.name}
                    </Text>
                  </Pressable>
                ))}
                <Pressable onPress={() => setShowGroupModal(false)} style={{ marginTop: 10 }}>
                  <Text style={{ color: 'red', textAlign: 'center' }}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <View className="flex-row justify-between">
            {friends.map((friend, index) => (
              <View key={index}>
                <Avatar
                  initial={friend.initial}
                  name={friend.name}
                  color={friend.color}
                  size="medium"
                  showName={true}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;