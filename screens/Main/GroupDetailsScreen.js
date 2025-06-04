import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BackButton } from 'components/BackButton';
import { useNavigation } from '@react-navigation/native';

const GroupDetailsScreen = () => {
  const navigation = useNavigation();

  const groupData = {
    name: 'Vacation Agadir',
    totalExpenses: '1,2810.50',
    youPaid: '112.99',
    youOwe: '112.99',
    members: [
      { id: 1, initial: 'M', name: 'You', color: '#2979FF', amount: '+$85.50' },
      { id: 2, initial: 'S', name: 'Sara', color: '#4CAF50', amount: '-$20.40' },
      { id: 3, initial: 'A', name: 'Ahmad', color: '#FF9800', amount: '+$30.16' },
      { id: 4, initial: 'L', name: 'Lina', color: '#E91E63', amount: '-$18.40' },
      { id: 5, initial: 'F', name: 'Fady', color: '#8D6E63', amount: '-$18.40' },
    ],
    recentExpenses: [
      {
        id: 1,
        name: 'Groceries',
        amount: '180 MAD',
        time: '2h ago',
        paidBy: 'Sara',
        icon: 'shopping-cart',
        iconColor: '#2979FF',
        iconBg: '#E3F2FD',
      },
      {
        id: 2,
        name: 'Internet Bill',
        amount: '180 MAD',
        time: 'Yesterday',
        paidBy: 'Morad',
        icon: 'wifi',
        iconColor: '#2979FF',
        iconBg: '#E3F2FD',
      },
      {
        id: 3,
        name: 'Cleaning',
        amount: '60 MAD',
        time: '2d ago',
        paidBy: 'Ahmad',
        icon: 'check-circle',
        iconColor: '#2979FF',
        iconBg: '#E3F2FD',
      },
    ],
  };

  const handleSettleUp = () => {
    console.log('Settle up pressed');
  };

  const handleSeeAllExpenses = () => {
    console.log('See all expenses pressed');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="container">
        {/* Header */}
        <View className="mb-6 flex flex-row items-center justify-start pb-4">
          <BackButton />
          <Text className="ml-12 mt-2 font-dmsans-bold text-xl text-black">{groupData.name}</Text>
        </View>

        <ScrollView
          className="flex-1 "
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Group Summary Card */}
          <View className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <Text className="text-center text-base text-black/75 ">Total Group Expenses</Text>
            <Text className="text-center text-2xl font-medium text-black">
              $ {groupData.totalExpenses}
            </Text>

            <View className="mt-6 flex-row justify-between">
              <View className="flex-1">
                <Text className="text-sm text-black/75">You Paid</Text>
                <Text className="text-xl text-black">$ {groupData.youPaid}</Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="text-sm text-black/75">You Owe</Text>
                <Text className="text-xl text-red-500">-${groupData.youOwe}</Text>
              </View>
            </View>
          </View>

          {/* Settle Up Button */}
          <TouchableOpacity className="mb-6 rounded-lg bg-primary py-4" onPress={handleSettleUp}>
            <Text className="text-center text-base font-semibold text-white">Settle Up</Text>
          </TouchableOpacity>

          {/* Members List */}
          <View className="mb-6 flex-row justify-between">
            {groupData.members.map((member) => (
              <View key={member.id} className="items-center">
                <View
                  className="mb-2 h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: member.color }}>
                  <Text className="font-dmsans-bold text-base text-white">{member.initial}</Text>
                </View>
                <Text className="mb-1 text-sm text-black/50">{member.name}</Text>
                <Text
                  className={`text-sm  ${
                    member.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  }`}>
                  {member.amount}
                </Text>
              </View>
            ))}
          </View>

          {/* Recently Expenses Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-medium text-black">Recently Expenses</Text>
            <TouchableOpacity onPress={handleSeeAllExpenses}>
              <Text className="text-base font-medium text-primary">See All</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Expenses List */}
          <View className="gap-4">
            {groupData.recentExpenses.map((expense) => (
              <View key={expense.id} className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View
                    className="mr-4 h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: expense.iconBg }}>
                    <Feather name={expense.icon} size={20} color={expense.iconColor} />
                  </View>
                  <View>
                    <Text className="text-base font-medium text-black">{expense.name}</Text>
                    <Text className="text-sm text-gray-500">{expense.time}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-base font-semibold text-black">{expense.amount}</Text>
                  <Text className="text-sm text-gray-500">Paid by {expense.paidBy}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default GroupDetailsScreen;
