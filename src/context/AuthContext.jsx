import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function register(email, password, role) {
    const { data } = await api.post('/auth/register', { email, password, role });
    localStorage.setItem('accessToken', data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    localStorage.removeItem('accessToken');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
