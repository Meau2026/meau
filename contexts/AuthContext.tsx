import { onAuthStateChanged, User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { auth } from '../firebaseConfig.js';

// Define the shape of the authentication context
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// Initialize context with undefined to enforce provider usage
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component with properly typed children prop
export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Set up Firebase auth state listener once on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to access authentication state safely
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
