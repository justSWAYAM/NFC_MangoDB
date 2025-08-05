import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
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
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        // If role is provided, use it, otherwise default to "User"
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          role: role || "User",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
      } else {
        // Update last login time and role if provided
        const updateData = {
          lastLogin: new Date().toISOString()
        };
        if (role) {
          updateData.role = role;
        }
        await setDoc(userDocRef, updateData, { merge: true });
      }

      // Return user data including role
      const updatedDocSnap = await getDoc(userDocRef);
      const userData = updatedDocSnap.data();

      return { user, role: userData.role, success: true };
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
