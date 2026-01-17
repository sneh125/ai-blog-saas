'use client';

import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './firebase';
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user document exists in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          // Create user document if it doesn't exist
          await setDoc(userDocRef, {
            email: user.email,
            plan: 'FREE',
            blogCredits: 3,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          console.log('User document created for:', user.email);
          
          // TODO: Notify admin of new user registration (implement later)
          // await notifyAdminUserRegistered(user.uid, user.email || 'unknown@example.com');
        }
      }
      
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}