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
import SwitchGroupModal from 'components/SwitchGroupModal';

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

  // New state for overview data
  const [overviewData, setOverviewData] = useState({
    categoryData: [],
    totalAmount: 0,
    monthName: '',
    year: new Date().getFullYear(),
    expenseCount: 0,
  });
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);

  // Function to fetch expense overview
  const fetchExpenseOverview = useCallback(async () => {
    setIsLoadingOverview(true);
    try {
      let overview;
      if (selectedGroup) {
        // Get overview for selected group
        overview = await Expense.getExpenseOverview(selectedGroup);
      } else {
        // Get overview for all user's expenses
        overview = await Expense.getExpenseOverviewAllGroups();
      }
      setOverviewData(overview);
    } catch (error) {
      console.error('Error fetching expense overview:', error);
      // Set default empty data on error
      setOverviewData({
        categoryData: [],
        totalAmount: 0,
        monthName: new Date().toLocaleDateString('en-US', { month: 'long' }),
        year: new Date().getFullYear(),
        expenseCount: 0,
      });
    } finally {
      setIsLoadingOverview(false);
    }
  }, [selectedGroup]);

  // Function to fetch balances
  const fetchBalances = useCallback(async () => {
    try {
      const owedToUser = await Expense.getTotalOwedToUser();
      const youOweAmount = await Expense.getTotalYouOwe();
      setOweYou(owedToUser);
      setYouOwe(youOweAmount);
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  }, []);

  // Function to fetch recent activity for selected group
  const fetchRecentlyActivity = useCallback(async () => {
    try {
      if (selectedGroup) {
        // Fetch recent activity for the selected group (limit to 3)
        const recentActivity = await Expense.getExpensesByGroupWithLimit(selectedGroup, 3);
        setRecentlyActivity(recentActivity);

        // Transform the data to include usernames
        const transformedData = await Promise.all(
          recentActivity.map((item) => transformExpenseData(item))
        );
        setTransformedRecentActivity(transformedData);
      } else {
        // Fallback to user's recent activity if no group is selected
        const recentActivity = await Expense.RecentlyActivityByUser();
        setRecentlyActivity(recentActivity);

        // Transform the data to include usernames
        const transformedData = await Promise.all(
          recentActivity.map((item) => transformExpenseData(item))
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
      fetchExpenseOverview();
      fetchBalances();
    }, [fetchRecentlyActivity, fetchExpenseOverview, fetchBalances])
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
            recentActivity.map((item) => transformExpenseData(item))
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
        recentActivity.map((item) => transformExpenseData(item))
      );
      setTransformedRecentActivity(transformedData);

      // Fetch updated overview for the selected group
      fetchExpenseOverview();

      console.log('Selected Group ID:', groupId);
      console.log('Selected Group Name:', groupName);
      console.log('Group Members:', members);
      console.log('Group Recent Activity:', recentActivity);
    } catch (error) {
      console.error('Error fetching group data:', error);
    }
  };

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

  // Calculate the primary percentage for the circular progress
  const primaryPercentage =
    overviewData.categoryData.length > 0 ? overviewData.categoryData[0].percentage : 0;
  const primaryColor =
    overviewData.categoryData.length > 0 ? overviewData.categoryData[0].color : '#2979FF';

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
              {oweYou.toFixed(2)} <Text className="text-sm">MAD</Text>
            </Text>
          </View>
          <View className="ml-2 flex-1">
            <Text className="mb-1 text-lg font-medium text-gray-500">You Owe</Text>
            <Text className="font-dmsans-bold text-2xl text-green-500">
              {youOwe.toFixed(2)} <Text className="text-sm">MAD</Text>
            </Text>
          </View>
        </View>

        {/* Overview Section */}
        <View className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <Text className="mb-4 text-lg font-medium text-black">
            {overviewData.monthName} {overviewData.year} Overview
          </Text>

          {isLoadingOverview ? (
            <View className="flex-row items-center">
              <View className="relative mr-6">
                <View className="h-20 w-20 rounded-full bg-gray-200" />
              </View>
              <View className="flex-1">
                <View className="mb-2 h-4 w-32 rounded bg-gray-200" />
                <View className="mb-2 h-4 w-24 rounded bg-gray-200" />
                <View className="mb-2 h-4 w-28 rounded bg-gray-200" />
              </View>
            </View>
          ) : overviewData.categoryData.length === 0 ? (
            <View className="items-center py-8">
              <Feather name="pie-chart" size={48} color="#ccc" />
              <Text className="mt-2 text-gray-500">No expenses for this month</Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <View className="relative mr-6">
                <CircularProgress percentage={primaryPercentage} color={primaryColor} />
              </View>

              <View className="flex-1">
                {overviewData.categoryData.slice(0, 4).map((item, index) => (
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
                {overviewData.categoryData.length > 4 && (
                  <Text className="text-sm text-gray-400">
                    +{overviewData.categoryData.length - 4} more categories
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Total amount display */}
          {!isLoadingOverview && overviewData.totalAmount > 0 && (
            <View className="mt-4 border-t border-gray-100 pt-4">
              <View className="flex-row justify-between">
                <Text className="text-gray-500">Total Expenses</Text>
                <Text className="font-dmsans-bold text-black">
                  {overviewData.totalAmount.toFixed(2)} MAD
                </Text>
              </View>
              <View className="mt-1 flex-row justify-between">
                <Text className="text-gray-500">Total Transactions</Text>
                <Text className="text-black">{overviewData.expenseCount}</Text>
              </View>
            </View>
          )}
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
            {transformedRecentActivity.length === 0 ? (
              <View className="items-center py-8">
                <Feather name="activity" size={48} color="#ccc" />
                <Text className="mt-2 text-gray-500">No recent activity</Text>
              </View>
            ) : (
              transformedRecentActivity.map((item) => (
                <ExpenseListItem
                  key={item.id}
                  {...item}
                  onPress={handleExpensePress}
                  showBorder={false}
                  currency="MAD"
                />
              ))
            )}
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
          <SwitchGroupModal
            visible={showGroupModal}
            onClose={() => setShowGroupModal(false)}
            groups={groups}
            selectedGroupId={selectedGroup}
            onGroupSelect={handleGroupSelection}
            title="Switch Group"
            showCreateNewOption={true}
            onCreateNew={() => {
              // Handle navigation to create new group screen
              navigation.navigate('AddNewGroup');
            }}
          />

          <View className="flex-row justify-between">
            {friends.length === 0 ? (
              <View className="w-full items-center py-8">
                <Feather name="users" size={48} color="#ccc" />
                <Text className="mt-2 text-gray-500">No group members</Text>
              </View>
            ) : (
              friends.map((friend, index) => (
                <View key={index}>
                  <Avatar
                    initial={friend.initial}
                    name={friend.name}
                    color={friend.color}
                    size="medium"
                    showName={true}
                  />
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
