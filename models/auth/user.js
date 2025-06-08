import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { app, db } from "../../firebase"; 
import { getAuth } from "firebase/auth";
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
            user_id: this.user_id
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

}

export default User;