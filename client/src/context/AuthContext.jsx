import { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // On mount, if a token is already in localStorage, fetch the current user
  // from /api/auth/me to restore the session without requiring a new login.
  useEffect(() => {
    if (!token) { setLoading(false); return; }

    axiosInstance.get('/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => {
        // Token is invalid or expired — clear it so the user is logged out cleanly.
        localStorage.removeItem('token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const login = async (email, password) => {
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    persist(data.token);
    const { data: me } = await axiosInstance.get('/auth/me');
    setUser(me);
  };

  const register = async (name, email, password, role) => {
    const { data } = await axiosInstance.post('/auth/register', { name, email, password, role });
    persist(data.token);
    const { data: me } = await axiosInstance.get('/auth/me');
    setUser(me);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
