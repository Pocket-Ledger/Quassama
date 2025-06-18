import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationItem = ({ notification, onPress }) => {
  const { message, created_at, type, read } = notification;

  // Format timestamp to show relative time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return 'Last week';
  };

  // Get icon and color based on notification type
  const getNotificationIcon = (type) => {
    const iconProps = { size: 20, color: 'white' };

    switch (type) {
      case 'expense_created':
        return {
          icon: <Ionicons name="cash-outline" {...iconProps} />,
          bgColor: 'bg-blue-500',
          iconBg: 'bg-blue-100',
        };
      case 'payment_received':
        return {
          icon: <Ionicons name="checkmark-circle-outline" {...iconProps} />,
          bgColor: 'bg-green-500',
          iconBg: 'bg-green-100',
        };
      case 'group_joined':
      case 'member_added':
        return {
          icon: <Ionicons name="people-outline" {...iconProps} />,
          bgColor: 'bg-purple-500',
          iconBg: 'bg-purple-100',
        };
      case 'payment_reminder':
        return {
          icon: <Ionicons name="notifications-outline" {...iconProps} />,
          bgColor: 'bg-orange-500',
          iconBg: 'bg-orange-100',
        };
      case 'group_created':
        return {
          icon: <Ionicons name="people-outline" {...iconProps} />,
          bgColor: 'bg-purple-500',
          iconBg: 'bg-purple-100',
        };
      default:
        return {
          icon: <Ionicons name="notifications-outline" {...iconProps} />,
          bgColor: 'bg-gray-500',
          iconBg: 'bg-gray-100',
        };
    }
  };

  const { icon, bgColor } = getNotificationIcon(type);
  const timeText = formatTime(created_at);

  return (
    <TouchableOpacity
      className="px-4 py-2 mb-3 bg-white border border-gray-100 rounded"
      onPress={onPress}
      activeOpacity={0.7}>
      <View className="flex-row items-start py-3">
        {/* Icon */}
        <View className={`h-10 w-10 rounded-full ${bgColor} mr-3 mt-1 items-center justify-center`}>
          {icon}
        </View>

        {/* Content */}
        <View className="flex-1 pr-2">
          <Text className="mb-1 text-base font-medium leading-5 text-black">{message}</Text>

          <Text className="text-sm text-gray-500">{timeText}</Text>
        </View>

        {/* Unread indicator */}
        {!read && <View className="w-2 h-2 mt-2 bg-blue-500 rounded-full" />}
      </View>
    </TouchableOpacity>
  );
};

export default NotificationItem;
