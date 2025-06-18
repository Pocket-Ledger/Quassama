import Header from 'components/Header'
import React, { useEffect, useState } from 'react'
import { SafeAreaView, Text, View } from 'react-native'
import Notification from 'models/notifications/notifications'

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
        <View>
            <Header title="All Expenses" />
            <Text>Notifications Screen</Text>
        </View>
    </SafeAreaView>
  )
}

export default NotificationsScreen