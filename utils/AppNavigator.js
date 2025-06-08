import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
/* import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen'; */
import OTPVerificationScreen from '../screens/Auth/OTPVerificationScreen';

import { TabNavigator } from './TabNavigator';
import { useAuth } from './AuthContext';
import AddNewGroupScreen from 'screens/Main/AddNewGroupScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user } = useAuth();
  //const user = true;
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      {user ? (
        // Authenticated user screens
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="AddNewGroup" component={AddNewGroupScreen} />
        </>
      ) : (
        // Authentication screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          {/* <Stack.Screen name="ForgotPassword" component={ForgetPasswordScreen} /> */}
          <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
          {/* <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} /> */}
        </>
      )}
    </Stack.Navigator>
  );
}

export default AppNavigator;
