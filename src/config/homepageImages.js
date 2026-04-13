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
    subtitle: "Access 500+ crypto pairs with institutional-grade liquidity, low fees, and lightning-fast execution.",
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
    title: "Bitcoin ETF: The Next Big Wave?",
    description: "Analysts discuss the potential impact of Bitcoin ETFs on the global crypto market.",
    date: "29 Nov 2025",
    category: "Markets",
    image: "/images/news/news1.png",
    link: "/help/category/announcements",
  },
  {
    title: "DeFi Security: Staying Safe in 2026",
    description: "Explore the latest DeFi security trends and practical tips to keep your assets secure.",
    date: "21 Dec 2025",
    category: "DeFi",
    image: "/images/news/news2.png",
    link: "/help/category/announcements",
  },
  {
    title: "GLD Launches New Trading Tools",
    description: "Advanced analytics and automation features to maximize trading performance.",
    date: "03 Jan 2026",
    category: "Platform",
    image: "/images/news/news3.png",
    link: "/help/category/announcements",
  },
];
