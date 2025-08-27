import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
/* import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen'; */
import OTPVerificationScreen from '../screens/Auth/OTPVerificationScreen';

import { TabNavigator } from './TabNavigator';
import { useAuth } from './AuthContext';
import AddNewGroupScreen from 'screens/Main/AddNewGroupScreen';
import AllExpensesScreen from 'screens/Main/AllExpensesScreen';
import GroupDetailsScreen from 'screens/Main/GroupDetailsScreen';
import NotificationsScreen from 'screens/Main/NotificationsScreen';
import LanguagesScreen from 'screens/Main/LanguagesScreen';
import ProfileDetailsScreen from 'screens/Main/ProfileDetails';
import SettingsScreen from 'screens/Main/SettingsScreen';
import ForgetPasswordScreen from 'screens/Auth/ForgetPasswordScreen ';
import ResetPasswordScreen from 'screens/Auth/ResetPasswordScreen';
import EditGroupScreen from 'screens/Main/EditGroupScreen';
import ExpenseDetailsScreen from 'screens/Main/ExpenseDetailsScreen';
import EditExpenseScreen from 'screens/Main/EditExpenseScreen';
import Onboarding from 'screens/Onboarding/Onboarding';
import OnboardingPager from 'screens/Onboarding/OnboardingPager';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user } = useAuth();
  //const user = true;
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={user ? "MainTabs" : "OnboardingPager"}>
      {user ? (
        // Authenticated user screens
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="ExpenseDetails" component={ExpenseDetailsScreen} />
          <Stack.Screen name="EditGroup" component={EditGroupScreen} />
          <Stack.Screen name="EditExpense" component={EditExpenseScreen} />
          <Stack.Screen name="AddNewGroup" component={AddNewGroupScreen} />
          <Stack.Screen name="AllExpenses" component={AllExpensesScreen} />
          <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
          <Stack.Screen name="Languages" component={LanguagesScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          {/* Add other authenticated screens here */}
        </>
      ) : (
        // Authentication screens
        <>
          <Stack.Screen name="OnboardingPager" component={OnboardingPager} />
          <Stack.Screen name="Onboarding" component={Onboarding} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgetPasswordScreen} />
          <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default AppNavigator;
