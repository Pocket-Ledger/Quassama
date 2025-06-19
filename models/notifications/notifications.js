import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, updateDoc, doc } from "firebase/firestore";
import { app, db } from '../../firebase';

class Notification{
    sender_id;
    receiver_id;
    type;
    message;
    created_at;
    read;

    constructor(sender_id, receiver_id, type, message) {
        this.sender_id = sender_id; // ID of the user who sent the notification
        this.receiver_id = receiver_id; // ID of the user who receives the notification
        this.type = type; // Type of notification (e.g., 'friend_request', 'message', etc.)
        this.message = message; // Content of the notification
        this.created_at = new Date(); // Timestamp when the notification was created
        this.read = false; // Status indicating whether the notification has been read
    }

    validate() {
        if (!this.sender_id || !this.receiver_id || !this.type || !this.message) {
            throw new Error('All fields (sender_id, receiver_id, type, message) are required');
        }
        return true;
    }

    // function to save the notification to the database
    async save(){
        this.validate();

        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('No authenticated user found');
        }
        this.sender_id = currentUser.uid;
        this.created_at = new Date();
        this.read = false;
        const notificationData = {
            sender_id: this.sender_id,
            receiver_id: this.receiver_id,
            type: this.type,
            message: this.message,
            created_at: this.created_at,
            read: this.read,
        };
        if (this.groupId) {
            notificationData.group_id = this.groupId;
        }
        if (this.expenseId) {
            notificationData.expense_id = this.expenseId;
        }
        try {
            // Assuming you have a Firestore instance initialized as `db`
            const docRef = await addDoc(collection(db, 'notifications'), notificationData);
            console.log('Notification saved with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error saving notification:', error);
            throw new Error('Failed to save notification');
        }
    }

    // function to get notifications for the current user
    static async getNotificationsForUser() {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('No authenticated user found');
        }
        const db = getFirestore();
        const notificationsRef = collection(db, 'notifications');
        const q = query(
            notificationsRef,
            where('receiver_id', '==', currentUser.uid),
            orderBy('created_at', 'desc')
        );
        try {
            const querySnapshot = await getDocs(q);
            const notifications = [];
            querySnapshot.forEach((doc) => {
                notifications.push({ id: doc.id, ...doc.data() });
            });
            return notifications;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw new Error('Failed to fetch notifications');
        }
    }

    // add notification for the giving group and expense
    static async addNotificationForGroupExpense(groupId, expenseId, senderId, receiverId, type, message) {
        const notification = new Notification(senderId, receiverId, type, message);
        notification.groupId = groupId;
        notification.expenseId = expenseId;
        return await notification.save();
    }

    //  function to mark a notification as read
    static async markAsRead(notificationId) {
        const notificationRef = doc(db, 'notifications', notificationId);
        try {
            await updateDoc(notificationRef, { read: true });
            console.log('Notification marked as read:', notificationId);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw new Error('Failed to mark notification as read');
        }
    }
}

export default Notification;