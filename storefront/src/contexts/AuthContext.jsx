import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { cartService } from '../services/cartService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cw_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
      if (!localStorage.getItem('cw_guest_id')) {
        localStorage.setItem('cw_guest_id', 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
      }
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await authService.getMe();
      setUser(res.data.data);
    } catch {
      localStorage.removeItem('cw_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const { token, data } = res.data;
    localStorage.setItem('cw_token', token);
    localStorage.setItem('cw_user', JSON.stringify(data));
    setUser(data);
    try { await cartService.mergeCarts(); } catch (e) { /* ignore */ }
    return data;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    const { token, data } = res.data;
    localStorage.setItem('cw_token', token);
    localStorage.setItem('cw_user', JSON.stringify(data));
    setUser(data);
    try { await cartService.mergeCarts(); } catch (e) { /* ignore */ }
    return data;
  };

  const logout = async () => {
    try { await authService.logout(); } catch (e) { /* ignore */ }
    localStorage.removeItem('cw_token');
    localStorage.removeItem('cw_user');
    setUser(null);
  };

  const demoLogin = async (provider) => {
    const fn = provider === 'google' ? authService.demoGoogleLogin : authService.demoFacebookLogin;
    const res = await fn();
    const { token, data } = res.data;
    localStorage.setItem('cw_token', token);
    localStorage.setItem('cw_user', JSON.stringify(data));
    setUser(data);
    try { await cartService.mergeCarts(); } catch (e) { /* ignore */ }
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, demoLogin, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
