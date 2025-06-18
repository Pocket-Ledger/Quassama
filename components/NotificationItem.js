import React from 'react';
import { View, Text } from 'react-native';

const NotificationItem = ({ notification }) => {
  const { message, created_at } = notification;
  const time = created_at?.toDate ? created_at.toDate().toLocaleString() : new Date(created_at).toLocaleString();

  return (
    <View className="mb-3 rounded-lg border border-gray-100 bg-white p-4">
      <Text className="text-base text-black" numberOfLines={2}>{message}</Text>
      <Text className="mt-1 text-xs text-gray-500">{time}</Text>
    </View>
  );
};

export default NotificationItem;
