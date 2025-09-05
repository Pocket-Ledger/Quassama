import { auth } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import User from './user';

class Register {
  email;
  password;
  confirmPassword;
  username;

  constructor(email, password, confirmPassword, username) {
    this.email = email;
    this.password = password;
    this.confirmPassword = confirmPassword;
    this.username = username;
  }

  async register() {
    if (this.password !== this.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Check if username is available
    if (this.username) {
      const isAvailable = await User.isUsernameAvailable(this.username);
      if (!isAvailable) {
        throw new Error('Username is already taken');
      }
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        this.email,
        this.password
      );
      console.log('Registration successful', userCredential);
      return userCredential;
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  }
}

export default Register;
