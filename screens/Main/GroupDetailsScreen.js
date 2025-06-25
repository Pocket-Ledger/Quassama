import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Header from 'components/Header';
import { DEFAULT_CATEGORIES } from 'constants/category';
import ExpenseListItem from 'components/ExpenseListItem';
import Avatar from 'components/Avatar';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Expense from 'models/expense/Expense';
import User from 'models/auth/user';
import { extractHourAndMinute, extractHourMinutePeriod } from 'utils/time';
import FloatingPlusButton from 'components/FloatingPlusButton';
import { useTranslation } from 'react-i18next';

const LIMIT = 5; // Limit for recent expenses

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
  console.log('groupData', groupData);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      setLoading(true);

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

          // 6) Update state in one go
          if (mounted) {
            setTotalExpenses(totalAmount);
            setYouPaid(userPaidAmount);
            setYouOwe(totalAmount - userPaidAmount);
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

  const handleSettleUp = () => {
    console.log('Settle up pressed');
  };

  const handleSeeAllExpenses = () => {
    navigation.navigate('AllExpenses', { groupId });
  };

  const handleExpensePress = (expense) => {
    console.log('Expense pressed:', expense);
  };

  const handleEditGroup = () => {
    navigation.navigate('EditGroup', { groupId });
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="container">
        <Header
          title={name}
          rightIcon={
            <TouchableOpacity
              onPress={handleEditGroup}
              className="h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Feather name="settings" size={20} color="#ffff" />
            </TouchableOpacity>
          }
        />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Group Summary Card */}
          <View className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <Text className="text-center text-base text-black/75">
              {t('groupDetails.totalGroupExpenses')}
            </Text>
            <Text className="text-center text-2xl font-medium text-black">
              {t('common.currency')} {TotalExpenses}
            </Text>

            <View className="mt-6 flex-row justify-between">
              <View className="flex-1">
                <Text className="text-sm text-black/75">{t('groupDetails.youPaid')}</Text>
                <Text className="text-xl text-black">
                  {t('common.currency')} {youPaid}
                </Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="text-sm text-black/75">{t('groupDetails.youOwe')}</Text>
                <Text className="text-xl text-red-500">
                  -{t('common.currency')} {youOwe}
                </Text>
              </View>
            </View>
          </View>

          {/* Settle Up Button */}
          <TouchableOpacity className="mb-6 rounded-lg bg-primary py-4" onPress={handleSettleUp}>
            <Text className="text-center text-base font-semibold text-white">
              {t('groupDetails.settleUp')}
            </Text>
          </TouchableOpacity>

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
                    <View key={member.id || `member-${idx}-${member.name || 'unknown'}`} className="mr-4 items-center">
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
          <View className="gap-4 ">
            {recentExpenses.map((expense) => (
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
            ))}
          </View>
        </ScrollView>
      </View>
      <FloatingPlusButton navigateTo="NewExpense" size={48} bottom={10} right={10} />
    </SafeAreaView>
  );
};

export default GroupDetailsScreen;
