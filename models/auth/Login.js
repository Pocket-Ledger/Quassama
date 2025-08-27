import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from "firebase/auth";

class Login {
    email;
    password;

    constructor(email, password){
        this.email = email;
        this.password = password;
    }

    async login(){
        try {
            const userCredentail = await signInWithEmailAndPassword(auth, this.email, this.password);
            console.log("Login successful", userCredentail);
            return userCredentail;
        } catch (error) {
            console.error("Login failed", error);
            throw error; // Re-throw the error for further handling if needed
        }
    }
}

export default Login;