/**
 * AuthContext – JWT session state shared by the whole guest app.
 * Token + user are persisted in localStorage so sessions survive reloads.
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('airbnb_token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('airbnb_user'));
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    const data = await api('/users/login', { method: 'POST', body: { email, password } });
    localStorage.setItem('airbnb_token', data.token);
    localStorage.setItem('airbnb_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('airbnb_token');
    localStorage.removeItem('airbnb_user');
    setToken(null);
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ token, user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
