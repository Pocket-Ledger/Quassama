import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTranslation } from 'react-i18next';

import NewExpenseScreen from '../screens/Main/NewExpenseScreen';
import GroupsScreen from '../screens/Main/GroupsScreen';
import ProfileScreen from 'screens/Main/ProfileScreen';
import HomeScreen from 'screens/Main/HomeScreen';
import { CustomTopTabBar } from 'components/CustomTopTabBar';
import { useNavigationType } from 'hooks/useNavigationType';
import { CustomTabBar } from 'components/CostumTab';
import { NewCustomTabBar } from 'components/NewCustomTabBar';
import AllExpensesScreen from 'screens/Main/AllExpensesScreen';

const BottomTab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

export function TabNavigator() {
  const { t } = useTranslation();
  const { isGestureNavigation } = useNavigationType();

  const screenOptions = {
    headerShown: false,
  };

  const screens = [
    {
      name: 'Home',
      component: HomeScreen,
      options: { tabBarLabel: t('navigation.home') },
    },
    {
      name: 'NewExpense',
      component: NewExpenseScreen,
      options: { tabBarLabel: t('navigation.newExpense') },
    },
    {
      name: 'Expenses',
      component: AllExpensesScreen,
      options: { tabBarLabel: t('navigation.expenses') },
    },
    {
      name: 'Groups',
      component: GroupsScreen,
      options: { tabBarLabel: t('navigation.groups') },
    },
    {
      name: 'Profile',
      component: ProfileScreen,
      options: { tabBarLabel: t('navigation.profile') },
    },
  ];

  // ✅ CORRECT LOGIC:
  // Gesture navigation (swipe) → BOTTOM tabs (comfortable, no button conflict)
  if (isGestureNavigation) {
    console.log('📱 Using BOTTOM tabs (gesture navigation)');
    return (
      <BottomTab.Navigator
        tabBar={(props) => <NewCustomTabBar {...props} />}
        screenOptions={screenOptions}>
        {screens.map((screen) => (
          <BottomTab.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
            options={screen.options}
          />
        ))}
      </BottomTab.Navigator>
    );
  }

  // Button navigation → TOP tabs (avoid conflict with buttons)
  console.log('🔝 Using TOP tabs (button navigation)');
  return (
    <TopTab.Navigator
      tabBar={(props) => <CustomTopTabBar {...props} />}
      screenOptions={{
        ...screenOptions,
        swipeEnabled: true,
        tabBarScrollEnabled: false,
      }}>
      {screens.map((screen) => (
        <TopTab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={screen.options}
        />
      ))}
    </TopTab.Navigator>
  );
}
