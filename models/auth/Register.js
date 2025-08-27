import { auth } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

class Register {
  email;
  password;
  confirmPassword;

  constructor(email, password, confirmPassword) {
    this.email = email;
    this.password = password;
    this.confirmPassword = confirmPassword;
  }

  async register() {
    if (this.password !== this.confirmPassword) {
      throw new Error('Passwords do not match');
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
