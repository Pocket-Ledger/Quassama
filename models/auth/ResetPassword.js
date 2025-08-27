import { 
  sendPasswordResetEmail, 
  confirmPasswordReset, 
  verifyPasswordResetCode,
  checkActionCode,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { auth } from '../../firebase';

class ResetPassword {

  /**
   * Function to check if the email exists in Firebase Auth.
   * @param {string} email - The email address to check.
   * @returns {Promise<boolean>} - Resolves with true if the email exists, false otherwise.
   */
  static async checkEmailExists(email) {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      console.log('Sign-in methods for', email, ':', signInMethods);
      // Only allow password reset for email/password accounts
      if (signInMethods.includes('password')) {
        return true;
      } else if (signInMethods.length > 0) {
        throw new Error('This account was registered with a different sign-in method (e.g., Google, Facebook). Please use that method to sign in.');
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw new Error('Failed to check email existence');
    }
  }

  /**
   * Function to send a verification code to the email address using firebase auth.
   * @param {string} email - The email address to send the verification code to.
   * @returns {Promise<void>} - Resolves if the email is sent successfully, rejects otherwise.
   */
  static async sendVerificationCode(email) {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: 'https://quassama-a1a15.firebaseapp.com', // <-- Replace with your actual domain if needed
        handleCodeInApp: false
      });
      console.log("Password reset email sent successfully");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      // Handle specific error codes for better UX
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error("No user found with this email address");
        case 'auth/invalid-email':
          throw new Error("Invalid email address");
        case 'auth/invalid-continue-uri':
          throw new Error("Invalid or missing continue URL. Please contact support.");
        default:
          throw new Error("Failed to send password reset email");
      }
    }
  }

  /**
   * Function to verify the code sent to the email address.
   * @param {string} code - The verification code sent to the email address.
   * @returns {Promise<string>} - Resolves with the email if the code is valid, rejects otherwise
   */
  static async verifyCode(code) {
    try {
      // Verify the password reset code and get the email
      const email = await verifyPasswordResetCode(auth, code);
      return email;
    } catch (error) {
      console.error("Error verifying reset code:", error);
      
      // Handle specific error codes
      switch (error.code) {
        case 'auth/expired-action-code':
          throw new Error("Reset code has expired. Please request a new one.");
        case 'auth/invalid-action-code':
          throw new Error("Invalid reset code. Please check and try again.");
        case 'auth/user-disabled':
          throw new Error("User account has been disabled.");
        case 'auth/user-not-found':
          throw new Error("No user found with this email address.");
        default:
          throw new Error("Failed to verify reset code");
      }
    }
  }

  /**
   * Function to reset the password with the verification code and new password
   * @param {string} code - The verification code sent to the email address.
   * @param {string} newPassword - The new password to set.
   * @returns {Promise<void>} - Resolves if password is reset successfully, rejects otherwise.
   */
  static async resetPassword(code, newPassword) {
    try {
      // Validate password strength (optional - add your own validation)
      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      await confirmPasswordReset(auth, code, newPassword);
      console.log("Password reset successfully");
    } catch (error) {
      console.error("Error resetting password:", error);
      
      // Handle specific error codes
      switch (error.code) {
        case 'auth/expired-action-code':
          throw new Error("Reset code has expired. Please request a new one.");
        case 'auth/invalid-action-code':
          throw new Error("Invalid reset code. Please check and try again.");
        case 'auth/weak-password':
          throw new Error("Password is too weak. Please choose a stronger password.");
        case 'auth/user-disabled':
          throw new Error("User account has been disabled.");
        case 'auth/user-not-found':
          throw new Error("No user found with this email address.");
        default:
          throw new Error("Failed to reset password");
      }
    }
  }

  /**
   * Function to check action code info (optional utility method)
   * @param {string} code - The action code to check.
   * @returns {Promise<object>} - Resolves with action code info.
   */
  static async checkActionCodeInfo(code) {
    try {
      const info = await checkActionCode(auth, code);
      return {
        operation: info.operation,
        email: info.data.email,
        previousEmail: info.data.previousEmail
      };
    } catch (error) {
      console.error("Error checking action code:", error);
      throw new Error("Invalid or expired action code");
    }
  }

  /**
   * Complete password reset flow - combines verification and reset
   * @param {string} email - The email address to send reset email to.
   * @returns {Promise<void>} - Resolves when reset email is sent.
   */
  static async initiatePasswordReset(email) {
    try {
      await this.sendVerificationCode(email);
      return "Password reset email sent. Please check your inbox.";
    } catch (error) {
      throw error;
    }
  }
}

export default ResetPassword;