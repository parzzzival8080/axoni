import React, { useContext, useState, useMemo } from 'react';
import { LogContext } from '../context/LogContext';

const actionColors = {
  CREATE: 'text-green-400',
  READ: 'text-blue-400',
  UPDATE: 'text-yellow-400',
  DELETE: 'text-red-400',
  ERROR: 'text-red-500',
};

const AdminConsole = ({ onClose }) => {
  const { logs } = useContext(LogContext);
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterTable, setFilterTable] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filterAction !== 'ALL' && log.action !== filterAction) return false;
      if (filterTable !== 'ALL' && log.table !== filterTable) return false;
      if (search && !(
        log.description.toLowerCase().includes(search.toLowerCase()) ||
        (log.user && log.user.toLowerCase().includes(search.toLowerCase()))
      )) return false;
      return true;
    });
  }, [logs, filterAction, filterTable, search]);

  const handleDownload = () => {
    const csv = [
      ['Timestamp', 'Action', 'Table', 'User', 'Status', 'Description'],
      ...logs.map(l => [l.timestamp, l.action, l.table, l.user || '', l.status, l.description])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin-logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueTables = Array.from(new Set(logs.map(l => l.table))).filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl p-0 relative animate-fadeIn overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" strokeWidth={2} /><path d="M8 2v4M16 2v4" strokeWidth={2} /></svg>
            Admin Console
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white focus:outline-none">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="flex flex-wrap gap-3 items-center mb-2">
            <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-xs">
              <option value="ALL">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="READ">Read</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="ERROR">Error</option>
            </select>
            <select value={filterTable} onChange={e => setFilterTable(e.target.value)} className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-xs">
              <option value="ALL">All Tables</option>
              {uniqueTables.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-xs flex-1 min-w-[120px]"
            />
            <button onClick={handleDownload} className="ml-auto px-3 py-1.5 bg-accent text-white rounded text-xs font-semibold hover:bg-accent/80 transition-colors">Download CSV</button>
          </div>
          <div className="h-[540px] overflow-y-auto bg-gray-950 rounded-lg border border-gray-800 p-2">
            {filteredLogs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No logs found.</div>
            ) : (
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="text-gray-400">
                    <th className="px-2 py-1 text-left">Time</th>
                    <th className="px-2 py-1 text-left">Action</th>
                    <th className="px-2 py-1 text-left">Table</th>
                    <th className="px-2 py-1 text-left">User</th>
                    <th className="px-2 py-1 text-left">Status</th>
                    <th className="px-2 py-1 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, i) => (
                    <tr key={i} className="border-b border-gray-900 last:border-0 hover:bg-gray-800 transition-colors">
                      <td className="px-2 py-1 text-gray-400 whitespace-nowrap">{log.timestamp}</td>
                      <td className={`px-2 py-1 font-bold ${actionColors[log.action] || 'text-white'}`}>{log.action}</td>
                      <td className="px-2 py-1 text-gray-300">{log.table}</td>
                      <td className="px-2 py-1 text-gray-300">{log.user || '-'}</td>
                      <td className={`px-2 py-1 font-semibold ${log.status === 'Success' ? 'text-green-400' : 'text-red-400'}`}>{log.status}</td>
                      <td className="px-2 py-1 text-gray-200 max-w-[200px] truncate" title={log.description}>{log.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConsole; 