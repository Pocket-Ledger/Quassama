import { auth } from "../../firebase";
import { signOut } from "firebase/auth";

class Logout {
    async logout(){
        try {
            await signOut(auth);
            console.log("Logout successful");
        } catch (error) {
            console.error("Logout failed", error);
            throw error;
        }
    }
}

export default Logout;