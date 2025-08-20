import React from 'react';
import { FaShieldAlt, FaGavel, FaUserShield, FaExclamationTriangle, FaClipboardCheck, FaEnvelope, FaClock } from 'react-icons/fa';

const Legal = () => {
  return (
    <div className="bg-black text-white min-h-screen">
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Legal <span className="text-[#F88726]">Information</span></h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive legal framework and regulatory compliance for our cryptocurrency exchange
            </p>
          </div>
        </div>
      </section>

      {/* Legal Content Sections */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl space-y-16">
          
          {/* Licenses and Regulatory Compliance */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <FaShieldAlt className="text-[#F88726] text-3xl" />
                <h2 className="text-3xl font-bold">Licenses and <span className="text-[#F88726]">Regulatory Compliance</span></h2>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-lg">
                <p className="mb-6 text-lg text-gray-300">
                  KINE operates under strict regulatory oversight and maintains compliance with applicable laws and regulations in the jurisdictions where we provide services.
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-[#F88726] mt-1">•</span>
                    <span>Virtual Asset Service Provider (VASP) Registration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#F88726] mt-1">•</span>
                    <span>Anti-Money Laundering (AML) Compliance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#F88726] mt-1">•</span>
                    <span>Know Your Customer (KYC) Requirements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#F88726] mt-1">•</span>
                    <span>Financial Services Licensing where applicable</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Regulatory Framework */}
          <div className="flex flex-col md:flex-row-reverse gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <FaGavel className="text-[#F88726] text-3xl" />
                <h2 className="text-3xl font-bold">Regulatory <span className="text-[#F88726]">Framework</span></h2>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-lg">
                <p className="mb-6 text-lg text-gray-300">
                  Our operations are conducted in accordance with the regulatory requirements of the jurisdictions in which we operate, including:
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-[#F88726] mt-1">•</span>
                    <span>Compliance with local cryptocurrency and digital asset regulations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#F88726] mt-1">•</span>
                    <span>Adherence to financial services laws and regulations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#F88726] mt-1">•</span>
                    <span>Implementation of consumer protection measures</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#F88726] mt-1">•</span>
                    <span>Regular regulatory reporting and auditing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <FaClipboardCheck className="text-[#F88726] text-3xl" />
                <h2 className="text-3xl font-bold">Terms and <span className="text-[#F88726]">Conditions</span></h2>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-lg">
                <p className="mb-6 text-lg text-gray-300">
                  By using KINE's services, you agree to be bound by our comprehensive Terms and Conditions, which include:
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-[#F88726] mt-1">•</span>
                    <span>Service availability and limitations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#F88726] mt-1">•</span>
                    <span>User responsibilities and obligations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#F88726] mt-1">•</span>
                    <span>Trading rules and procedures</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#F88726] mt-1">•</span>
                    <span>Fee structures and payment terms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#F88726] mt-1">•</span>
                    <span>Risk disclosure and liability limitations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Privacy and Data Protection */}
          <div className="flex flex-col md:flex-row-reverse gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <FaUserShield className="text-[#F88726] text-3xl" />
                <h2 className="text-3xl font-bold">Privacy and <span className="text-[#F88726]">Data Protection</span></h2>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-lg">
                <p className="mb-6 text-lg text-gray-300">
                  KINE is committed to protecting your privacy and personal data in accordance with applicable privacy laws:
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-[#F88726] mt-1">•</span>
                    <span>GDPR compliance for European users</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#F88726] mt-1">•</span>
                    <span>Secure data storage and encryption</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#F88726] mt-1">•</span>
                    <span>Limited data collection and processing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#F88726] mt-1">•</span>
                    <span>User rights regarding personal data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#F88726] mt-1">•</span>
                    <span>Regular privacy policy updates</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Risk Disclosure - Special Warning Section */}
          <div className="bg-gradient-to-r from-yellow-900/20 to-red-900/20 border border-yellow-600/50 p-8 rounded-lg">
            <div className="flex items-center gap-4 mb-6">
              <FaExclamationTriangle className="text-yellow-500 text-4xl" />
              <h2 className="text-3xl font-bold text-yellow-400">Important Risk Disclosure</h2>
            </div>
            <div className="space-y-6">
              <p className="text-xl font-semibold text-yellow-300">
                ⚠️ Trading in cryptocurrencies involves substantial risk
              </p>
              <p className="text-lg text-gray-300">
                Trading in cryptocurrencies and digital assets involves substantial risk of loss and may not be suitable for all investors. Key risks include:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-red-900/20 border border-red-700/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-400 mb-2">Market Risks</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• High volatility and price fluctuations</li>
                    <li>• Potential total loss of invested capital</li>
                    <li>• Liquidity risks in certain market conditions</li>
                  </ul>
                </div>
                <div className="bg-orange-900/20 border border-orange-700/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-400 mb-2">Regulatory & Technical Risks</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Regulatory changes affecting market access</li>
                    <li>• Technology risks and security vulnerabilities</li>
                    <li>• Network congestion and transaction delays</li>
                  </ul>
                </div>
              </div>
              <p className="text-lg font-semibold text-yellow-400 bg-yellow-900/20 p-4 rounded-lg border border-yellow-600/50">
                Please ensure you understand these risks and only invest what you can afford to lose.
              </p>
            </div>
          </div>

          {/* Contact and Support */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-lg">
              <div className="flex items-center gap-4 mb-6">
                <FaEnvelope className="text-[#F88726] text-2xl" />
                <h3 className="text-2xl font-bold">Legal <span className="text-[#F88726]">Contact</span></h3>
              </div>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-center gap-3">
                  <span className="text-[#F88726]">•</span>
                  <div>
                    <strong>Legal Department:</strong><br/>
                    <a href="mailto:legal@kinecoin.co" className="text-[#F88726] hover:underline">legal@kinecoin.co</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#F88726]">•</span>
                  <div>
                    <strong>Compliance Team:</strong><br/>
                    <a href="mailto:compliance@kinecoin.co" className="text-[#F88726] hover:underline">compliance@kinecoin.co</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#F88726]">•</span>
                  <div>
                    <strong>General Support:</strong><br/>
                    <a href="mailto:support@kinecoin.co" className="text-[#F88726] hover:underline">support@kinecoin.co</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-lg">
              <div className="flex items-center gap-4 mb-6">
                <FaClock className="text-[#F88726] text-2xl" />
                <h3 className="text-2xl font-bold">Legal <span className="text-[#F88726]">Updates</span></h3>
              </div>
              <div className="space-y-4 text-gray-300">
                <p>
                  This legal information page is subject to periodic updates to reflect changes in our regulatory status, licensing, and compliance requirements.
                </p>
                <p>
                  We recommend reviewing this page regularly for the most current information.
                </p>
                <div className="bg-[#F88726]/10 border border-[#F88726]/30 p-4 rounded-lg mt-4">
                  <p className="text-[#F88726] font-semibold">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Questions About Our <span className="text-[#F88726]">Legal Framework?</span></h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Our legal and compliance teams are here to help. Contact us for any questions regarding our regulatory status, licensing, or legal compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:legal@kinecoin.co" className="bg-[#F88726] hover:bg-[#e56800] text-white font-bold py-3 px-8 rounded-full text-lg transition-colors">
              Contact Legal Team
            </a>
            <a href="/terms-condtions" className="bg-transparent border border-[#F88726] hover:bg-[#F88726]/10 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors">
              View Terms & Conditions
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Legal;