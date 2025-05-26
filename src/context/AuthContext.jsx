// src/context/AuthContext.js
import { createContext, useContext, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    role: 'teacher', // Default role for testing
    name: 'Demo Teacher'
  });

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router>
        {children}
      </Router>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};