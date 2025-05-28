import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Logout from 'models/auth/Logout';

export default function ProfileScreen() {
  const handleLogout = async () => {
    const logoutInstance = new Logout();
    try {
      await logoutInstance.logout();
      Alert.alert("Success", "You have been logged out.");
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold">Profile Screen</Text>
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          marginTop: 20,
          padding: 10,
          backgroundColor: '#FF6347',
          borderRadius: 5,
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}