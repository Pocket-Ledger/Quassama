import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Header from 'components/Header';
import { DEFAULT_CATEGORIES } from 'constants/category';
import ExpenseListItem from 'components/ExpenseListItem';
import Avatar from 'components/Avatar';
import { useAlert } from 'hooks/useAlert';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Expense from 'models/expense/Expense';
import Group from 'models/group/group'; // Import your Group model
import User from 'models/auth/user';
import { extractHourAndMinute, extractHourMinutePeriod } from 'utils/time';
import FloatingPlusButton from 'components/FloatingPlusButton';
import { useTranslation } from 'react-i18next';
import { getAuth } from 'firebase/auth';
import CustomAlert from 'components/CustomALert';
import Logger from 'utils/looger';
import { cleanupAllUserGroups } from 'utils/cleanup';

const LIMIT = 5;

const GroupDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = route.params;
  const { t } = useTranslation();

  const [groupData, setGroupData] = useState(null);
  const [TotalExpenses, setTotalExpenses] = useState(0);
  const [youPaid, setYouPaid] = useState(0);
  const [youOwe, setYouOwe] = useState(0);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [balanceByAllUsers, setBalanceByAllUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Use the alert hook
  const { alertConfig, hideAlert, showSuccess, showError, showConfirm } = useAlert();

  console.log('groupData', groupData);

  const handleCleanup = async () => {
    await cleanupAllGroups();
    // Refresh your group data after cleanup
  };

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      setLoading(true);
      handleCleanup();

      const fetchGroupAndExpenses = async () => {
        try {
          const groupRef = doc(db, 'groups', groupId);

          // 1) Fire four independent calls in parallel:
          const [
            snap,
            rawExpenses,
            allExpenses,
            userPaidAmount,
            totalsByUser,
            balanceByUser,
            balanceByAllUsersInGroup,
          ] = await Promise.all([
            getDoc(groupRef),
            Expense.getExpensesByGroupWithLimit(groupId, LIMIT),
            Expense.getExpensesByGroup(groupId),
            Expense.getTotalExpensesByUserAndGroup(groupId),
            Expense.getTotalExpensesPerUserByGroup(groupId),
            Expense.getBalanceByUserAndGroup(groupId),
            Expense.getBalanceByAllUsersInGroup(groupId),
          ]);

          console.log('Total spent by each user:', totalsByUser);
          console.log('Balance by user:', balanceByUser);
          console.log('Balance by all users in group:', balanceByAllUsersInGroup);

          // 2) If group exists, set its basic data
          if (snap.exists() && mounted) {
            const data = snap.data();
            setGroupData({
              id: snap.id,
              name: data.name,
              totalExpenses: data.totalExpenses,
              youPaid: data.youPaid,
              youOwe: data.youOwe,
              members: data.members || [],
              created_by: data.created_by,
            });
          }

          // 3) Build a map of user_id → username (fetching each only once)
          const uniqueUserIds = [...new Set(rawExpenses.map((e) => e.user_id))];
          const usernameMap = {};
          await Promise.all(
            uniqueUserIds.map(async (id) => {
              usernameMap[id] = await User.getUsernameById(id).catch(() => id);
            })
          );

          // 4) Merge in usernames
          const expensesWithUsernames = rawExpenses.map((exp) => ({
            id: exp.id,
            name: exp.title,
            amount: exp.amount,
            category: exp.category,
            time: exp.incurred_at.toDate().toLocaleString(),
            paidBy: usernameMap[exp.user_id],
          }));

          // 5) Compute totals
          const totalAmount = allExpenses.reduce((sum, { amount }) => sum + amount, 0);

          // Get current user's balance to determine what they owe
          const auth = getAuth();
          const currentUserId = auth.currentUser ? auth.currentUser.uid : null;
          const userBalance = balanceByAllUsersInGroup[currentUserId] || 0;
          const actualOwe = userBalance < 0 ? Math.abs(userBalance) : 0;

          // 6) Update state in one go
          if (mounted) {
            setTotalExpenses(totalAmount);
            setYouPaid(userPaidAmount);
            setYouOwe(actualOwe);
            setRecentExpenses(expensesWithUsernames);
            setBalanceByAllUsers(balanceByAllUsersInGroup); // Store the balance data
          }
        } catch (err) {
          console.error('Error fetching group details or expenses', err);
        } finally {
          if (mounted) setLoading(false);
        }
      };

      fetchGroupAndExpenses();
      return () => {
        mounted = false;
      };
    }, [groupId])
  );

  const handleDeleteGroup = async () => {
    setDeleteLoading(true);
    Logger.error(groupId);

    try {
      const auth = getAuth();
      const currentUserId = auth.currentUser ? auth.currentUser.uid : null;
      
      if (!currentUserId) {
        showError(t('common.error'), 'User not authenticated', hideAlert);
        return;
      }

      await Group.deleteGroup(groupId, currentUserId);

      // Show success alert
      showSuccess(t('common.success'), t('groupDetails.groupDeletedSuccess'), () => {
        hideAlert();
        navigation.goBack();
      });
    } catch (error) {
      console.error('Error deleting group:', error);
      showError(t('common.error'), t('groupDetails.groupDeleteError'), hideAlert);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOptionsPress = () => {
    setShowOptionsMenu(!showOptionsMenu);
  };

  const handleEditGroup = () => {
    setShowOptionsMenu(false);
    navigation.navigate('EditGroup', { groupId });
  };

  const handleDeletePress = () => {
    setShowOptionsMenu(false);
    showConfirm(
      t('groupDetails.deleteGroupTitle'),
      t('groupDetails.deleteGroupMessage'),
      handleDeleteGroup,
      t('common.delete'),
      t('common.cancel')
    );
  };

  if (loading || !groupData) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2979FF" />
        <Text className="mt-4">{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  // Destructure real data
  const { name, members } = groupData;

  // Helper function to get balance for a member
  const getMemberBalance = (memberId) => {
    return balanceByAllUsers[memberId] || 0;
  };

  // Helper function to format balance with appropriate sign and color
  const formatBalance = (balance) => {
    const formattedNumber = parseFloat(balance).toFixed(1);
    if (balance > 0) {
      return `+${formattedNumber}`;
    } else if (balance < 0) {
      return `${formattedNumber}`;
    }
    return '0.0';
  };

  const handleSettleUp = async () => {
    // Check if user is group admin
    if (!isGroupCreator) {
      showError(t('common.error'), t('groupDetails.onlyAdminCanSettle'), hideAlert);
      return;
    }

    // Show confirmation dialog
    showConfirm(
      t('groupDetails.settleUpTitle'),
      t('groupDetails.settleUpMessage'),
      async () => {
        setLoading(true);
        try {
          const result = await Expense.settleUpGroup(groupId);

          if (result && result.success) {
            // Show success message with settlement details
            const settlementsCount = result.settlementsCreated
              ? result.settlementsCreated.length
              : 0;
            const message =
              settlementsCount > 0
                ? `${result.message}\nTotal balanced: ${t('common.currency')} ${result.totalSettled || 0}`
                : result.message || 'Settlement completed successfully';

            showSuccess(t('common.success'), message, () => {
              hideAlert();
              // Refresh the screen data
              navigation.replace('GroupDetails', { groupId });
            });
          } else {
            showError(t('common.error'), 'Settlement failed - invalid response', hideAlert);
          }
        } catch (error) {
          console.error('Error settling up:', error);
          let errorMessage = t('groupDetails.settleUpError');

          if (error.message === 'Only group admin can settle up expenses') {
            errorMessage = t('groupDetails.onlyAdminCanSettle');
          } else if (error.message === 'No expenses found to settle') {
            errorMessage = t('groupDetails.noExpensesToSettle');
          } else if (error.message === 'All expenses are already settled') {
            errorMessage = t('groupDetails.alreadySettled');
          } else if (error.message) {
            errorMessage = error.message;
          }

          showError(t('common.error'), errorMessage, hideAlert);
        } finally {
          setLoading(false);
        }
      },
      t('groupDetails.settleUp'),
      t('common.cancel')
    );
  };

  const handleSeeAllExpenses = () => {
    navigation.navigate('AllExpenses', { groupId });
  };

  const handleExpensePress = (expense) => {
    console.log('Expense pressed:', expense);
  };

  const auth = getAuth();
  const currentUserId = auth.currentUser ? auth.currentUser.uid : null;
  const isGroupCreator = groupData && groupData.created_by === currentUserId;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="container">
        <Header
          title={name}
          rightIcon={
            isGroupCreator ? (
              <View>
                <TouchableOpacity
                  onPress={handleOptionsPress}
                  className="h-10 w-10 items-center justify-center rounded-full bg-primary">
                  <Feather name="more-vertical" size={20} color="#ffff" />
                </TouchableOpacity>

                {/* Options Menu */}
                {showOptionsMenu && (
                  <View className="absolute right-0 top-12 z-10 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                    <TouchableOpacity
                      onPress={handleEditGroup}
                      className="flex-row items-center border-b border-gray-100 px-4 py-3">
                      <Feather name="settings" size={18} color="#374151" />
                      <Text className="ml-3 font-dmsans-medium text-base text-gray-700">
                        {t('groupDetails.editGroup')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleDeletePress}
                      className="flex-row items-center px-4 py-3">
                      <Feather name="trash-2" size={18} color="#EF4444" />
                      <Text className="ml-3 font-dmsans-medium text-base text-red-500">
                        {t('groupDetails.deleteGroup')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : null
          }
        />

        {/* Overlay to close menu when clicking outside */}
        {showOptionsMenu && (
          <TouchableOpacity
            className="z-5 absolute inset-0"
            onPress={() => setShowOptionsMenu(false)}
            activeOpacity={1}
          />
        )}

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Group Summary Card */}
          <View className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <Text className="text-center font-dmsans-medium text-base text-black/75">
              {t('groupDetails.totalGroupExpenses')}
            </Text>
            <Text className="text-center font-dmsans-medium text-2xl text-black">
              {t('common.currency')} {TotalExpenses}
            </Text>

            <View className="mt-6 flex-row justify-between ">
              <View className="flex-1">
                <Text className="font-dmsans-medium text-sm text-black/75">
                  {t('groupDetails.youPaid')}
                </Text>
                <Text className="font-dmsans-medium text-lg text-black">
                  {youPaid} {t('common.currency')}
                </Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="font-dmsans-medium text-sm text-black/75">
                  {t('groupDetails.youOwe')}
                </Text>
                <Text className="font-dmsans-medium text-lg text-red-500">
                  -{youOwe} {t('common.currency')}
                </Text>
              </View>
            </View>
          </View>

          {/* Settle Up Button - Only show for group admin and when there are imbalances */}
          {isGroupCreator &&
            TotalExpenses > 0 &&
            Object.values(balanceByAllUsers).some((balance) => Math.abs(balance) > 0.01) && (
              <TouchableOpacity
                className="mb-6 rounded-lg bg-primary py-4"
                onPress={handleSettleUp}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-center text-base font-semibold text-white">
                    {t('groupDetails.settleUp')}
                  </Text>
                )}
              </TouchableOpacity>
            )}

          {/* Members List with Horizontal Scroll */}
          <View className="mb-6">
            <Text className="mb-3 text-lg font-medium text-black">Members</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4 }}
              className="flex-row">
              {members
                .filter((member) => typeof member === 'object' && member !== null)
                .map((member, idx) => {
                  const memberBalance = getMemberBalance(member.id);
                  const formattedBalance = formatBalance(memberBalance);

                  return (
                    <View
                      key={member.id || `member-${idx}-${member.name || 'unknown'}`}
                      className="mr-4 items-center">
                      <Avatar
                        initial={member.initial}
                        name={member.name}
                        color={member.color}
                        size="medium"
                        showName={true}
                      />
                      <Text
                        className={`mt-1 text-xs font-medium ${
                          memberBalance > 0
                            ? 'text-green-500'
                            : memberBalance < 0
                              ? 'text-red-500'
                              : 'text-gray-500'
                        }`}>
                        {formattedBalance} {t('common.currency')}
                      </Text>
                    </View>
                  );
                })}
            </ScrollView>
          </View>

          {/* Recently Expenses Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-medium text-black">
              {t('groupDetails.recentExpenses')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllExpenses', { groupId })}>
              <Text className="text-base font-medium text-primary">{t('common.seeAll')}</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Expenses List */}
          <View className="gap-4">
            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense) => (
                <ExpenseListItem
                  key={expense.id}
                  id={expense.id}
                  name={expense.name}
                  amount={expense.amount}
                  category={expense.category}
                  time={expense.time}
                  paidBy={expense.paidBy}
                  categories={DEFAULT_CATEGORIES}
                  onPress={() => console.log('Expense pressed:', expense)}
                  showBorder={true}
                  currency={t('common.currency')}
                />
              ))
            ) : (
              <View className="items-center justify-center py-8">
                <Feather name="receipt" size={48} color="#D1D5DB" />
                <Text className="mt-4 text-center text-base text-gray-500">
                  {t('groupDetails.noRecentExpenses')}
                </Text>
                <Text className="mt-2 text-center text-sm text-gray-400">
                  {t('groupDetails.addFirstExpense')}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

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

      <FloatingPlusButton
        navigateTo="NewExpense"
        size={48}
        bottom={10}
        right={10}
        groupId={groupId}
      />
    </SafeAreaView>
  );
};

export default GroupDetailsScreen;
