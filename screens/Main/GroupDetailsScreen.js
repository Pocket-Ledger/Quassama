import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Header from 'components/Header';
import { DEFAULT_CATEGORIES } from 'constants/category';
import ExpenseListItem from 'components/ExpenseListItem';
import Avatar from 'components/Avatar';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const GroupDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = route.params;

  const [groupData, setGroupData] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);

  useFocusEffect(
    useCallback(() => {
      console.log('Fetching group details for groupId:', groupId);
      let mounted = true;

      const fetchGroupAndExpenses = async () => {
        try {
          // 1) fetch basic group info
          const groupRef = doc(db, 'groups', groupId);
          const snap = await getDoc(groupRef);
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
        } catch (err) {
          console.error('Error fetching group details', err);
        }

        try {
          // 2) fetch the LIMIT most recent expenses for this group
          const raw = await Expense.getExpensesByGroupWithLimit(groupId, LIMIT);
          if (mounted) {
            const formatted = raw.map(exp => ({
              id: exp.id,
              name: exp.title,
              amount: exp.amount,
              category: exp.category,
              time: exp.incurred_at.toDate(),   // pass a JS Date
              paidBy: exp.user_id,
            }));
            setRecentExpenses(formatted);
          }
        } catch (err) {
          console.error(`Error fetching recent ${LIMIT} expenses`, err);
        }
      };

      fetchGroupAndExpenses();
      console.log('Group details fetched successfully', groupData);
      return () => { mounted = false; };
    }, [groupId])
  );

  if (!groupData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text>Loading…</Text>
      </SafeAreaView>
    );
  }

  // Destructure real data
const { name, totalExpenses, youPaid, youOwe, members } = groupData;

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
              $ {totalExpenses}
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
            {members.map((member) => (
              <View key={member.id} className="items-center">
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
           <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-medium text-black">Recently Expenses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllExpenses', { groupId })}>
              <Text className="text-base font-medium text-primary">See All</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Expenses List */}
          <View className="gap-4">
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
