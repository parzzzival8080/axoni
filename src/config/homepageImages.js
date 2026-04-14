/**
 * Homepage Image Configuration
 * =============================
 * Change any image by updating the paths below.
 *   - Public folder:  "/images/banners/banner1.png"
 *   - External URLs:  "https://example.com/image.png"
 *   - null:           Uses the gradient fallback
 */

export const heroBanners = [
  {
    id: 1,
    image: null,
    gradient: "linear-gradient(135deg, #0d1f17 0%, #121212 50%, #0a1e14 100%)",
    tag: "New",
    title: "Trade Smarter with GLD",
    subtitle: "Access 50+ crypto pairs with institutional-grade liquidity, low fees, and lightning-fast execution.",
    cta: "Start Trading",
    link: "/spot-trading",
  },
  {
    id: 2,
    image: null,
    gradient: "linear-gradient(135deg, #121212 0%, #111827 50%, #0f172a 100%)",
    tag: "Earn",
    title: "Earn Passive Income",
    subtitle: "Stake your crypto and earn up to 12% APY with GLD Simple Earn. No lock-up required.",
    cta: "Start Earning",
    link: "/earn",
  },
  {
    id: 3,
    image: null,
    gradient: "linear-gradient(135deg, #1a0a2e 0%, #121212 50%, #0d1117 100%)",
    tag: "Pro",
    title: "Futures Trading is Live",
    subtitle: "Up to 100x leverage on BTC, ETH, and 50+ altcoins with advanced risk management tools.",
    cta: "Trade Futures",
    link: "/future-trading",
  },
];

export const newsArticles = [
  {
    title: "GLD Now Supports 50+ Trading Pairs",
    description: "We've expanded our spot and futures markets with new altcoin pairs, deeper liquidity, and tighter spreads across all markets.",
    date: "10 Apr 2026",
    category: "Platform",
    image: "/images/news/news1.png",
    link: "/help/category/announcements",
  },
  {
    title: "Proof of Reserves: April 2026 Audit",
    description: "Our latest third-party audit confirms all user funds are backed 1:1. Transparency you can verify on-chain.",
    date: "05 Apr 2026",
    category: "Security",
    image: "/images/news/news2.png",
    link: "/help/category/announcements",
  },
  {
    title: "Simple Earn: Up to 12% APY on Stablecoins",
    description: "Put your idle USDT and USDC to work with flexible staking. No lock-up period, withdraw anytime.",
    date: "28 Mar 2026",
    category: "Earn",
    image: "/images/news/news3.png",
    link: "/help/category/announcements",
  },
];
