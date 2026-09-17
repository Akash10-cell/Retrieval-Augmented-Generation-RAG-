import React, { createContext, useContext, useState } from 'react';
import { loginUser, registerUser } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Check localStorage or default to logged out
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('second_brain_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    const account = await loginUser(email, password);
    const signedInUser = {
      email: account.email,
      name: account.name,
      token: account.token,
      userId: account.user_id,
    };
    setUser(signedInUser);
    localStorage.setItem('second_brain_user', JSON.stringify(signedInUser));
    return signedInUser;
  };

  const signup = async (name, email, password) => {
    const account = await registerUser(name, email, password);
    const newUser = {
      name,
      email: email.toLowerCase(),
      token: account.token,
      userId: account.inserted_id,
    };
    setUser(newUser);
    localStorage.setItem('second_brain_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('second_brain_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);