import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaGlobe, FaUsers, FaChartLine, FaHandshake } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="bg-[#0a0a0a] text-white">

      {/* Hero */}
      <section className="py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
                About <span className="text-[#2EBD85]">GLD</span>
              </h1>
              <p className="text-[#848E9C] text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                Your trusted partner in the world of cryptocurrency trading and investment. We're building the future of finance.
              </p>
              <Link to="/signup" className="inline-flex bg-white hover:bg-gray-100 text-black px-8 py-3.5 rounded-full text-sm font-semibold transition-colors">
                Get started
              </Link>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-[#2EBD85]/10 flex items-center justify-center">
                <FaChartLine className="text-[#2EBD85] w-20 h-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission — left text, right visual */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row gap-12 md:gap-20">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">Our Mission</h2>
              <p className="text-[#848E9C] text-base leading-relaxed mb-5">
                At GLD, we're on a mission to make cryptocurrency trading accessible, secure, and efficient for everyone. We believe in the transformative power of blockchain technology.
              </p>
              <p className="text-[#848E9C] text-base leading-relaxed">
                Our platform is designed with both beginners and experienced traders in mind, offering intuitive tools and advanced trading features.
              </p>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-6 text-center">
                  <p className="text-2xl md:text-3xl font-bold text-white mb-1">3M+</p>
                  <p className="text-[#5E6673] text-xs">Global users</p>
                </div>
                <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-6 text-center">
                  <p className="text-2xl md:text-3xl font-bold text-white mb-1">50+</p>
                  <p className="text-[#5E6673] text-xs">Trading pairs</p>
                </div>
                <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-6 text-center">
                  <p className="text-2xl md:text-3xl font-bold text-white mb-1">$2B+</p>
                  <p className="text-[#5E6673] text-xs">24h volume</p>
                </div>
                <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-6 text-center">
                  <p className="text-2xl md:text-3xl font-bold text-[#2EBD85] mb-1">99.9%</p>
                  <p className="text-[#5E6673] text-xs">Uptime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values — centered heading, 3 cards */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-16 tracking-tight">Our Values</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <FaShieldAlt className="text-[#2EBD85] text-2xl" />, title: "Security First", desc: "Industry-leading security measures to protect your assets with regular audits and continuous monitoring." },
              { icon: <FaUsers className="text-[#2EBD85] text-2xl" />, title: "User-Centric", desc: "Designed with you in mind. We continuously improve based on feedback to create the best trading experience." },
              { icon: <FaHandshake className="text-[#2EBD85] text-2xl" />, title: "Transparency", desc: "Full transparency in all operations, from fee structures to platform performance and security practices." },
            ].map((v) => (
              <div key={v.title} className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-8 text-center hover:border-[#2EBD85]/20 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#2EBD85]/10 flex items-center justify-center mx-auto mb-5">
                  {v.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{v.title}</h3>
                <p className="text-[#848E9C] text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Presence — left text, right icon */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">Global Presence</h2>
              <p className="text-[#848E9C] text-base leading-relaxed mb-5">
                GLD operates globally with a presence in major financial hubs across Asia, Europe, and the Americas. Our team works around the clock providing 24/7 support.
              </p>
              <p className="text-[#848E9C] text-base leading-relaxed">
                We comply with regulatory requirements in all jurisdictions, maintaining the highest standards of legal compliance and user protection.
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-[#2EBD85]/5 flex items-center justify-center">
                <FaGlobe className="text-[#2EBD85]/40 w-32 h-32" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 tracking-tight">Start trading today</h2>
          <p className="text-[#848E9C] text-base md:text-lg max-w-xl mx-auto mb-10">
            Join millions of traders on GLD. Sign up and experience the next generation of cryptocurrency trading.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/signup" className="bg-white hover:bg-gray-100 text-black px-8 py-3.5 rounded-full text-sm font-semibold transition-colors">
              Sign up
            </Link>
            <Link to="/spot-trading" className="bg-[#1E1E1E] hover:bg-[#252525] border border-[#2A2A2A] text-white px-8 py-3.5 rounded-full text-sm font-medium transition-colors">
              Trade now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
