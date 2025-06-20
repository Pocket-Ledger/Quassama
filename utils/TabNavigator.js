import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import NewExpenseScreen from '../screens/Main/NewExpenseScreen';
import GroupsScreen from '../screens/Main/GroupsScreen';
import ProfileScreen from 'screens/Main/ProfileScreen';
import HomeScreen from 'screens/Main/HomeScreen';
import { CustomTabBar } from 'components/CostumTab';
import AddNewGroupScreen from 'screens/Main/AddNewGroupScreen';
import GroupDetailsScreen from 'screens/Main/GroupDetailsScreen';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: t('navigation.home') }}
      />
      <Tab.Screen
        name="NewExpense"
        component={NewExpenseScreen}
        options={{ tabBarLabel: t('navigation.newExpense') }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
        options={{ tabBarLabel: t('navigation.groups') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: t('navigation.profile') }}
      />
    </Tab.Navigator>
  );
}
