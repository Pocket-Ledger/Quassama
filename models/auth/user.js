import { addDoc, collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { app, db } from "../../firebase"; 
import { getAuth } from "firebase/auth";

// Import Group class for updating member usernames
// Using dynamic import to avoid circular dependency
const getGroupClass = async () => {
    const { default: Group } = await import('../group/group');
    return Group;
};
class User{
    username;
    email;

    constructor(username, email){
        this.username = username;
        this.email = email;
    }


    async save(){
        if(!this.username || !this.email){
            throw new Error("Username and email are required");
        }
        const auth = getAuth(app);
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("No authenticated user found");
        }
        this.user_id = currentUser.uid;
        const userData = {
            username: this.username,
            email: this.email,
            user_id: this.user_id,
            created_at: new Date().toISOString(),
        };
        const usersCollection = collection(db, "users"); // Reference to the "users" collection
        const docRef = await addDoc(usersCollection, userData); // Add document to the collection
        console.log("User saved with ID: ", docRef.id);
        return docRef.id;
    }

    static async getUserDetails(){
        const auth = getAuth(app);
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error("No authenticated user found");
        }
        const userId = currentUser.uid;
        
        // Fetch user details from the "users" collection
        const usersCollection = collection(db, "users");
        const userQuery = query(usersCollection, where("user_id", "==", userId));
        const querySnapshot = await getDocs(userQuery);
        
        if (querySnapshot.empty) {
            throw new Error("No user found with the given ID");
        }
        
        let userDetails = {};
        querySnapshot.forEach((doc) => {
            userDetails = doc.data();
        });
        
        return userDetails;
    }

    // search for users by username
    static async searchUsersByUsername(username) {
        if (!username || username.trim() === "") {
            throw new Error("Username is required for search");
        }
        
        const usersCollection = collection(db, "users");
        const userQuery = query(usersCollection, where("username", "==", username));
        const querySnapshot = await getDocs(userQuery);
        
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        
        return users;
    }

    // Check if username is already taken
    static async isUsernameAvailable(username) {
        if (!username || username.trim() === "") {
            throw new Error("Username is required for availability check");
        }
        
        const usersCollection = collection(db, "users");
        const userQuery = query(usersCollection, where("username", "==", username.trim()));
        const querySnapshot = await getDocs(userQuery);
        
        return querySnapshot.empty; // Returns true if username is available (no documents found)
    }

    static async getUsernameById(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("user_id", "==", userId));
    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error(`No user found with ID ${userId}`);
    }

    // assume there's only one matching doc
    const doc = snap.docs[0];
    const data = doc.data();
    return data.username;
  }

  // Update user's username
  static async updateUsername(newUsername) {
    if (!newUsername || newUsername.trim() === "") {
      throw new Error("Username is required");
    }

    const auth = getAuth(app);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }

    const userId = currentUser.uid;
    
    // Find the user document
    const usersCollection = collection(db, "users");
    const userQuery = query(usersCollection, where("user_id", "==", userId));
    const querySnapshot = await getDocs(userQuery);
    
    if (querySnapshot.empty) {
      throw new Error("No user found with the given ID");
    }

    // Update the username in users collection
    const userDoc = querySnapshot.docs[0];
    const userDocRef = doc(db, "users", userDoc.id);
    
    await updateDoc(userDocRef, {
      username: newUsername.trim()
    });

    console.log("Username updated successfully in users collection");

    // Update the username in all groups where this user is a member
    try {
      const Group = await getGroupClass();
      const updatedGroupsCount = await Group.updateMemberUsernameInGroups(userId, newUsername.trim());
      console.log(`Username updated in ${updatedGroupsCount} groups`);
    } catch (error) {
      console.error("Error updating username in groups:", error);
      // Don't throw error here, as the main username update was successful
      // We just log the error for group updates
    }

    return true;
  }



}

export default User;