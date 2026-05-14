import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUser } from '../mock';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('prizzy_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (email, _password) => {
    // Mock login
    const u = { ...mockUser, email };
    setUser(u);
    localStorage.setItem('prizzy_user', JSON.stringify(u));
    return { success: true };
  };

  const register = (data) => {
    const u = { ...mockUser, ...data };
    setUser(u);
    localStorage.setItem('prizzy_user', JSON.stringify(u));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('prizzy_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
