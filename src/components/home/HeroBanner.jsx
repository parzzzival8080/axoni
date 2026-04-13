import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { heroBanners } from "../../config/homepageImages";

const AUTO_PLAY_INTERVAL = 6000;

const HeroBanner = ({ isLoggedIn = false }) => {
  const [current, setCurrent] = useState(0);
  const banners = heroBanners;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  if (!banners.length) return null;

  const banner = banners[current];

  const bgStyle = banner.image
    ? { backgroundImage: `url(${banner.image})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: banner.gradient || "linear-gradient(135deg, #1E1E1E 0%, #121212 100%)" };

  return (
    <div className="relative w-full overflow-hidden group" style={{ minHeight: 360 }}>
      {/* Background */}
      <div className="absolute inset-0 transition-all duration-1000 ease-in-out" style={bgStyle} />

      {/* Glow effects */}
      <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-[#2EBD85]/[0.04] rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#2EBD85]/[0.03] rounded-full blur-[120px]" />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      {banner.image && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/60 to-transparent" />
      )}

      {/* Content */}
      <div className="relative z-10 h-full container mx-auto px-4 sm:px-8 md:px-16 lg:px-24 flex items-center" style={{ minHeight: 360 }}>
        <div className="flex items-center justify-between w-full gap-12">
          {/* Left — Main content */}
          <div className="flex-1 max-w-xl">
            {banners.length > 1 && (
              <div className="flex items-center gap-2 mb-6">
                {banners.map((b, i) => (
                  <button
                    key={b.id}
                    onClick={() => setCurrent(i)}
                    className={`text-xs font-medium px-3 py-1 rounded-full transition-all duration-300 ${
                      i === current
                        ? "bg-[#2EBD85] text-white"
                        : "bg-white/5 text-[#5E6673] hover:bg-white/10 hover:text-[#848E9C]"
                    }`}
                  >
                    {b.tag || `0${i + 1}`}
                  </button>
                ))}
              </div>
            )}

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-[1.1]">
              {banner.title}
            </h1>
            <p className="text-[#848E9C] text-base lg:text-lg mb-8 leading-relaxed max-w-md">
              {banner.subtitle}
            </p>

            {/* CTA — signup for guests, trade button for logged in */}
            {!isLoggedIn ? (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Email / Phone number"
                  aria-label="Email or phone number"
                  className="bg-white/5 border border-[#2A2A2A] text-white placeholder-[#5E6673] px-5 py-3 rounded-xl text-sm w-64 focus:outline-none focus:border-[#2EBD85] transition-colors backdrop-blur-sm"
                />
                <Link
                  to="/signup"
                  className="bg-[#2EBD85] hover:bg-[#259A6C] text-white px-7 py-3 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <Link
                to={banner.link}
                className="inline-flex items-center gap-2 bg-[#2EBD85] hover:bg-[#259A6C] text-white px-7 py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                {banner.cta}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            )}

            {!isLoggedIn && (
              <p className="text-[#5E6673] text-xs mt-3">
                Sign up to receive up to <span className="text-[#2EBD85]">$2,000</span> in rewards
              </p>
            )}
          </div>

          {/* Right — Stats card */}
          <div className="hidden lg:flex flex-col gap-3 w-72">
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#2EBD85] animate-pulse" />
                <span className="text-[#848E9C] text-xs font-medium">Live Market</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">BTC/USDT</span>
                  <span className="text-[#2EBD85] text-xs font-medium">+2.34%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">ETH/USDT</span>
                  <span className="text-[#F6465D] text-xs font-medium">-1.12%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-medium">SOL/USDT</span>
                  <span className="text-[#2EBD85] text-xs font-medium">+5.67%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 text-center">
                <p className="text-xl font-bold text-white">500+</p>
                <p className="text-[#5E6673] text-[10px] mt-0.5">Trading Pairs</p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4 text-center">
                <p className="text-xl font-bold text-white">&lt;10ms</p>
                <p className="text-[#5E6673] text-[10px] mt-0.5">Execution</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#121212] to-transparent" />

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white/10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white/10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </>
      )}
    </div>
  );
};

export default HeroBanner;
