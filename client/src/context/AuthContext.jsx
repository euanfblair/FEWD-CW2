import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password, familyId) => {
    try {
      const response = await api.post('/login', { username, password, familyId });

      if (response.data.success) {
        const { token, username, displayName, userfamily, familyCode, familyName } = response.data;

        const userData = {
          username,
          displayName,
          familyId: userfamily,
          familyCode: familyCode,
          familyName: familyName
        };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        return { success: true };
      } else {
        return { success: false, message: response.data.msg || "Login failed" };
      }
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: error.response?.data?.msg || "Login failed" };
    }
  };

  const register = async (username, displayName, password, familyData, mode) => {
    try {
      const response = await api.post('/register', { username, displayName, password, familyData, mode });
      return response.data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

