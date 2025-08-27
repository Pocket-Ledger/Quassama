import Header from 'components/Header';
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Notification from 'models/notifications/notifications';
import NotificationItem from 'components/NotificationItem';
import { NotificationsList } from 'components/NotificationsList';
import { SafeAreaView } from 'react-native-safe-area-context';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const userNotifications = await Notification.getNotificationsForUser();
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleStartNow = () => {
    // Handle start now action - could navigate to expense creation or dashboard
    console.log('Start Now pressed');
  };

  // function to update the read status of a notification
  const handleNotificationPress = async (notificationId) => {
    try {
      await Notification.markAsRead(notificationId);
      // Update local state to reflect the change
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // function to mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      // First update the local state immediately to hide the button
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      
      // Then update the database
      await Notification.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // If there's an error, revert the local state changes
      const userNotifications = await Notification.getNotificationsForUser();
      setNotifications(userNotifications);
    }
  };

  const EmptyNotificationsState = () => (
    <View className="mt-20 flex-1 px-6 ">
      <View className="mb-8 items-center ">
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-full">
          <Ionicons name="notifications-off-outline" size={70} color="#3B82F6" />
        </View>

        <Text className="mb-3 text-center text-xl font-semibold text-black">
          No Notifications Yet
        </Text>

        <Text className="text-center text-base leading-6 text-gray-600">
          Stay tuned! When someone adds an expense, settles up, or invites you, it'll show up here.
        </Text>
      </View>

      {/* <TouchableOpacity
        className="w-full max-w-sm px-8 py-4 bg-blue-500 rounded-xl"
        onPress={handleStartNow}
        activeOpacity={0.8}>
        <Text className="text-base font-medium text-center text-white">Start Now</Text>
      </TouchableOpacity> */}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="container">
        <Header title="Notifications" />

        {/* Mark All as Read Button */}
        {!loading && notifications.length > 0 && notifications.some(n => !n.read) && (
          <View className="px-4 pb-3 pt-2">
            <TouchableOpacity
              className="bg-blue-500 rounded-lg py-3 px-4 flex-row items-center justify-center"
              onPress={handleMarkAllAsRead}
              activeOpacity={0.8}>
              <Ionicons name="checkmark-done-outline" size={20} color="white" className="mr-2" />
              <Text className="text-white font-medium text-base ml-2">Mark All as Read</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <View className="flex-1 items-center justify-center ">
            <Text className="text-gray-500">Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <EmptyNotificationsState />
        ) : (
          <NotificationsList
            notifications={notifications}
            onNotificationPress={handleNotificationPress}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default NotificationsScreen;
