import { ScrollView } from 'react-native';
import NotificationItem from './NotificationItem';

export const NotificationsList = ({ notifications, onNotificationPress }) => {
  console.log(notifications);

  return (
    <ScrollView
      className="pt-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}>
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
          onPress={() => onNotificationPress(notification.id)}
        />
      ))}
    </ScrollView>
  );
};
