import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import NewExpenseScreen from '../screens/Main/NewExpenseScreen';
import GroupsScreen from '../screens/Main/GroupsScreen';
import ProfileScreen from 'screens/Main/ProfileScreen';
import HomeScreen from 'screens/Main/HomeScreen';
import { CustomTabBar } from 'components/CostumTab';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen
        name="NewExpense"
        component={NewExpenseScreen}
        options={{ tabBarLabel: 'New Expense' }}
      />
      <Tab.Screen name="Groups" component={GroupsScreen} options={{ tabBarLabel: 'Groups' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
