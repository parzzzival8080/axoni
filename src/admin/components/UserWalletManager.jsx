import React, { useEffect, useState } from 'react';
import { supabaseWalletApi } from '../config/supabaseWalletApi';

function stringToColor(str) {
  // Simple hash to color for avatar backgrounds
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
}

function getFlagEmoji(country) {
  if (!country) return '';
  // Simple mapping for demo, you can expand this
  const map = {
    Philippines: '🇵🇭',
    Albania: '🇦🇱',
    Afghanistan: '🇦🇫',
    Japan: '🇯🇵',
    Canada: '🇨🇦',
    Oman: '🇴🇲',
    'Åland Islands': '🇦🇽',
  };
  return map[country] || '';
}

const UserWalletManager = () => {
  const [users, setUsers] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingWallet, setEditingWallet] = useState(null);
  const [walletForm, setWalletForm] = useState({ spot_wallet: '', future_wallet: '', funding_wallet: '', credit: '' });
  const [updating, setUpdating] = useState(false);
  const [walletsModalUser, setWalletsModalUser] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingWalletUpdate, setPendingWalletUpdate] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: userData, error: userError } = await supabaseWalletApi
        .from('user_details')
        .select('*');
      if (userError) throw userError;
      setUsers(userData || []);
      const { data: walletData, error: walletError } = await supabaseWalletApi
        .from('wallets')
        .select('*');
      if (walletError) throw walletError;
      setWallets(walletData || []);
      const { data: coinData, error: coinError } = await supabaseWalletApi
        .from('coins')
        .select('*');
      if (coinError) throw coinError;
      setCoins(coinData || []);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => setSearch(e.target.value);

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      String(u.id).includes(search)
  );

  const getUserWallets = (userId) => {
    const userWallets = wallets.filter(w => w.user_detail_id === userId);
    // Sort: wallets with any non-zero value first
    return userWallets.sort((a, b) => {
      const aHasValue = Number(a.spot_wallet) !== 0 || Number(a.future_wallet) !== 0 || Number(a.funding_wallet) !== 0 || Number(a.credit) !== 0;
      const bHasValue = Number(b.spot_wallet) !== 0 || Number(b.future_wallet) !== 0 || Number(b.funding_wallet) !== 0 || Number(b.credit) !== 0;
      if (aHasValue === bHasValue) return 0;
      return aHasValue ? -1 : 1;
    });
  };
  const getCoin = (coinId) => coins.find(c => String(c.id) === String(coinId));
  const getCoinName = (coinId) => getCoin(coinId)?.name || coinId;
  const getCoinIcon = (coinId) => {
    const coin = getCoin(coinId);
    if (!coin) return <span className="inline-block w-6 h-6 rounded-full bg-gray-700 text-xs flex items-center justify-center">?</span>;
    return (
      <span
        className="inline-block w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mr-2"
        style={{ background: stringToColor(coin.name) }}
        title={coin.name}
      >
        {coin.name[0]}
      </span>
    );
  };
  const getTotalBalance = (wallets) => {
    // Just sum spot_wallet for demo; you can sum all if you want
    return wallets.reduce((sum, w) => sum + parseFloat(w.spot_wallet || 0), 0);
  };

  const openEditWallet = (wallet) => {
    setEditingWallet(wallet);
    setWalletForm({
      spot_wallet: wallet.spot_wallet,
      future_wallet: wallet.future_wallet,
      funding_wallet: wallet.funding_wallet,
      credit: wallet.credit
    });
    setEditSuccess(false);
    setPasswordInput('');
    setPasswordError('');
    setShowPasswordModal(false);
    setPendingWalletUpdate(null);
  };

  const handleWalletEditSubmit = (e) => {
    e.preventDefault();
    setPendingWalletUpdate({ ...walletForm });
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setPasswordError('');
    setError(null);
    try {
      // TEMP: Hardcoded password check
      if (passwordInput !== '123123123') {
        setPasswordError('Incorrect password.');
        setUpdating(false);
        return;
      }
      const { error } = await supabaseWalletApi
        .from('wallets')
        .update({
          spot_wallet: pendingWalletUpdate.spot_wallet,
          future_wallet: pendingWalletUpdate.future_wallet,
          funding_wallet: pendingWalletUpdate.funding_wallet,
          credit: pendingWalletUpdate.credit
        })
        .eq('id', editingWallet.id);
      if (error) throw error;
      setWallets((prev) =>
        prev.map((w) =>
          w.id === editingWallet.id
            ? { ...w, ...pendingWalletUpdate }
            : w
        )
      );
      setEditSuccess(true);
      setTimeout(() => setEditSuccess(false), 1200);
      setEditingWallet(null);
      setWalletForm({ spot_wallet: '', future_wallet: '', funding_wallet: '', credit: '' });
      setShowPasswordModal(false);
      setPendingWalletUpdate(null);
      setPasswordInput('');
    } catch (err) {
      setError('Failed to update wallet');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">User & Wallet Management</h2>
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
          <span className="ml-2 text-white">Loading users & wallets...</span>
        </div>
      ) : (
        <div className="divide-y divide-gray-800 rounded-lg overflow-hidden">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 px-4 py-3 bg-gray-900 hover:bg-gray-800 transition-colors group"
            >
              {/* Avatar: use user.avatar if available, else initials */}
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || user.email || 'User'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-700 shadow-sm"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-white shadow-sm"
                  style={{ background: stringToColor(user.email || user.name || 'U') }}
                >
                  {(user.name || user.email || 'U').slice(0, 2).toUpperCase()}
                </div>
              )}
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white truncate max-w-[120px]" title={user.name || 'N/A'}>
                    {user.name || <span className="italic text-gray-400">N/A</span>}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700 ml-1">
                    {getFlagEmoji(user.user_country)} {user.user_country || 'N/A'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent ml-1">
                    Lv. {user.trading_level || 1}
                  </span>
                </div>
                <div className="text-gray-400 text-xs truncate max-w-[180px]" title={user.email}>{user.email}</div>
              </div>
              {/* View Wallets Button */}
              <button
                onClick={() => setWalletsModalUser(user)}
                className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                title="View Wallets"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2z" /><circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth={2} /></svg>
                Wallets
              </button>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center text-gray-500 py-8">No users found.</div>
          )}
        </div>
      )}
      {/* Wallets Modal */}
      {walletsModalUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="backdrop-blur-lg bg-gray-900/90 border border-gray-700 rounded-2xl shadow-2xl p-0 w-full max-w-2xl relative overflow-hidden animate-fadeIn">
            {/* User Card Header */}
            <div className="flex items-center gap-4 px-8 py-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg" style={{ background: stringToColor(walletsModalUser.email || walletsModalUser.name || 'U') }}>
                  {(walletsModalUser.name || walletsModalUser.email || 'U').slice(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold text-white">{walletsModalUser.name || <span className="italic text-gray-400">N/A</span>}</div>
                <div className="text-gray-300 text-sm">{walletsModalUser.email}</div>
                <div className="text-gray-400 text-xs mt-1">{walletsModalUser.user_country && <span>🌍 {walletsModalUser.user_country}</span>}</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-xs text-gray-400 mb-1">Total Spot Balance</div>
                <div className="text-lg font-bold text-accent">{getTotalBalance(getUserWallets(walletsModalUser.id)).toLocaleString(undefined, { maximumFractionDigits: 8 })}</div>
              </div>
              <button
                onClick={() => setWalletsModalUser(null)}
                className="ml-4 text-gray-400 hover:text-white focus:outline-none"
                aria-label="Close"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Wallets Table */}
            <div className="p-8 pt-4 max-h-[60vh] overflow-y-auto">
              {getUserWallets(walletsModalUser.id).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="mb-4 text-accent"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3"/></svg>
                  <div className="text-gray-400 text-lg font-semibold mb-2">No wallets yet!</div>
                  <div className="text-gray-500 text-sm italic">Looks like this user is still hodling their fiat. 🚀</div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Coin</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Spot <span className="bg-green-900 text-green-400 px-2 py-0.5 rounded-full text-[10px] ml-1">SPOT</span></th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Future <span className="bg-blue-900 text-blue-400 px-2 py-0.5 rounded-full text-[10px] ml-1">FUTURE</span></th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Funding <span className="bg-yellow-900 text-yellow-400 px-2 py-0.5 rounded-full text-[10px] ml-1">FUND</span></th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Credit <span className="bg-purple-900 text-purple-400 px-2 py-0.5 rounded-full text-[10px] ml-1">CREDIT</span></th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {getUserWallets(walletsModalUser.id).map((wallet) => (
                      <tr key={wallet.id} className="hover:bg-gray-800 transition-colors group">
                        <td className="px-3 py-2 text-white font-mono flex items-center">
                          {getCoinIcon(wallet.coin_id)}
                          <span className="font-semibold">{getCoinName(wallet.coin_id)}</span>
                        </td>
                        <td className="px-3 py-2 text-green-300 font-mono">{wallet.spot_wallet}</td>
                        <td className="px-3 py-2 text-blue-300 font-mono">{wallet.future_wallet}</td>
                        <td className="px-3 py-2 text-yellow-300 font-mono">{wallet.funding_wallet}</td>
                        <td className="px-3 py-2 text-purple-300 font-mono">{wallet.credit}</td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => openEditWallet(wallet)}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent group-hover:scale-110 group-hover:shadow-lg"
                            aria-label="Edit Wallet"
                            title="Edit Wallet"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Edit Wallet Modal */}
      {editingWallet && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 w-full max-w-md relative animate-fadeIn">
            <button
              onClick={() => setEditingWallet(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Edit Wallet</h3>
            <form onSubmit={handleWalletEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Spot Wallet</label>
                <input
                  type="number"
                  value={walletForm.spot_wallet}
                  onChange={(e) => setWalletForm({ ...walletForm, spot_wallet: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Future Wallet</label>
                <input
                  type="number"
                  value={walletForm.future_wallet}
                  onChange={(e) => setWalletForm({ ...walletForm, future_wallet: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Funding Wallet</label>
                <input
                  type="number"
                  value={walletForm.funding_wallet}
                  onChange={(e) => setWalletForm({ ...walletForm, funding_wallet: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Credit</label>
                <input
                  type="number"
                  value={walletForm.credit}
                  onChange={(e) => setWalletForm({ ...walletForm, credit: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingWallet(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center"
                >
                  {editSuccess ? (
                    <svg className="w-5 h-5 text-green-400 mr-1 animate-bounceIn" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  ) : updating ? 'Updating...' : 'Update Wallet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 w-full max-w-sm relative animate-fadeIn">
            <button
              onClick={() => { setShowPasswordModal(false); setUpdating(false); setPasswordInput(''); setPasswordError(''); }}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Enter User Password to Confirm</h3>
            <form onSubmit={handlePasswordConfirm} className="space-y-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="User password"
                required
              />
              {passwordError && <div className="text-red-400 text-xs mt-1">{passwordError}</div>}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setUpdating(false); setPasswordInput(''); setPasswordError(''); }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {updating ? 'Confirming...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserWalletManager; 