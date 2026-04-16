import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  try {
    const isLoggedIn = !!localStorage.getItem('authToken');
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    return <React.Suspense fallback={null}>{children}</React.Suspense>;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
