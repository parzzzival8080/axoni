import React, { useState } from 'react';
import { supabase } from '../config/supabase';

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError || !authData?.user) {
        setError('Incorrect email or password.');
        setLoading(false);
        return;
      }
      // 2. Check if user is in admin_users and is active
      const userId = authData.user.id;
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();
      if (adminError || !adminData) {
        setError('Not an active admin.');
        setLoading(false);
        return;
      }
      // 3. Success: store session and redirect
      localStorage.setItem('admin_session', JSON.stringify({
        id: adminData.id,
        email: adminData.email,
        role: adminData.role,
        permissions: adminData.permissions,
      }));
      if (onLogin) onLogin(adminData);
      window.location.href = '/admin';
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-lg shadow-lg p-8 w-full max-w-md"
        autoComplete="off"
      >
        <h2 className="text-2xl font-bold text-center text-text mb-6">Admin Login</h2>
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 rounded p-3 mb-4 text-center">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded text-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="admin@axoni.co"
            required
            autoFocus
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded text-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Enter your password"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-accent hover:bg-accent-secondary text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin; 