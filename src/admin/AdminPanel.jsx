import React, { useState, useEffect } from 'react';
import { supabase } from './config/supabase';
import { WhiteLabelProvider, useWhiteLabel } from './context/WhiteLabelContext';
import AdminNavbar from './components/AdminNavbar';
import NameManager from './components/NameManager';
import ColorManager from './components/ColorManager';
import LogoManager from './components/LogoManager';
import AssetManager from './components/AssetManager';
import QRManager from './components/QRManager';
import ApiManager from './components/ApiManager';
import UserManager from './components/UserManager';
import UserWalletManager from './components/UserWalletManager';
import './AdminPanel.css';
import { useNavigate } from 'react-router-dom';

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastAction, setLastAction] = useState('');
  const { 
    config, 
    saveConfig, 
    hasChanges, 
    loading, 
    error, 
    lastSaved, 
    dbConnected,
    loadConfigFromDatabase
  } = useWhiteLabel();
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (!session) {
      navigate('/admin/login', { replace: true });
    } else {
      // Optionally, validate session structure or expiry here
      try {
        const parsed = JSON.parse(session);
        if (!parsed || !parsed.id || !parsed.email) {
          localStorage.removeItem('admin_session');
          navigate('/admin/login', { replace: true });
        }
      } catch {
        localStorage.removeItem('admin_session');
        navigate('/admin/login', { replace: true });
      }
    }
  }, [navigate]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasChanges && !loading && dbConnected) {
      const timer = setTimeout(async () => {
        try {
          setSaving(true);
          await saveConfig();
          setLastAction('Auto-saved');
        } catch (error) {
          console.error('Auto-save failed:', error);
          setLastAction('Auto-save failed');
        } finally {
          setSaving(false);
        }
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [hasChanges, autoSave, saveConfig, loading, dbConnected]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error getting user:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('admin_session');
      navigate('/admin/login', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleManualSave = async () => {
    try {
      setSaving(true);
      await saveConfig();
      setLastAction('Manually saved');
    } catch (error) {
      console.error('Manual save failed:', error);
      setLastAction('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLastAction('Refreshing...');
      await loadConfigFromDatabase();
      setLastAction('Refreshed from database');
    } catch (error) {
      console.error('Refresh failed:', error);
      setLastAction('Refresh failed');
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading configuration...</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'dashboard') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {getManagerCards().map((card) => (
            <div
              key={card.id}
              onClick={() => setActiveTab(card.id)}
              className="bg-black border-2 border-gray-700 rounded-lg p-6 cursor-pointer hover:border-gray-500 hover:shadow-xl hover:shadow-gray-800/50 transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors">
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-gray-300">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    switch (activeTab) {
      case 'names':
        return <NameManager />;
      case 'colors':
        return <ColorManager />;
      case 'logos':
        return <LogoManager />;
      case 'assets':
        return <AssetManager />;
      case 'qr':
        return <QRManager />;
      case 'apis':
        return <ApiManager />;
      case 'users':
        return <UserManager />;
      case 'userwallets':
        return <UserWalletManager />;
      default:
        return <NameManager />;
    }
  };

  const getManagerCards = () => [
    {
      id: 'names',
      title: 'Brand Identity',
      description: 'Configure platform name, taglines, and brand identity',
             icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      id: 'logos',
      title: 'Logo Management',
      description: 'Upload and manage platform logos and branding assets',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'assets',
      title: 'Asset Management',
      description: 'Manage images, backgrounds, and other visual assets',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      id: 'apis',
      title: 'API Configuration',
      description: 'Manage API endpoints and external service configurations',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'qr',
      title: 'QR Code Settings',
      description: 'Configure QR codes for app downloads and links',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      )
    },
    {
      id: 'colors',
      title: 'Color Scheme',
      description: 'Customize the color scheme and visual theme',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5v12h2V3zm10 18a4 4 0 004-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4zM17 3h2v12h-2V3z" />
        </svg>
      )
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'View and manage user accounts',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'userwallets',
      title: 'User & Wallet Management',
      description: 'Manage users and their wallets',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2z" />
          <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth={2} />
        </svg>
      )
    }
  ];

  const getStatusIndicator = () => {
    if (!dbConnected) {
      return (
        <div className="flex items-center space-x-2 text-sm text-red-400">
          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
          <span>Database Offline</span>
        </div>
      );
    }

    if (saving) {
      return (
        <div className="flex items-center space-x-2 text-sm text-yellow-400">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <span>Saving...</span>
        </div>
      );
    }

    if (hasChanges) {
      return (
        <div className="flex items-center space-x-2 text-sm text-orange-400">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
          <span>Unsaved Changes</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 text-sm text-green-400">
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        <span>All Saved</span>
      </div>
    );
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never';
    
    const now = new Date();
    const diff = now - lastSaved;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return lastSaved.toLocaleDateString();
  };

  return (
    <div className="admin-panel bg-black min-h-screen">
      <AdminNavbar 
        user={user}
        onSignOut={handleSignOut}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        saving={saving}
        hasChanges={hasChanges}
        lastSaved={lastSaved}
        lastAction={lastAction}
      />
      
      <div className="admin-layout">
        <main className="admin-main bg-black">
          {/* Status Bar */}
          <div className="bg-gray-900 border-b border-gray-800 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getStatusIndicator()}
                <span className="text-sm text-gray-300">
                  Last saved: {formatLastSaved()}
                </span>
                {lastAction && (
                  <span className="text-sm text-gray-400">
                    {lastAction}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="w-4 h-4 text-gray-600 bg-gray-800 border-gray-600 rounded focus:ring-gray-500"
                  />
                  <span>Auto-save</span>
                </label>
                
                <button
                  onClick={handleRefresh}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                  title="Refresh from database"
                  disabled={loading}
                >
                
                  <span>Refresh</span>
                </button>
                
                <button
                  onClick={handleManualSave}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors text-sm"
                  disabled={!hasChanges || saving || !dbConnected}
                  title="Save changes"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="admin-error">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
              <button 
                onClick={() => window.location.reload()} 
                className="error-retry"
              >
                Retry
              </button>
            </div>
          )}

          {/* Main Content */}
          <div className="admin-content">
            {activeTab !== 'dashboard' && (
              <div className="admin-content-header">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                  </button>
                </div>
                <h1 className="text-2xl font-bold text-white">{getTabTitle(activeTab)}</h1>
                <p className="text-gray-300 mt-2">{getTabDescription(activeTab)}</p>
              </div>
            )}
            
            {activeTab === 'dashboard' && (
              <div className="admin-content-header">
                <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-gray-300">Select a management section to configure your platform</p>
              </div>
            )}
            
            <div className="admin-content-body">
              {renderTabContent()}
            </div>
          </div>

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="admin-debug">
              <details>
                <summary>Debug Info</summary>
                <div className="debug-content">
                  <p><strong>Database Connected:</strong> {dbConnected ? '✅' : '❌'}</p>
                  <p><strong>User:</strong> {user?.email || 'Not authenticated'}</p>
                  <p><strong>Has Changes:</strong> {hasChanges ? '✅' : '❌'}</p>
                  <p><strong>Auto-save:</strong> {autoSave ? '✅' : '❌'}</p>
                  <p><strong>Config Keys:</strong> {Object.keys(config).join(', ')}</p>
                </div>
              </details>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const getTabTitle = (tab) => {
  const titles = {
    names: 'Brand Identity',
    colors: 'Color Scheme',
    logos: 'Logo Management', 
    assets: 'Asset Management',
    qr: 'QR Code Settings',
    apis: 'API Configuration',
    users: 'User Management',
    userwallets: 'User & Wallet Management'
  };
  return titles[tab] || 'Admin Panel';
};

const getTabDescription = (tab) => {
  const descriptions = {
    names: 'Configure your platform\'s name, taglines, and brand identity',
    colors: 'Customize the color scheme and visual theme',
    logos: 'Upload and manage platform logos and branding assets',
    assets: 'Manage images, backgrounds, and other visual assets',
    qr: 'Configure QR codes for app downloads and links',
    apis: 'Manage API endpoints and external service configurations',
    users: 'View and manage user accounts',
    userwallets: 'Manage users and their wallets'
  };
  return descriptions[tab] || 'Admin panel configuration';
};

const AdminPanel = () => {
  return (
    <WhiteLabelProvider>
      <AdminContent />
    </WhiteLabelProvider>
  );
};

export default AdminPanel; 