import React from "react";

export default function FutureAssetsList() {
  const [assets, setAssets] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 8;

  const totalPages = Math.ceil(assets.length / PAGE_SIZE);
  const pagedAssets = assets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  React.useEffect(() => {
    async function fetchAssets() {
      setIsLoading(true);
      setError(null);
      try {
        const apiKey = 'A20RqFwVktRxxRqrKBtmi6ud';
        const uid = localStorage.getItem('uid');
        // Use the same endpoint as spot for now; if futures-specific endpoint is needed, update here
        const url = `https://api.kinecoin.co/api/v1/user-wallets/${uid}?apikey=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        setAssets(Array.isArray(data["0"]) ? data["0"] : []);
      } catch (err) {
        setError('Failed to load assets.');
        setAssets([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAssets();
  }, []);

  if (isLoading) return <div className="py-8 text-center text-gray-400 dark:text-gray-500">Loading assets...</div>;
  if (error) return <div className="py-8 text-center text-red-500">{error}</div>;
  if (!assets.length) return <div className="py-8 text-center text-gray-400 dark:text-gray-500">No assets found.</div>;

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full bg-black dark:bg-black rounded-lg divide-y divide-[#23272F]">
        <thead>
          <tr className="text-xs text-white uppercase font-semibold border-b border-[#23272F]">
            <th className="px-4 py-2 text-left font-medium text-xs">Asset</th>
            <th className="px-4 py-2 text-left font-medium text-xs">Symbol</th>
            <th className="px-4 py-2 text-right font-medium text-xs">Spot Balance</th>
            <th className="px-4 py-2 text-right font-medium text-xs">Futures Balance</th>
            <th className="px-4 py-2 text-right font-medium text-xs">Price</th>
          </tr>
        </thead>
        <tbody className="text-xs text-white">
          {pagedAssets.map(asset => (
            <tr key={asset.wallet_id} className="group hover:bg-[#181A20] transition border-b border-[#23272F]">
              <td className="px-4 py-2 flex items-center gap-2 min-w-[120px]">
                <img src={asset.logo_path} alt={asset.crypto_symbol} className="w-7 h-7 object-cover rounded-full" />
                <span className="font-medium text-white">{asset.crypto_name}</span>
              </td>
              <td className="px-4 py-2 font-semibold min-w-[80px] text-white">{asset.crypto_symbol}</td>
              <td className="px-4 py-2 text-right font-mono font-bold text-white min-w-[90px]">{Number(asset.spot_wallet).toLocaleString(undefined, {maximumFractionDigits: 8})}</td>
              <td className="px-4 py-2 text-right font-mono font-bold text-white min-w-[90px]">{Number(asset.future_wallet).toLocaleString(undefined, {maximumFractionDigits: 8})}</td>
              <td className="px-4 py-2 text-right font-mono font-bold text-white min-w-[90px]">{Number(asset.price).toLocaleString(undefined, {maximumFractionDigits: 8})}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-black border-t border-[#23272F] text-xs text-white">
        <button
          className={`px-2 py-1 rounded bg-black hover:bg-[#181A20] transition disabled:opacity-40 disabled:cursor-not-allowed border border-[#23272F]`}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          &lt;
        </button>
        <span>
          Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, assets.length)} of {assets.length} assets
        </span>
        <button
          className={`px-2 py-1 rounded bg-black hover:bg-[#181A20] transition disabled:opacity-40 disabled:cursor-not-allowed border border-[#23272F]`}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
