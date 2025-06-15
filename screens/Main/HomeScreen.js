import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { CircularProgress } from 'components/CircularProgress';
import Expense from 'models/expense/Expense';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import User from 'models/auth/user';
import { DEFAULT_CATEGORIES } from 'constants/category';
import ExpenseListItem from 'components/ExpenseListItem';
import Avatar from 'components/Avatar';

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

  const transformExpenseData = (activity) => {
    return {
      id: activity.id,
      name: activity.title,
      amount: activity.amount,
      category: activity.category,
      time: activity.time,
      paidBy: activity.user_id,
    };
  };

  const handleExpensePress = (expenseData) => {
    console.log('Expense pressed:', expenseData);
    // Navigate to expense details or perform other actions
  };

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
    <ScrollView className="container flex flex-1 gap-6 pt-2 pb-6 bg-white ">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4">
        <View className="flex-row items-center">
          <View className="items-center justify-center w-12 h-12 mr-3 rounded-full bg-primary">
            <Text className="text-lg text-white font-dmsans-bold">M</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-500">Good morning 👋</Text>
            {/* <Text className="text-lg text-black font-dmsans-bold">{user.username}</Text> */}
            {isLoadingUser ? (
              <>
                <View className="w-48 h-6 mb-2 bg-gray-100 rounded" />
              </>
            ) : (
              <>
                <Text className="mb-2 text-xl text-black font-dmsans-bold">{user.username}</Text>
              </>
            )}
          </View>
        </View>
        <TouchableOpacity className="relative">
          <Feather name="bell" size={24} color="#666" />
          <View className="absolute w-3 h-3 bg-red-500 rounded-full -right-1 -top-1" />
        </TouchableOpacity>
      </View>

      {/* Balance Cards */}
      <View className="flex gap-8 pb-4">
        <View className="flex-row px-4 py-2 border border-gray-100 rounded-md">
          <View className="flex-1 mr-2">
            <Text className="mb-1 text-lg font-medium text-gray-500">Owe You</Text>
            <Text className="text-2xl font-dmsans-bold text-error">
              2500 <Text className="text-sm">MAD</Text>
            </Text>
          </View>
          <View className="flex-1 ml-2">
            <Text className="mb-1 text-lg font-medium text-gray-500">You owed</Text>
            <Text className="text-2xl text-green-500 font-dmsans-bold">
              2500 <Text className="text-sm">MAD</Text>
            </Text>
          </View>
        </View>

        {/* Overview Section */}
        <View className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
          <Text className="mb-4 text-lg font-medium text-black">April 2025 Overview</Text>

          <View className="flex-row items-center">
            <View className="relative mr-6">
              <CircularProgress percentage={50} color="#2979FF" />
            </View>

            <View className="flex-1">
              {expenseData.map((item, index) => (
                <View key={index} className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <View
                      className="w-3 h-3 mr-2 rounded-full"
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
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-medium text-black">Recently Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllExpenses')}>
              <Text className="font-medium text-primary">See All</Text>
            </TouchableOpacity>
          </View>

          <View>
            {recentActivity.map((item) => (
              <ExpenseListItem
                key={item.id}
                {...transformExpenseData(item)}
                //categories={DEFAULT_CATEGORIES}
                onPress={handleExpensePress}
                showBorder={false}
                currency="MAD"
              />
            ))}
          </View>
          {/* {RecentlyActivity.map((item) => (
            <View
              key={item.id}
              className="flex-row items-center justify-between py-2 border-gray-100">
              <View className="flex-row items-center flex-1">
                <View
                  className="mr-3 h-[55px] w-[55px] items-center justify-center rounded-full"
                  style={{ backgroundColor: '#E6F0FF' }}>
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
          ))} */}
        </View>

        {/* Faculty Friends */}
        <View className="mx-4 ">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-medium text-black">Faculty Friends</Text>
            <TouchableOpacity>
              <Text className="font-medium text-primary">Switch Group</Text>
            </TouchableOpacity>
          </View>

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
