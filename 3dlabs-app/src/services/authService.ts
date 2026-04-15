import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '../firebase/config';
import { AppUser } from '../types';

export const authService = {
  login: (email: string, password: string) => signInWithEmailAndPassword(auth, email, password),
  logout: () => signOut(auth),
  subscribeAuth: (callback: (user: User | null) => void) => onAuthStateChanged(auth, callback),
  getUserProfile: async (uid: string): Promise<AppUser | null> => {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<AppUser, 'id'>) };
  }
};
