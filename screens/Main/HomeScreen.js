import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Feather, Fontisto, MaterialIcons } from '@expo/vector-icons';
import PieChart from 'components/PieChart';
import Expense from 'models/expense/Expense';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import User from 'models/auth/user';
import { DEFAULT_CATEGORIES } from 'constants/category';
import ExpenseListItem from 'components/ExpenseListItem';
import Avatar from 'components/Avatar';
import Group from 'models/group/group';
import { auth } from 'firebase';
import SwitchGroupModal from 'components/SwitchGroupModal';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Notification from 'models/notifications/notifications';
import { capitalizeFirst, getFirstLetterCapitalized } from 'utils/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react-native';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  const [user, setUser] = useState('');
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  console.log('User', user);

  const [RecentlyActivity, setRecentlyActivity] = useState([]);
  const [transformedRecentActivity, setTransformedRecentActivity] = useState([]);
  const [oweYou, setOweYou] = useState(0);
  const [youOwe, setYouOwe] = useState(0);
  const [groupName, setGroupName] = useState(t('home.noGroupSet'));
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // New state for overview data
  const [overviewData, setOverviewData] = useState({
    categoryData: [],
    totalAmount: 0,
    monthName: '',
    year: new Date().getFullYear(),
    expenseCount: 0,
  });
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);

  // State for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingGroups, setRefreshingGroups] = useState(false);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [isLoadingGroupMembers, setIsLoadingGroupMembers] = useState(true);

  // State for unread notifications count
  const [unreadCount, setUnreadCount] = useState(0);

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
        monthName: new Date().toLocaleDateString(
          i18n.language === 'ar' ? 'ar-SA' : i18n.language === 'fr' ? 'fr-FR' : 'en-US',
          { month: 'long' }
        ),
        year: new Date().getFullYear(),
        expenseCount: 0,
      });
    } finally {
      setIsLoadingOverview(false);
    }
  }, [selectedGroup, i18n.language]);

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
    setIsLoadingActivity(true);

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
    } finally {
      setIsLoadingActivity(false);
    }
  }, [selectedGroup]);

  // Fetch unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await Notification.countUnreadNotifications();
      setUnreadCount(count);
    } catch (e) {
      setUnreadCount(0);
    }
  }, []);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchRecentlyActivity(),
        fetchExpenseOverview(),
        fetchBalances(),
        fetchUnreadCount(),
      ]);
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchRecentlyActivity, fetchExpenseOverview, fetchBalances, fetchUnreadCount]);

  // Refresh groups handler
  const refreshGroups = useCallback(async () => {
    setRefreshingGroups(true);
    try {
      const userId = auth.currentUser?.uid || user?.id;
      if (userId) {
        const userGroups = await Group.getGroupsByUser(userId);
        setGroups(userGroups);
      }
    } catch (error) {
      console.error('Error refreshing groups:', error);
    } finally {
      setRefreshingGroups(false);
    }
  }, [user]);

  // Open modal and refresh groups
  const openGroupModal = useCallback(() => {
    refreshGroups();
    setShowGroupModal(true);
  }, [refreshGroups]);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
      fetchRecentlyActivity();
      fetchExpenseOverview();
      fetchBalances();
    }, [fetchRecentlyActivity, fetchExpenseOverview, fetchBalances, fetchUnreadCount])
  );

  useEffect(() => {
    const fetchUserAndGroups = async () => {
      setIsLoadingUser(true);
      setIsLoadingGroupMembers(true);
      try {
        const userId = auth.currentUser.uid;
        // Use the new model method to fetch user and groups
        const { user: userDetails, groups: userGroups } = await Group.getUserAndGroups(
          userId,
          User.getUserDetails
        );
        setUser(userDetails);
        setGroups(userGroups);
        let initialGroupId = null;
        let initialGroupName = t('home.noGroupSet');
        // Try to restore selected group from storage
        const storedGroupId = await AsyncStorage.getItem('selectedGroupId');
        if (storedGroupId && userGroups.some((g) => String(g.id) === storedGroupId)) {
          initialGroupId = storedGroupId;
          const foundGroup = userGroups.find((g) => String(g.id) === storedGroupId);
          if (foundGroup) initialGroupName = foundGroup.name;
        } else if (userGroups.length > 0) {
          initialGroupId = userGroups[0].id;
          initialGroupName = userGroups[0].name;
        }
        setSelectedGroup(initialGroupId);
        setGroupName(initialGroupName);
        if (initialGroupId) {
          // Fetch members and recent activity for the selected group
          const members = await Group.getMembersByGroup(initialGroupId);
          setGroupMembers(members);
          const recentActivity = await Expense.getExpensesByGroupWithLimit(initialGroupId, 3);
          setRecentlyActivity(recentActivity);
          const transformedData = await Promise.all(
            recentActivity.map((item) => transformExpenseData(item))
          );
          setTransformedRecentActivity(transformedData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingUser(false);
        setIsLoadingGroupMembers(false);
      }
    };
    fetchUserAndGroups();
  }, [t]);

  // When user switches group, store it in AsyncStorage
  const handleGroupSelection = async (groupId, groupName) => {
    setIsLoadingGroupMembers(true);

    try {
      setSelectedGroup(groupId);
      setGroupName(groupName);
      setShowGroupModal(false);
      await AsyncStorage.setItem('selectedGroupId', String(groupId));

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
      setSelectedGroupId(groupId);

      console.log('Selected Group ID:', groupId);
      console.log('Selected Group Name:', groupName);
      console.log('Group Members:', members);
      console.log('Group Recent Activity:', recentActivity);
    } catch (error) {
      console.error('Error fetching group data:', error);
    } finally {
      setIsLoadingGroupMembers(false);
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
        paidBy: t('common.unknownUser', { defaultValue: 'Unknown User' }),
      };
    }
  };

  const handleExpensePress = (expenseData) => {
    console.log('Expense pressed:', expenseData);
    // Navigate to expense details or perform other actions
  };

  // Convert group members to friends format for display
  const friends = groupMembers.map((member, index) => ({
    name: member.name || member.username || t('common.unknownUser', { defaultValue: 'Unknown' }),
    initial: (member.name || member.username || 'U').charAt(0).toUpperCase(),
    color: ['#2979FF', '#FF9800', '#00BCD4', '#673AB7', '#E91E63'][index % 5],
  }));

  // Get currency based on current language
  const getCurrency = () => {
    return t('common.currency');
  };
  console.log('transformedRecentActivity', transformedRecentActivity);

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };
  const getDynamicGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      return t('home.goodMorning');
    } else if (currentHour >= 12 && currentHour < 17) {
      return t('home.goodAfternoon');
    } else if (currentHour >= 17 && currentHour < 21) {
      return t('home.goodEvening');
    } else {
      return t('home.goodNight');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-800" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center justify-between px-4 pb-4 bg-white dark:bg-slate-800">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleProfilePress}>
            <View className="items-center justify-center w-12 h-12 mr-3 rounded-full bg-primary">
              <Text className="text-lg text-white font-dmsans-bold dark:text-gray-800">
                {getFirstLetterCapitalized(user.username)}
              </Text>
            </View>
          </TouchableOpacity>
          <View>
            <Text className="text-sm font-normal text-gray-500 dark:text-gray-300">{getDynamicGreeting()}</Text>
            {isLoadingUser ? (
              <>
                <View className="w-48 h-6 mb-2 bg-gray-100 rounded dark:bg-gray-700" />
              </>
            ) : (
              <>
                <Text className="mb-2 text-xl text-black font-dmsans-bold dark:text-white">{user.username}</Text>
              </>
            )}
          </View>
        </View>
        <TouchableOpacity className="relative" onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={24} color="#666" />
          {unreadCount > 0 && (
            <View className="absolute items-center justify-center px-1 bg-red-500 rounded-full -right-1 -top-1 min-h-4 min-w-4">
              <Text className="text-xs font-bold text-white dark:text-gray-800">{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <ScrollView
        className="container flex flex-1 gap-6 pt-2 bg-white dark:bg-slate-800"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Header */}

        {/* Balance Cards */}
        <View className="flex gap-8 pb-4">
          {/* <View className="flex-row px-4 py-2 border border-gray-100 rounded-md">
            <View className="flex-1 mr-2">
              <View className="flex-row items-center mb-2">
                <View className="p-2 mr-2 bg-green-100 rounded-full">
                  <TrendingUp size={16} color="#34C759" />
                </View>
                <Text className="text-base font-medium text-gray-900">{t('home.oweYou')}</Text>
              </View>
              <Text className="text-2xl text-green-500 font-dmsans-bold">
                {oweYou.toFixed(2)} <Text className="text-sm text-gray-500">{getCurrency()}</Text>
              </Text>
              <Text className="mt-1 text-sm text-gray-500 font-dmsans">
                {t('home.friendsOweYou')}
              </Text>
            </View>

            <View className="flex-1 ml-2">
              <View className="flex-row items-center mb-2">
                <View className="p-2 mr-2 bg-red-100 rounded-full">
                  <TrendingDown size={16} color="#ff3b30" />
                </View>
                <Text className="text-base font-medium text-gray-900">{t('home.youOwe')}</Text>
              </View>
              <Text className="text-2xl text-red-500 font-dmsans-bold ">
                {youOwe.toFixed(2)} <Text className="text-sm text-gray-500">{getCurrency()}</Text>
              </Text>
              <Text className="mt-1 text-sm text-gray-500 font-dmsans">
                {t('home.youOweFriends')}
              </Text>
            </View>
          </View> */}
          {/* Overview Section */}
          <View className="p-4 bg-white border border-gray-100 rounded-xl dark:bg-slate-700 dark:border-gray-700">
            <Text className="mb-4 text-lg font-medium text-black dark:text-white">
              {t('home.monthlyOverview', {
                month: overviewData.monthName,
                year: overviewData.year,
              })}
            </Text>

            {isLoadingOverview ? (
              <View className="flex-row items-center">
                <View className="relative mr-6">
                  <View className="w-20 h-20 bg-gray-200 rounded-full" />
                </View>
                <View className="flex-1">
                  <View className="w-32 h-4 mb-2 bg-gray-200 rounded" />
                  <View className="w-24 h-4 mb-2 bg-gray-200 rounded" />
                  <View className="h-4 mb-2 bg-gray-200 rounded w-28" />
                </View>
              </View>
            ) : overviewData.categoryData.length === 0 ? (
              <View className="flex flex-row items-center justify-around py-8">
                {/* <Feather name="pie-chart" size={48} color="#ccc" /> */}
                <View className="">
                  <Text className="mt-2 text-lg text-gray-500 dark:text-gray-300">
                    {t('home.noExpensesThisMonth')}
                  </Text>
                  <Text className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                    Tap + to add Your first Expense
                  </Text>
                </View>
                <View className="items-center justify-center bg-blue-100 rounded-full h-18 w-18 dark:bg-slate-600">
                  <Wallet size={38} color="#3B82F6" strokeWidth={2.5} />
                </View>
              </View>
            ) : (
              <View className="flex-row items-center">
                <View className="relative mr-6">
                  <PieChart data={overviewData.categoryData} size={80} />
                </View>

                <View className="flex-1">
                  {overviewData.categoryData.slice(0, 4).map((item, index) => (
                    <View key={index} className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <View
                          className="w-3 h-3 mr-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <Text className="text-lg font-normal text-gray-500 dark:text-gray-300">
                          {t(`categories.${item.category.toLowerCase()}`, {
                            defaultValue: item.category,
                          })}
                        </Text>
                      </View>
                      <Text className="text-lg font-medium text-black">{item.percentage}%</Text>
                    </View>
                  ))}
                  {overviewData.categoryData.length > 4 && (
                    <Text className="text-sm text-gray-400 dark:text-gray-500">
                      {t('home.moreCategoriesCount', {
                        count: overviewData.categoryData.length - 4,
                      })}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Total amount display */}
            {!isLoadingOverview && overviewData.totalAmount > 0 && (
              <View className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-300">
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 font-dmsans-medium dark:text-white">
                    {t('home.totalExpenses')}
                  </Text>
                  <Text className="text-black font-dmsans-bold dark:text-white">
                    {overviewData.totalAmount.toFixed(2)} {getCurrency()}
                  </Text>
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-gray-500 font-dmsans-medium dark:text-white">
                    {t('home.totalTransactions')}
                  </Text>
                  <Text className="text-black dark:text-white">{overviewData.expenseCount}</Text>
                </View>
              </View>
            )}
          </View>
          {/* Recent Activity */}
          <View className="mx-4 ">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-medium text-black dark:text-white">{t('home.recentActivity')}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AllExpenses', { groupId: selectedGroup })}>
                <Text className="font-medium text-primary">{t('common.seeAll')}</Text>
              </TouchableOpacity>
            </View>

            <View>
              {isLoadingActivity ? (
                [...Array(3)].map((_, index) => (
                  <View
                    key={index}
                    className="flex-row items-center p-4 mb-4 rounded-lg bg-gray-50 dark:bg-slate-700">
                    <View className="w-12 h-12 mr-4 bg-gray-200 rounded-full" />
                    <View className="flex-1">
                      <View className="w-32 h-4 mb-2 bg-gray-200 rounded" />
                      <View className="w-24 h-3 bg-gray-200 rounded" />
                    </View>
                    <View className="items-end">
                      <View className="w-16 h-4 mb-2 bg-gray-200 rounded" />
                      <View className="w-12 h-3 bg-gray-200 rounded" />
                    </View>
                  </View>
                ))
              ) : transformedRecentActivity.length === 0 ? (
                <View className="items-center py-8">
                  <Feather name="activity" size={48} color="#ccc" />
                  <Text className="mt-2 text-gray-500">{t('home.noRecentActivity')}</Text>
                </View>
              ) : (
                transformedRecentActivity.map((item) => (
                  <ExpenseListItem
                    key={item.id}
                    {...item}
                    onPress={handleExpensePress}
                    showBorder={false}
                    currency={getCurrency()}
                  />
                ))
              )}
            </View>
          </View>
          {/* Group Members */}
          <View className="mx-4 ">
            <View className="flex-row items-start justify-between mb-4">
              <View>
                <Text className="text-lg font-medium text-black dark:text-white">
                  {capitalizeFirst(groupName)}
                </Text>
                <Text className="text-xs text-black font-dmsans dark:text-gray-300">{t('group.groupMembers')}</Text>
              </View>
              <TouchableOpacity onPress={openGroupModal}>
                <Text className="font-medium text-primary">{t('home.switchGroup')}</Text>
              </TouchableOpacity>
            </View>

            {/* Group selection modal */}
            <SwitchGroupModal
              visible={showGroupModal}
              onClose={() => setShowGroupModal(false)}
              groups={groups}
              selectedGroupId={selectedGroup}
              onGroupSelect={handleGroupSelection}
              title={t('group.switchGroup')}
              showCreateNewOption={true}
              onCreateNew={() => {
                // Handle navigation to create new group screen
                navigation.navigate('AddNewGroup');
              }}
              onRefresh={refreshGroups}
              refreshing={refreshingGroups}
            />

            {/* Only show members list if there are more than one member */}
            {groupMembers && groupMembers.length > 1 && (
              <>
                {isLoadingGroupMembers ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 4 }}
                    className="flex-row">
                    {[...Array(4)].map((_, index) => (
                      <View key={index} className="items-center mr-4">
                        <View className="w-16 h-16 mb-2 bg-gray-200 rounded-full" />
                        <View className="w-12 h-3 bg-gray-200 rounded" />
                      </View>
                    ))}
                  </ScrollView>
                ) : friends?.length === 0 ? (
                  <View className="items-center w-full gap-4 space-y-4">
                    <Feather name="users" size={48} color="#ccc" />
                    <Text className="text-gray-500 ">{t('home.noGroupMembers')}</Text>
                    <TouchableOpacity
                      className="mb-8 rounded-lg btn-primary bg-primary "
                      onPress={() => navigation.navigate('AddNewGroup')}>
                      <Text className="text-base font-semibold text-center text-white btn-primary-text">
                        {t('addGroup.title')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 4 }}
                    className="flex-row">
                    {friends?.map((friend, index) => (
                      <View key={index} className="mr-4">
                        <Avatar
                          initial={friend.initial}
                          name={friend.name}
                          color={friend.color}
                          size="medium"
                          showName={true}
                        />
                      </View>
                    ))}
                  </ScrollView>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
