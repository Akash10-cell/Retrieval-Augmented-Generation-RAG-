import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Check localStorage or default to logged out
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('second_brain_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, password) => {
    const accounts = JSON.parse(localStorage.getItem('second_brain_accounts') || '{}');
    const account = accounts[email.toLowerCase()];

    if (!account || account.password !== password) {
      return false;
    }

    const signedInUser = { email: account.email, name: account.name };
    setUser(signedInUser);
    localStorage.setItem('second_brain_user', JSON.stringify(signedInUser));
    return true;
  };

  const signup = (name, email, password) => {
    const accounts = JSON.parse(localStorage.getItem('second_brain_accounts') || '{}');
    const normalizedEmail = email.toLowerCase();

    if (accounts[normalizedEmail]) {
      return false;
    }

    const newUser = { name, email: normalizedEmail };
    accounts[normalizedEmail] = { ...newUser, password };
    localStorage.setItem('second_brain_accounts', JSON.stringify(accounts));
    setUser(newUser);
    localStorage.setItem('second_brain_user', JSON.stringify(newUser));
    return true;
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