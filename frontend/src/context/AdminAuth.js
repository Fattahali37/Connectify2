import { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../Interceptor/apiCall';
import { url } from '../baseUrl';

export const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [adminAuth, setAdminAuth] = useState(
    JSON.parse(localStorage.getItem('adminAuth')) || null
  );

  const loginAdmin = async (credentials) => {
    try {
      const response = await api.post(`${url}/auth/login`, credentials);
      
      if (response.data.isAdmin) {
        const adminData = {
          isAdmin: true,
          token: response.data.access_token,
          username: credentials.text
        };
        
        localStorage.setItem('adminAuth', JSON.stringify(adminData));
        setAdminAuth(adminData);
        return { success: true, data: adminData };
      }
      
      return { success: false, message: 'Invalid admin credentials' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem('adminAuth');
    setAdminAuth(null);
  };

  const isAdminAuthenticated = () => {
    return adminAuth && adminAuth.isAdmin && adminAuth.token;
  };

  // Set up axios interceptor for admin requests
  useEffect(() => {
    if (adminAuth?.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${adminAuth.token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [adminAuth]);

  const value = {
    adminAuth,
    loginAdmin,
    logoutAdmin,
    isAdminAuthenticated
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
