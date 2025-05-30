// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type User = {
  role: 'teacher' | 'student';
  name: string;
  rollnumber:string;
};

type AuthContextType = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
};
export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User>({
    role: 'teacher', // Default role for testing
    name: 'LEO',
    rollnumber:"STU123"
  });

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
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