import { createContext, useContext, useState, useEffect } from 'react';
import adminApi from '../services/adminApi';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cw_admin_token');
    if (token) {
      adminApi.get('/admin/auth/profile')
        .then(res => setAdmin(res.data?.data))
        .catch(() => {
          localStorage.removeItem('cw_admin_token');
          setAdmin(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await adminApi.post('/admin/auth/login', { email, password });
    const { token, data } = res.data;
    localStorage.setItem('cw_admin_token', token);
    setAdmin(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('cw_admin_token');
    setAdmin(null);
    window.location.href = '/admin/login';
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};
