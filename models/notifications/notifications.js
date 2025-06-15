import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
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
            read: this.read
        };
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
}

export default Notification;