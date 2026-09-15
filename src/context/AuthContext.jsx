import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Check localStorage or default to logged out
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('second_brain_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, password) => {
    // Dummy credential check
    const dummyUser = { email, name: email.split('@')[0] };
    setUser(dummyUser);
    localStorage.setItem('second_brain_user', JSON.stringify(dummyUser));
    return true;
  };

  const signup = (name, email, password) => {
    const newUser = { name, email };
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