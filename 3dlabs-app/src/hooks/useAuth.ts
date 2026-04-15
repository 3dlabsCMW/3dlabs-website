import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';

import { authService } from '../services/authService';
import { AppUser } from '../types';

export const useAuth = () => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.subscribeAuth(async (user) => {
      setFirebaseUser(user);
      if (user) {
        const appUser = await authService.getUserProfile(user.uid);
        setProfile(appUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { firebaseUser, profile, loading };
};
