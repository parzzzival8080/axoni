import React, { useEffect, useState } from 'react';
import { supabaseWalletApi } from '../config/supabaseWalletApi';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [confirmAction, setConfirmAction] = useState(null); // { user, type }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabaseWalletApi
        .from('user_details')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      String(u.id).includes(search)
  );

  const handleConfirmToggle = (user) => {
    setConfirmAction({ user, type: u.is_status === true || u.is_status === 'true' ? 'deactivate' : 'activate' });
  };

  const handleToggleConfirmed = async () => {
    if (!confirmAction) return;
    setUpdating(true);
    setError(null);
    const user = confirmAction.user;
    try {
      const { error } = await supabaseWalletApi
        .from('user_details')
        .update({ is_status: !(user.is_status === true || user.is_status === 'true') })
        .eq('id', user.id);
      if (error) throw error;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_status: !(user.is_status === true || user.is_status === 'true') } : u
        )
      );
      setConfirmAction(null);
    } catch (err) {
      setError('Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      password: ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    try {
      const updateData = {
        name: editForm.name || null,
        email: editForm.email
      };
      if (editForm.password.trim()) {
        updateData.password = editForm.password;
      }
      const { error } = await supabaseWalletApi
        .from('user_details')
        .update(updateData)
        .eq('id', editingUser.id);
      if (error) throw error;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id 
            ? { ...u, name: editForm.name || null, email: editForm.email }
            : u
        )
      );
      setEditingUser(null);
      setEditForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError('Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search by email, name, or ID"
          className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 rounded p-3 mb-4 text-center">{error}</div>
      )}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <span className="ml-2 text-white">Loading users...</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-2 text-white font-mono">{user.id}</td>
                  <td className="px-4 py-2 text-gray-200">{user.name || <span className="italic text-gray-500">N/A</span>}</td>
                  <td className="px-4 py-2 text-gray-200">{user.email}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${user.is_status === true || user.is_status === 'true' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {user.is_status === true || user.is_status === 'true' ? 'Active' : 'Inactive'}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleConfirmToggle(user)}
                        disabled={updating}
                        aria-label={user.is_status === true || user.is_status === 'true' ? 'Deactivate' : 'Activate'}
                        className={`flex items-center justify-center gap-1 min-w-[110px] h-8 text-xs rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${user.is_status === true || user.is_status === 'true' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                      >
                        {user.is_status === true || user.is_status === 'true' ? '🔴' : '🟢'}
                        <span>{user.is_status === true || user.is_status === 'true' ? 'Deactivate' : 'Activate'}</span>
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        disabled={updating}
                        aria-label="Edit"
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" /></svg>
                      </button>
                      <button
                        onClick={() => setSelectedUser(user)}
                        aria-label="Details"
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-8">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 w-full max-w-lg relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-white mb-4">User Details</h3>
            <div className="space-y-2 text-gray-200">
              <div><span className="font-semibold text-gray-400">ID:</span> {selectedUser.id}</div>
              <div><span className="font-semibold text-gray-400">Name:</span> {selectedUser.name || <span className="italic text-gray-500">N/A</span>}</div>
              <div><span className="font-semibold text-gray-400">Email:</span> {selectedUser.email}</div>
              <div><span className="font-semibold text-gray-400">Active:</span> {selectedUser.is_status === true || selectedUser.is_status === 'true' ? 'Yes' : 'No'}</div>
              <div><span className="font-semibold text-gray-400">Email Verified:</span> {selectedUser.email_verified_at ? 'Yes' : 'No'}</div>
              <div><span className="font-semibold text-gray-400">Referral Code:</span> {selectedUser.referral_code}</div>
              <div><span className="font-semibold text-gray-400">UID:</span> {selectedUser.uid}</div>
              <div><span className="font-semibold text-gray-400">Secret Phrase:</span> {selectedUser.secret_phrase}</div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 w-full max-w-lg relative">
            <button
              onClick={() => {
                setEditingUser(null);
                setEditForm({ name: '', email: '', password: '' });
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Edit User</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">New Password (optional)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setEditForm({ name: '', email: '', password: '' });
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {updating ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Activate/Deactivate Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 w-full max-w-md relative">
            <button
              onClick={() => setConfirmAction(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-white mb-4">{confirmAction.type === 'activate' ? 'Activate User' : 'Deactivate User'}</h3>
            <p className="text-gray-200 mb-6">Are you sure you want to <span className="font-semibold">{confirmAction.type}</span> this user?<br /><span className="text-accent">{confirmAction.user.email}</span></p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleConfirmed}
                disabled={updating}
                className={`px-4 py-2 rounded-lg transition-colors text-white ${confirmAction.type === 'activate' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} ${updating ? 'opacity-50' : ''}`}
              >
                {updating ? 'Processing...' : confirmAction.type === 'activate' ? 'Activate' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager; 