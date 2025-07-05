import React, { useEffect } from 'react';
import AdminLogin from '../../admin/components/AdminLogin';

const AdminLoginPage = () => {
  useEffect(() => {
    // If already logged in, redirect to /admin
    const session = localStorage.getItem('admin_session');
    if (session) {
      window.location.href = '/admin';
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <AdminLogin />
    </div>
  );
};

export default AdminLoginPage; 