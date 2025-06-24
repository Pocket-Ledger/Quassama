import { 
  sendPasswordResetEmail, 
  confirmPasswordReset, 
  verifyPasswordResetCode,
  checkActionCode 
} from "firebase/auth";
import { auth } from "firebase";

class ResetPassword {
  /**
   * Send password reset email to user
   * @param {string} email - User's email address
   * @returns {Promise<{success: boolean, message: string, error?: any}>}
   */
  static async sendResetEmail(email) {
    try {
      if (!email || !this.isValidEmail(email)) {
        return {
          success: false,
          message: "Please provide a valid email address",
          error: "INVALID_EMAIL"
        };
      }

      await sendPasswordResetEmail(auth, email, {
        // Optional: Custom action code settings
        url: 'https://yourapp.com/login', // Redirect URL after password reset
        handleCodeInApp: false, // Set to true if you want to handle the reset in your app
      });

      return {
        success: true,
        message: `Password reset email sent to ${email}. Please check your inbox.`,
      };

    } catch (error) {
      console.error("Failed to send reset email:", error);
      
      const errorResponse = this.handleFirebaseError(error);
      return {
        success: false,
        message: errorResponse.message,
        error: errorResponse.code
      };
    }
  }

  /**
   * Verify password reset code (optional - for custom implementation)
   * @param {string} code - Password reset code from email
   * @returns {Promise<{success: boolean, email?: string, message: string, error?: any}>}
   */
  static async verifyResetCode(code) {
    try {
      if (!code) {
        return {
          success: false,
          message: "Reset code is required",
          error: "INVALID_CODE"
        };
      }

      const email = await verifyPasswordResetCode(auth, code);
      
      return {
        success: true,
        email: email,
        message: "Reset code verified successfully",
      };

    } catch (error) {
      console.error("Failed to verify reset code:", error);
      
      const errorResponse = this.handleFirebaseError(error);
      return {
        success: false,
        message: errorResponse.message,
        error: errorResponse.code
      };
    }
  }

  /**
   * Confirm password reset with new password (optional - for custom implementation)
   * @param {string} code - Password reset code from email
   * @param {string} newPassword - New password
   * @returns {Promise<{success: boolean, message: string, error?: any}>}
   */
  static async confirmReset(code, newPassword) {
    try {
      if (!code || !newPassword) {
        return {
          success: false,
          message: "Reset code and new password are required",
          error: "MISSING_PARAMETERS"
        };
      }

      if (!this.isValidPassword(newPassword)) {
        return {
          success: false,
          message: "Password must be at least 6 characters long",
          error: "WEAK_PASSWORD"
        };
      }

      await confirmPasswordReset(auth, code, newPassword);
      
      return {
        success: true,
        message: "Password reset successfully. You can now log in with your new password.",
      };

    } catch (error) {
      console.error("Failed to confirm password reset:", error);
      
      const errorResponse = this.handleFirebaseError(error);
      return {
        success: false,
        message: errorResponse.message,
        error: errorResponse.code
      };
    }
  }

  /**
   * Check if action code is valid and get info about it
   * @param {string} code - Action code from email
   * @returns {Promise<{success: boolean, info?: any, message: string, error?: any}>}
   */
  static async checkResetCode(code) {
    try {
      const info = await checkActionCode(auth, code);
      
      return {
        success: true,
        info: {
          operation: info.operation,
          email: info.data.email,
        },
        message: "Action code is valid",
      };

    } catch (error) {
      console.error("Failed to check action code:", error);
      
      const errorResponse = this.handleFirebaseError(error);
      return {
        success: false,
        message: errorResponse.message,
        error: errorResponse.code
      };
    }
  }

  /**
   * Validate email format
   * @param {string} email 
   * @returns {boolean}
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * @param {string} password 
   * @returns {boolean}
   */
  static isValidPassword(password) {
    return password && password.length >= 6;
  }

  /**
   * Handle Firebase authentication errors
   * @param {any} error - Firebase error object
   * @returns {{code: string, message: string}}
   */
  static handleFirebaseError(error) {
    const errorCode = error.code;
    let message = "An unexpected error occurred. Please try again.";

    switch (errorCode) {
      case 'auth/user-not-found':
        message = "No account found with this email address.";
        break;
      case 'auth/invalid-email':
        message = "Please enter a valid email address.";
        break;
      case 'auth/too-many-requests':
        message = "Too many requests. Please try again later.";
        break;
      case 'auth/network-request-failed':
        message = "Network error. Please check your connection and try again.";
        break;
      case 'auth/invalid-action-code':
        message = "Invalid or expired reset code. Please request a new one.";
        break;
      case 'auth/expired-action-code':
        message = "Reset code has expired. Please request a new one.";
        break;
      case 'auth/weak-password':
        message = "Password is too weak. Please choose a stronger password.";
        break;
      case 'auth/user-disabled':
        message = "This account has been disabled. Please contact support.";
        break;
      default:
        message = error.message || message;
        break;
    }

    return {
      code: errorCode,
      message: message
    };
  }

  /**
   * Get current authenticated user
   * @returns {any|null}
   */
  static getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  static isUserAuthenticated() {
    return !!auth.currentUser;
  }
}

export default ResetPassword;