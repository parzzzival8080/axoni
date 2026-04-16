import { useState, useEffect } from 'react';
import { getCoinDescription } from '../../data/coinDescriptions';

const formatNumber = (val) => {
  if (!val || val === '--') return null;
  const n = parseFloat(String(val).replace(/,/g, ''));
  if (isNaN(n)) return val;
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
  return '$' + n.toFixed(2);
};

const formatSupply = (val) => {
  if (!val || val === '--') return null;
  const n = parseFloat(String(val).replace(/,/g, ''));
  if (isNaN(n)) return val;
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  return n.toLocaleString();
};

const CoinDescription = ({ symbol }) => {
  const [expanded, setExpanded] = useState(false);
  const [apiData, setApiData] = useState(null);
  const localInfo = getCoinDescription(symbol);

  // Fetch coin data from API to get description, rank, etc.
  useEffect(() => {
    if (!symbol) return;
    let mounted = true;
    fetch('https://api.axoni.co/api/v1/coins?apikey=5lPMMw7mIuyzQQDjlKJbe0dY')
      .then(r => r.json())
      .then(data => {
        if (!mounted) return;
        const coins = Array.isArray(data) ? data : data.data || [];
        const coin = coins.find(c =>
          c.symbol?.toUpperCase() === symbol?.toUpperCase() ||
          c.crypto_symbol?.toUpperCase() === symbol?.toUpperCase()
        );
        if (coin) setApiData(coin);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [symbol]);

  const description = apiData?.description || apiData?.crypto_description || localInfo?.desc;
  const name = apiData?.name || localInfo?.name || symbol;
  const hasAnyData = description || localInfo || apiData?.rank;

  if (!hasAnyData) return null;

  return (
    <div style={{ borderTop: '1px solid #1E1E1E', padding: '10px 16px', background: '#0a0a0a' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>About {name}</span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5E6673" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div style={{ marginTop: 10 }}>
          {description && (
            <p style={{ color: '#848E9C', fontSize: 12, lineHeight: 1.6, marginBottom: 14 }}>{description}</p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
            {apiData?.rank && apiData.rank !== '--' && (
              <div style={{ background: '#1E1E1E', borderRadius: 8, padding: '8px 10px' }}>
                <span style={{ color: '#5E6673', fontSize: 9, textTransform: 'uppercase' }}>Rank</span>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>#{apiData.rank}</p>
              </div>
            )}
            {apiData?.market_capitalization && apiData.market_capitalization !== '--' && (
              <div style={{ background: '#1E1E1E', borderRadius: 8, padding: '8px 10px' }}>
                <span style={{ color: '#5E6673', fontSize: 9, textTransform: 'uppercase' }}>Market Cap</span>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{formatNumber(apiData.market_capitalization)}</p>
              </div>
            )}
            {apiData?.circulating_supply && apiData.circulating_supply !== '--' && (
              <div style={{ background: '#1E1E1E', borderRadius: 8, padding: '8px 10px' }}>
                <span style={{ color: '#5E6673', fontSize: 9, textTransform: 'uppercase' }}>Circulating</span>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{formatSupply(apiData.circulating_supply)}</p>
              </div>
            )}
            {(apiData?.maximum_supply && apiData.maximum_supply !== '--') || localInfo?.maxSupply ? (
              <div style={{ background: '#1E1E1E', borderRadius: 8, padding: '8px 10px' }}>
                <span style={{ color: '#5E6673', fontSize: 9, textTransform: 'uppercase' }}>Max Supply</span>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{(apiData?.maximum_supply && apiData.maximum_supply !== '--') ? formatSupply(apiData.maximum_supply) : localInfo?.maxSupply}</p>
              </div>
            ) : null}
            {apiData?.total_supply && apiData.total_supply !== '--' && (
              <div style={{ background: '#1E1E1E', borderRadius: 8, padding: '8px 10px' }}>
                <span style={{ color: '#5E6673', fontSize: 9, textTransform: 'uppercase' }}>Total Supply</span>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{formatSupply(apiData.total_supply)}</p>
              </div>
            )}
            {apiData?.fully_dilluted_market_cap && apiData.fully_dilluted_market_cap !== '--' && (
              <div style={{ background: '#1E1E1E', borderRadius: 8, padding: '8px 10px' }}>
                <span style={{ color: '#5E6673', fontSize: 9, textTransform: 'uppercase' }}>FDV</span>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{formatNumber(apiData.fully_dilluted_market_cap)}</p>
              </div>
            )}
            {apiData?.market_dominance && apiData.market_dominance !== '--' && (
              <div style={{ background: '#1E1E1E', borderRadius: 8, padding: '8px 10px' }}>
                <span style={{ color: '#5E6673', fontSize: 9, textTransform: 'uppercase' }}>Dominance</span>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{apiData.market_dominance}%</p>
              </div>
            )}
            {apiData?.historical_high && apiData.historical_high !== '--' && (
              <div style={{ background: '#1E1E1E', borderRadius: 8, padding: '8px 10px' }}>
                <span style={{ color: '#5E6673', fontSize: 9, textTransform: 'uppercase' }}>ATH</span>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{formatNumber(apiData.historical_high)}</p>
              </div>
            )}
            {(apiData?.issue_date && apiData.issue_date !== '--') || localInfo?.launched ? (
              <div style={{ background: '#1E1E1E', borderRadius: 8, padding: '8px 10px' }}>
                <span style={{ color: '#5E6673', fontSize: 9, textTransform: 'uppercase' }}>Launched</span>
                <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>{(apiData?.issue_date && apiData.issue_date !== '--') ? apiData.issue_date : localInfo?.launched}</p>
              </div>
            ) : null}
            {localInfo?.website && (
              <div style={{ background: '#1E1E1E', borderRadius: 8, padding: '8px 10px' }}>
                <span style={{ color: '#5E6673', fontSize: 9, textTransform: 'uppercase' }}>Website</span>
                <a href={localInfo.website} target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#2EBD85', fontSize: 12, fontWeight: 500, textDecoration: 'none', margin: 0 }}>
                  {localInfo.website.replace('https://', '').replace('www.', '')}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoinDescription;
