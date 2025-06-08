import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { CircularProgress } from 'components/CircularProgress';
import Expense from 'models/expense/Expense';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import User from 'models/auth/user';

const HomeScreen = () => {
  const navigation = useNavigation();

  const [user, setUser] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDetails = await User.getUserDetails();
        setUser(userDetails);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    }
    fetchUser();
  }, []);

  const [RecentlyActivity, setRecentlyActivity] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchRecentlyActivity = async () => {
        try {
          const recentActivity = await Expense.RecentlyActivityByUser();
          setRecentlyActivity(recentActivity);
        } catch (error) {
          console.error('Error fetching recent activity:', error);
        }
      };

      fetchRecentlyActivity();
    }, [])
  );

  console.log('Recently Activity:', RecentlyActivity);

  const expenseData = [
    { category: 'Groceries', percentage: 50, color: '#2979FF' },
    { category: 'Rent', percentage: 30, color: '#2A67BF' },
    { category: 'Cleaning', percentage: 15, color: '#83B1FF' },
    { category: 'Others', percentage: 5, color: '#E6F0FF' },
  ];

  const recentActivity = [
    {
      id: 1,
      title: 'Groceries',
      time: '2h ago',
      amount: '180',
      paidBy: 'Sara',
      icon: 'shopping-basket',
      iconBg: '#E6F0FF',
      iconColor: '#2979FF',
    },
    {
      id: 2,
      title: 'Internet Bill',
      time: 'Yesterday',
      amount: '180',
      paidBy: 'Morad',
      icon: 'wifi',
      iconBg: '#E6F0FF',
      iconColor: '#2979FF',
    },
    {
      id: 3,
      title: 'Cleaning',
      time: '2d ago',
      amount: '60',
      paidBy: 'You',
      icon: 'check-circle',
      iconBg: '#E6F0FF',
      iconColor: '#2979FF',
    },
  ];

  const getIconByCategory = (category) => {
    switch (category.toLowerCase()) {
      case 'internet':
        return 'wifi';
      case 'shopping':
        return 'shopping-bag';
      case 'groceries':
        return 'shopping-cart';
      case 'rent':
        return 'home';
      case 'cleaning':
        return 'check-circle';
      default:
        return 'credit-card';
    }
  };

  const friends = [
    { name: 'Mehdi', initial: 'M', color: '#2979FF' },
    { name: 'Sara', initial: 'S', color: '#FF9800' },
    { name: 'Leila', initial: 'L', color: '#00BCD4' },
    { name: 'Morad', initial: 'M', color: '#673AB7' },
    { name: 'Salma', initial: 'S', color: '#E91E63' },
  ];

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
            <Text className="font-dmsans-bold text-lg text-black">{user.username}</Text>
          </View>
        </View>
        <TouchableOpacity className="relative">
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
              2500 <Text className="text-sm">MAD</Text>
            </Text>
          </View>
          <View className="ml-2 flex-1">
            <Text className="mb-1 text-lg font-medium text-gray-500">You owed</Text>
            <Text className="font-dmsans-bold text-2xl text-green-500">
              2500 <Text className="text-sm">MAD</Text>
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

          {RecentlyActivity.map((item) => (
            <View
              key={item.id}
              className="flex-row items-center justify-between border-gray-100 py-2">
              <View className="flex-1 flex-row items-center">
                <View
                  className="mr-3 h-[55px] w-[55px] items-center justify-center rounded-full"
                  style={{ backgroundColor: '#E6F0FF' }}>
                  {/* <Feather name={item.category} size={20} color="2979FF"/> */}
                  <Feather name={getIconByCategory(item.category)} size={20} color="#2979FF" />
                </View>
                <View>
                  <Text className="font-medium text-black">{item.title}</Text>
                  <Text className="text-sm text-gray-500">
                    {item.incurred_at?.toDate
                      ? new Date(item.incurred_at.toDate()).toLocaleDateString()
                      : 'Unknown'}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="font-medium text-black">{item.amount} MAD</Text>
                <Text className="text-sm text-gray-500">Paid by {item.user_id}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Faculty Friends */}
        <View className="mx-4 ">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-medium text-black">Faculty Friends</Text>
            <TouchableOpacity>
              <Text className="font-medium text-primary">Switch Group</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between">
            {friends.map((friend, index) => (
              <View key={index} className="items-center">
                <View
                  className="mb-2 h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: friend.color }}>
                  <Text className="font-dmsans-bold text-white">{friend.initial}</Text>
                </View>
                <Text className="text-sm font-medium text-gray-500">{friend.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
