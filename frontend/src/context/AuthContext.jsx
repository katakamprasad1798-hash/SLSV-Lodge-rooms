import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('slsv_lodge_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('slsv_lodge_token') || null;
    } catch (e) {
      return null;
    }
  });

  const loginUser = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    try {
      localStorage.setItem('slsv_lodge_user', JSON.stringify(userData));
      localStorage.setItem('slsv_lodge_token', authToken);
    } catch (e) {
      // Ignore storage errors
    }
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('slsv_lodge_user');
      localStorage.removeItem('slsv_lodge_token');
    } catch (e) {
      // Ignore storage errors
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
