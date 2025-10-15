import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminAuthContext } from '../context/AdminAuth';

const AdminProtected = ({ children }) => {
  const { isAdminAuthenticated } = useContext(AdminAuthContext);
  
  return isAdminAuthenticated() ? children : <Navigate to="/admin/login" replace />;
};

export default AdminProtected;
