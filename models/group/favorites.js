import { app, db } from "../../firebase";
import { collection, addDoc, query, where, or, getDocs } from "firebase/firestore";

class Favorites {
    groupId;
    userId;
    createdAt;
    updatedAt;

    constructor(groupId, userId, createdAt = new Date(), updatedAt = new Date()) {
        this.groupId = groupId;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static fromData(data) {
        return new Favorites(
            data.groupId,
            data.userId,
            data.createdAt ? new Date(data.createdAt) : new Date(),
            data.updatedAt ? new Date(data.updatedAt) : new Date()
        );
    }

    toData() {
        return {
            groupId: this.groupId,
            userId: this.userId,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }

    /**
     * Function to add a favorite group for a user firebase
     * @param {string} groupId - The ID of the group to favorite
     * @param {string} userId - The ID of the user favoriting the group
     * @returns {Promise<Favorites>}
     */
    static async addFavorite(groupId, userId){
        if (!groupId || !userId) {
            throw new Error('Group ID and user ID are required');
        }

        try {
            const favoritesCollection = collection(db, "favorites");
            const newFavorite = new Favorites(groupId, userId);
            const docRef = await addDoc(favoritesCollection, newFavorite.toData());
            console.log(`Favorite added with ID: ${docRef.id}`);
            return new Favorites(groupId, userId, new Date(), new Date());
        } catch (error) {
            console.error("Error adding favorite:", error);
            throw error;
        }
    }

    /**
     *  Function to get all favorite groups for a user
     * @param {string} userId - The ID of the user whose favorites are being fetched
     * @returns {Promise<Favorites[]>}
     */
    static async getFavoritesByUser(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        try {
            const favoritesCollection = collection(db, "favorites");
            const q = query(favoritesCollection, where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            const favorites = [];
            querySnapshot.forEach((doc) => {
                favorites.push(Favorites.fromData(doc.data()));
            });
            return favorites;
        } catch (error) {
            console.error("Error fetching favorites:", error);
            throw error;
        }
    }

    /**
     * Function to remove a favorite group for a user
     * @param {string} groupId - The ID of the group to unfavorite
     * @param {string} userId - The ID of the user unfavoriting the group
     * @returns {Promise<void>}
     */
    static async removeFavorite(groupId, userId) {
        if (!groupId || !userId) {
            throw new Error('Group ID and user ID are required');
        }

        try {
            const favoritesCollection = collection(db, "favorites");
            const q = query(favoritesCollection, where("groupId", "==", groupId), where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                throw new Error('Favorite not found');
            }
            querySnapshot.forEach(async (doc) => {
                await doc.ref.delete();
                console.log(`Favorite for group ${groupId} by user ${userId} removed successfully`);
            });
        } catch (error) {
            console.error("Error removing favorite:", error);
            throw error;
        }
    }

}

export default Favorites;