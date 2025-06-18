import Header from 'components/Header';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Notification from 'models/notifications/notifications';
import NotificationItem from 'components/NotificationItem';
import { NotificationsList } from 'components/NotificationsList';

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

  const EmptyNotificationsState = () => (
    <View className="flex-1 px-6 mt-20 ">
      <View className="items-center mb-8 ">
        <View className="items-center justify-center w-24 h-24 mb-6 rounded-full">
          <Ionicons name="notifications-off-outline" size={70} color="#3B82F6" />
        </View>

        <Text className="mb-3 text-xl font-semibold text-center text-black">
          No Notifications Yet
        </Text>

        <Text className="text-base leading-6 text-center text-gray-600">
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

        {loading ? (
          <View className="items-center justify-center flex-1 ">
            <Text className="text-gray-500">Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <EmptyNotificationsState />
        ) : (
          <NotificationsList notifications={notifications} />
        )}
      </View>
    </SafeAreaView>
  );
};

export default NotificationsScreen;
