import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'owner' | 'editor' | 'viewer'; // Will map all to owner for now to fit schema
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role: 'owner', // Defaulting to owner for own documents
        });
        
        // Save user to Firestore to enable resolving email to UID for sharing
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            lastSeen: Date.now()
          }, { merge: true });
        } catch (err) {
          console.error("Failed to update user profile", err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
