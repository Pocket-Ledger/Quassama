import Header from 'components/Header'
import React, { useEffect, useState } from 'react'
import { SafeAreaView, View, ScrollView } from 'react-native'
import Notification from 'models/notifications/notifications'
import NotificationItem from 'components/NotificationItem'

const NotificationsScreen = () => {
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const userNotifications = await Notification.getNotificationsForUser();
                setNotifications(userNotifications);
            }  catch (error) {
                console.error('Error fetching notifications:', error);
            }

            console.log('Fetched notifications:', notifications);

        };

        fetchNotifications();
    }, []);
  return (
    <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1">
            <Header title="Notifications" />
            <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
                {notifications.map((n) => (
                    <NotificationItem key={n.id} notification={n} />
                ))}
            </ScrollView>
        </View>
    </SafeAreaView>
  )
}

export default NotificationsScreen