import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { auth, googleProvider } from '../../firebase.js';

const db = getFirestore();

const authService = {
  async signup(email, password, name, role) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        name,
        role,
      });

      return { user, success: true };
    } catch (error) {
      return { error: error.message, success: false };
    }
  },

  async signin(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, success: true };
    } catch (error) {
      return { error: error.message, success: false };
    }
  },

  async signInWithGoogle(role = null) {
    try {
      // Use redirect instead of popup to avoid COOP issues
      await signInWithRedirect(auth, googleProvider);
      return { success: true, redirecting: true };
    } catch (error) {
      return { error: error.message, success: false };
    }
  },

  async handleRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const user = result.user;
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            role: "User",
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          });
        } else {
          await setDoc(userDocRef, {
            lastLogin: new Date().toISOString()
          }, { merge: true });
        }

        const updatedDocSnap = await getDoc(userDocRef);
        const userData = updatedDocSnap.data();

        return { user, role: userData.role, success: true };
      }
      return { success: false };
    } catch (error) {
      return { error: error.message, success: false };
    }
  },

  async signout() {
    try {
      await auth.signOut();
      return { success: true };
    } catch (error) {
      return { error: error.message, success: false };
    }
  },

  getCurrentUser() {
    return auth.currentUser;
  }
};

export default authService;