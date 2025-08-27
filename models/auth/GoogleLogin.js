import { auth } from '../../firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';

WebBrowser.maybeCompleteAuthSession();

class GoogleLogin {
  constructor() {
    this.webClientId = '816220791108-spprgvq8p9htlns6ilv129dv9h82vpmu.apps.googleusercontent.com';
    this.discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      userInfoEndpoint: 'https://www.googleapis.com/oauth2/v2/userinfo',
    };
  }

  async signIn() {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        useProxy: true,
      });

      // Generate PKCE parameters
      const { codeChallenge, codeVerifier } = await this.generateCodeChallenge();

      const request = new AuthSession.AuthRequest({
        clientId: this.webClientId,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        codeChallenge,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
      });

      const result = await request.promptAsync(this.discovery);

      if (result.type === 'success') {
        const { code } = result.params;
        
        // Exchange authorization code for tokens
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId: this.webClientId,
            code,
            redirectUri,
            codeVerifier, // Include the code verifier for PKCE
            extraParams: {},
          },
          this.discovery
        );

        const { id_token, access_token } = tokenResult;
        
        // Get user info from Google
        const userInfo = await this.getUserInfo(access_token);
        
        // Create a Google credential with the ID token
        const googleCredential = GoogleAuthProvider.credential(id_token);
        
        // Sign-in the user with the credential
        const userCredential = await signInWithCredential(auth, googleCredential);
        
        return {
          userCredential,
          userData: {
            username: userInfo.name,
            email: userInfo.email,
            photoURL: userInfo.picture,
            uid: userCredential.user.uid
          }
        };
      } else {
        throw new Error('Google Sign-In was cancelled');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  }

  async generateCodeChallenge() {
    try {
      // Generate a random code verifier
      const codeVerifier = this.generateRandomString(128);
      
      // Create SHA256 hash of the code verifier
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        codeVerifier,
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );
      
      // Convert BASE64 to BASE64URL format
      const codeChallenge = digest
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      
      return {
        codeChallenge: codeChallenge,
        codeVerifier: codeVerifier
      };
    } catch (error) {
      console.error('Error generating code challenge:', error);
      throw error;
    }
  }

  generateRandomString(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    const values = new Uint8Array(length);
    
    // Use crypto.getRandomValues if available, otherwise fallback
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(values);
    } else {
      // Fallback for environments without crypto.getRandomValues
      for (let i = 0; i < length; i++) {
        values[i] = Math.floor(Math.random() * 256);
      }
    }
    
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
    
    return result;
  }

  async getUserInfo(accessToken) {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      await auth.signOut();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      return auth.currentUser;
    } catch (error) {
      console.error('Get Current User Error:', error);
      return null;
    }
  }
}

export default GoogleLogin;
