import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
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

const LIMIT = 3; // Limit for recent expenses

const GroupDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = route.params;

  const [groupData, setGroupData] = useState(null);
  const [TotalExpenses, setTotalExpenses] = useState(0);
  const [youPaid, setYouPaid] = useState(0);
  const [youOwe, setYouOwe] = useState(0);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true); // <-- loading state

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      setLoading(true);

      const fetchGroupAndExpenses = async () => {
        try {
          // 1) fetch basic group info
          const groupRef = doc(db, 'groups', groupId);
          const snap = await getDoc(groupRef);
          if (snap.exists() && mounted) {
            const data = snap.data();
            const gd = {
              id: snap.id,
              name: data.name,
              totalExpenses: data.totalExpenses,
              youPaid: data.youPaid,
              youOwe: data.youOwe,
              members: data.members || [],
            };
            setGroupData(gd);
          }

          // 2) fetch the LIMIT most recent expenses for this group
          const raw = await Expense.getExpensesByGroupWithLimit(groupId, LIMIT);

          // 3) fetch usernames for each paidBy
          const expensesWithUsernames = await Promise.all(
            raw.map(async exp => {
              let paidByName = exp.user_id;
              try {
                paidByName = await User.getUsernameById(exp.user_id);
              } catch (e) {
                // fallback to user_id if username not found
              }
              return {
                id: exp.id,
                name: exp.title,
                amount: exp.amount,
                category: exp.category,
                time: exp.incurred_at.toDate().toLocaleString(),
                paidBy: paidByName,
              };
            })
          );

          const totalEpense = await Expense.getExpensesByGroup(groupId);
          const totalAmount = totalEpense.reduce((acc, expense) => acc + expense.amount, 0);
          setTotalExpenses(totalAmount);
          console.log('Total Expenses:', totalAmount);

          if (mounted) {
            setRecentExpenses(expensesWithUsernames);
          }
        } catch (err) {
          console.error('Error fetching group details or expenses', err);
        } finally {
          if (mounted) setLoading(false);
        }
      };

      fetchGroupAndExpenses();
      return () => { mounted = false; };
    }, [groupId])
  );

  if (loading || !groupData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
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
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Group Summary Card */}
          <View className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <Text className="text-center text-base text-black/75">Total Group Expenses</Text>
            <Text className="text-center text-2xl font-medium text-black">
              $ {TotalExpenses}
            </Text>

            <View className="mt-6 flex-row justify-between">
              <View className="flex-1">
                <Text className="text-sm text-black/75">You Paid</Text>
                <Text className="text-xl text-black">$ {youPaid}</Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="text-sm text-black/75">You Owe</Text>
                <Text className="text-xl text-red-500">-${youOwe}</Text>
              </View>
            </View>
          </View>

          {/* Settle Up Button */}
          <TouchableOpacity className="mb-6 rounded-lg bg-primary py-4" onPress={handleSettleUp}>
            <Text className="text-center text-base font-semibold text-white">Settle Up</Text>
          </TouchableOpacity>

          {/* Members List */}
          <View className="mb-6 flex-row justify-between">
            {members.map((member, idx) => (
              <View key={member.id ?? `member-${idx}`} className="items-center">
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
                  }`}
                >
                  {member.amount ?? '—'}
                </Text>
              </View>
            ))}
          </View>

          {/* Recently Expenses Header */}
           <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-medium text-black">Recently Expenses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllExpenses', { groupId })}>
              <Text className="text-base font-medium text-primary">See All</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Expenses List */}
          <View className="gap-4 px-4">
            {recentExpenses.map(expense => (
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
