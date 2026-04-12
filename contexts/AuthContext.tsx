import React, {createContext, useState, useEffect, useContext} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebaseConfig.js';

 const AuthContext = createContext({});

 export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // e criado epenas 1 vez no startup do app
  useEffect(() => {
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    })

    return () => unsubscribe();
  }, []);


  return (
    <AuthContext.Provider value={{ user, loading }} >
      {children}
    </AuthContext.Provider>
  );

 };


 export const useAuth = () => useContext(AuthContext);
