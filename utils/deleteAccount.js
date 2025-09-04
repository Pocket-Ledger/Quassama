import { auth, db } from "../firebase";
import { deleteUser } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

/**
 * Delete all user-related data from Firestore
 * @param {string} userId - The user ID to delete data for
 */
async function deleteUserData(userId) {
    try {
        console.log('Starting user data cleanup for:', userId);
        
        // 1. Delete user document from users collection
        const usersCollection = collection(db, "users");
        const userQuery = query(usersCollection, where("user_id", "==", userId));
        const userSnapshot = await getDocs(userQuery);
        
        for (const userDoc of userSnapshot.docs) {
            await deleteDoc(userDoc.ref);
            console.log('Deleted user document:', userDoc.id);
        }

        // 2. Delete user's notifications
        const notificationsCollection = collection(db, "notifications");
        const notificationsQuery = query(notificationsCollection, where("receiver_id", "==", userId));
        const notificationsSnapshot = await getDocs(notificationsQuery);
        
        for (const notificationDoc of notificationsSnapshot.docs) {
            await deleteDoc(notificationDoc.ref);
        }
        console.log(`Deleted ${notificationsSnapshot.docs.length} notifications`);

        // 3. Delete user's favorites
        const favoritesCollection = collection(db, "favorites");
        const favoritesQuery = query(favoritesCollection, where("userId", "==", userId));
        const favoritesSnapshot = await getDocs(favoritesQuery);
        
        for (const favoriteDoc of favoritesSnapshot.docs) {
            await deleteDoc(favoriteDoc.ref);
        }
        console.log(`Deleted ${favoritesSnapshot.docs.length} favorites`);

        // 4. Delete user's invitations
        const invitationsCollection = collection(db, "invitations");
        const invitationsQuery = query(invitationsCollection, where("member_id", "==", userId));
        const invitationsSnapshot = await getDocs(invitationsQuery);
        
        for (const invitationDoc of invitationsSnapshot.docs) {
            await deleteDoc(invitationDoc.ref);
        }
        console.log(`Deleted ${invitationsSnapshot.docs.length} invitations`);

        // Note: Groups and expenses are not deleted here because they might involve other users
        // The user will be removed from groups, but groups and shared expenses remain
        
        console.log('User data cleanup completed successfully');
    } catch (error) {
        console.error('Error during user data cleanup:', error);
        throw new Error(`Failed to cleanup user data: ${error.message}`);
    }
}

export default async function deleteAccount() {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('No user is currently signed in');
        }
        
        const userId = user.uid;
        
        // First cleanup user data from Firestore
        await deleteUserData(userId);
        
        // Then delete the Firebase Auth user
        await deleteUser(user);
        
        console.log('Account deleted successfully');
        return { success: true };
    } catch (error) {
        console.error('Error deleting account:', error);
        throw error;
    }
}