// src/context/AuthContext.js
import { createContext, useContext, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    role: 'teacher',//"student" // Default role for testing
    name: 'kamesh'
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