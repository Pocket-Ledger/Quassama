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

const LIMIT = 5; // Limit for recent expenses

const GroupDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = route.params;

  const [groupData, setGroupData] = useState(null);
  const [TotalExpenses, setTotalExpenses] = useState(0);
  const [youPaid, setYouPaid] = useState(0);
  const [youOwe, setYouOwe] = useState(0);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <SafeAreaView className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color="#2979FF" />
        <Text className="mt-4">Loading…</Text>
      </SafeAreaView>
    );
  }

  // Destructure real data
  const { name, members } = groupData;

  const handleSettleUp = () => {
    console.log('Settle up pressed');
  };

  const handleSeeAllExpenses = () => {
    navigation.navigate('AllExpenses', { groupId });
  };

  const handleExpensePress = (expense) => {
    console.log('Expense pressed:', expense);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="container">
        <Header title={name} />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Group Summary Card */}
          <View className="p-6 mb-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <Text className="text-base text-center text-black/75">Total Group Expenses</Text>
            <Text className="text-2xl font-medium text-center text-black">$ {TotalExpenses}</Text>

            <View className="flex-row justify-between mt-6">
              <View className="flex-1">
                <Text className="text-sm text-black/75">You Paid</Text>
                <Text className="text-xl text-black">$ {youPaid}</Text>
              </View>
              <View className="items-end flex-1">
                <Text className="text-sm text-black/75">You Owe</Text>
                <Text className="text-xl text-red-500">-${youOwe}</Text>
              </View>
            </View>
          </View>

          {/* Settle Up Button */}
          <TouchableOpacity className="py-4 mb-6 rounded-lg bg-primary" onPress={handleSettleUp}>
            <Text className="text-base font-semibold text-center text-white">Settle Up</Text>
          </TouchableOpacity>

          {/* Members List */}
          <View className="flex-row mb-6">
            {members.map((member, idx) => (
              <View key={member.id ?? `member-${idx}`} className="items-center mr-4">
                <Avatar
                  initial={member.initial}
                  name={member.name}
                  color={member.color}
                  size="medium"
                  showName={true}
                />
                <Text
                  className={`text-sm ${
                    typeof member.amount === 'string' && member.amount.startsWith('+')
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}>
                  {member.amount ?? '—'}
                </Text>
              </View>
            ))}
          </View>



          {/* Recently Expenses Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-medium text-black">Recently Expenses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllExpenses', { groupId })}>
              <Text className="text-base font-medium text-primary">See All</Text>
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
                currency="MAD"
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default GroupDetailsScreen;
