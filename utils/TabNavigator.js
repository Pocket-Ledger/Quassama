import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import NewExpenseScreen from '../screens/Main/NewExpenseScreen';
import GroupsScreen from '../screens/Main/GroupsScreen';
import ProfileScreen from 'screens/Main/ProfileScreen';
import HomeScreen from 'screens/Main/HomeScreen';
import { CustomTabBar } from 'components/CostumTab';
import AddNewGroupScreen from 'screens/Main/AddNewGroupScreen';
import GroupDetailsScreen from 'screens/Main/GroupDetailsScreen';
import AllExpensesScreen from 'screens/Main/AllExpensesScreen';
import NotificationsScreen from 'screens/Main/NotificationsScreen';
import LanguagesScreen from 'screens/Main/LanguagesScreen';
import ProfileDetailsScreen from 'screens/Main/ProfileDetails';
import SettingsScreen from 'screens/Main/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Create stack navigators for each tab that needs nested screens
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="AllExpenses" component={AllExpensesScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

function GroupsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupsMain" component={GroupsScreen} />
      <Stack.Screen name="AddNewGroup" component={AddNewGroupScreen} />
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
    </Stack.Navigator>
  );
}

function NewExpenseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NewExpenseMain" component={NewExpenseScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Languages" component={LanguagesScreen} />
      <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen
        name="NewExpense"
        component={NewExpenseStack}
        options={{ tabBarLabel: 'New Expense' }}
      />
      <Tab.Screen name="Groups" component={GroupsStack} options={{ tabBarLabel: 'Groups' }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
