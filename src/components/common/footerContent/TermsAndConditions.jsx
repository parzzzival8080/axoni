import React, { useState, useEffect } from 'react';
import { ChevronRight, Share2, Facebook, Twitter, Linkedin, Send, Link, Eye, Shield, AlertTriangle, FileText, Scale, Globe } from 'lucide-react';

const TermsAndConditions = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [showMobileTOC, setShowMobileTOC] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['introduction', 'special-reminder', 'definitions', 'compliance', 'trading', 'services', 'intellectual-property', 'privacy', 'liability', 'indemnification', 'governing-law', 'changes'];
      
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 150 && rect.bottom >= 150;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tableOfContents = [
    { id: 'introduction', title: 'INTRODUCTION', number: '1.' },
    { id: 'special-reminder', title: 'SPECIAL REMINDER', number: '2.' },
    { id: 'definitions', title: 'DEFINITION OF TERMS', number: '3.' },
    { id: 'compliance', title: 'COMPLIANCE WITH BOT AND AUTOMATED TRADING RESTRICTIONS', number: '4.' },
    { id: 'trading', title: 'CRYPTOCURRENCY TRADING', number: '5.' },
    { id: 'services', title: 'COINCHICOIN AND SERVICES', number: '6.' },
    { id: 'intellectual-property', title: 'INTELLECTUAL PROPERTY', number: '7.' },
    { id: 'privacy', title: 'PRIVACY POLICY', number: '8.' },
    { id: 'liability', title: 'LIMITATION OF LIABILITY', number: '9.' },
    { id: 'indemnification', title: 'INDEMNIFICATION', number: '10.' },
    { id: 'governing-law', title: 'GOVERNING LAW AND DISPUTE RESOLUTION', number: '11.' },
    { id: 'changes', title: 'CHANGES TO TERMS', number: '12.' }
  ];

  const SocialButton = ({ icon: Icon, label }) => (
    <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
      <Icon className="w-4 h-4 text-gray-600" />
    </button>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <span className="hover:text-gray-700 cursor-pointer">Support center</span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-gray-700 cursor-pointer">Terms of agreement</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Article</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex xl:gap-12">
          {/* Main Content */}
          <div className="flex-1 w-full xl:max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-black mb-6">Terms of Service</h1>
              <p className="text-gray-500 text-sm mb-6">Published on January 01, 2024</p>
              
              {/* Mobile Table of Contents Toggle */}
              <div className="xl:hidden mb-6">
                <button
                  onClick={() => setShowMobileTOC(!showMobileTOC)}
                  className="w-full bg-gray-100 hover:bg-gray-200 p-3 rounded-lg flex items-center justify-between transition-colors"
                >
                  <span className="font-medium text-gray-900">Table of Contents</span>
                  <ChevronRight className={`w-5 h-5 text-gray-600 transform transition-transform ${showMobileTOC ? 'rotate-90' : ''}`} />
                </button>
                
                {showMobileTOC && (
                  <div className="mt-3 bg-white border border-gray-200 rounded-lg p-4">
                    <nav className="flex flex-col space-y-1">
                      {tableOfContents.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            scrollToSection(item.id);
                            setShowMobileTOC(false);
                          }}
                          className={`w-full text-left p-2 rounded text-sm transition-colors ${
                            activeSection === item.id
                              ? 'bg-blue-50 text-[#014EB2] font-medium'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start w-full">
                            <span className="font-medium mr-2 flex-shrink-0 min-w-[1.2rem]">{item.number}</span>
                            <span className="leading-tight break-words flex-1">{item.title}</span>
                          </div>
                        </button>
                      ))}
                    </nav>
                  </div>
                )}
              </div>
              
              {/* Social Share Buttons */}
              {/* <div className="flex items-center space-x-3 mb-8 overflow-x-auto">
                <SocialButton icon={Twitter} label="Twitter" />
                <SocialButton icon={Facebook} label="Facebook" />
                <SocialButton icon={Linkedin} label="LinkedIn" />
                <SocialButton icon={Send} label="Telegram" />
                <SocialButton icon={Link} label="Copy Link" />
              </div> */}
            </div>

            {/* Content Sections */}
            <div className="space-y-8 sm:space-y-12">
              <section id="introduction">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">1. INTRODUCTION</h2>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                    <p>Welcome to COINCHIcoin ("Exchange," "We," "Us," or "Our"). By using our website and services, you agree to be bound by these Terms of Service ("Terms"). 
                        Please read them carefully before accessing or using our platform. If you do not agree with any part of these Terms, you should not use our services.
                    </p>
                </div>
              </section>

              <section id="special-reminder">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">2. SPECIAL REMINDER</h2>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 sm:p-6 mb-6">
                      <div className="flex items-start">
                        <AlertTriangle className="w-6 h-6 text-amber-600 mr-3 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-amber-800 mb-2">High Risk Warning</h4>
                          <p className="text-amber-700 text-sm">
                            Digital currency transactions have extremely high risks. Please read this section carefully.
                          </p>
                        </div>
                      </div>
                    </div>
                    <p>
                        Digital currency transactions have extremely high risks. The digital currency market is brand new, unconfirmed, and may not grow. At present, digital currency is mainly used by
                        speculators and relatively few in retail and commercial markets. Therefore, the price of digital currency is prone to volatility, which may adversely affect digital currency investment. 
                        The digital currency market does not have a limit on the ups and downs of the Chinese stock market, and trading is open 24 hours a day. Due to the small number of chips, the price of digital 
                        currency is easily controlled by the dealer, and the price may rise several times a day. At the same time, the price may fall by half within a day. To participate in digital currency transactions, 
                        users should control their own risks, assess the value of digital currency investment and investment risks, and bear the economic risk of losing all investments. Due to the formulation or modification 
                        of national laws, regulations, and regulatory documents, the transaction of digital currency may be suspended or prohibited, and the resulting economic losses are all borne by the user.
                    </p>
                </div>
              </section>

              <section id="definitions">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">3. DEFINITION OF TERMS</h2>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  <ul className="space-y-4">
                    <li>
                        <strong>Account:</strong> means a unique account created for You to access our Service or parts of our Service. Any duplication of accounts, upon getting caught, may result in account banning and/or penalties. 
                        We have a strict rule that every person may only have one account on the platform.
                    </li>
                    <li>
                        <strong>Affiliate:</strong> means an entity that controls, is controlled by, or is under common control with a party, where 'control' means ownership of 50% or more of the shares, equity interest, or other securities 
                        entitled to vote for election of directors or other managing authority.
                    </li>
                    <li>
                        <strong>Application:</strong> means the software program provided by the Company downloaded by You on any electronic device, named COINCHIcoin Company (referred to as either 'the Company,' 'we,' 'Us,' or 'Our' in this Agreement)
                         refers to COINCHIcoin.
                    </li>
                    <li>
                        <strong>Country:</strong> refers to: California, United States.
                    </li>
                    <li><strong>Device:</strong> means any device that can access the Service such as a computer, cellphone, or digital tablet.</li>
                    <li><strong>Personal Data:</strong> is any information that relates to an identified or identifiable individual.</li>
                    <li><strong>Service:</strong> refers to the Application.</li>
                    <li> 
                        <strong>Service Provider:</strong> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service,
                         provide the Service on behalf of the Company, perform services related to the Service, or assist the Company in analyzing how the Service is used.
                    </li>
                     <li> 
                        <strong>Third-party Social Media Service:</strong> refers to any website or any social network website through which a User can log in or create an account to use the Service.
                    </li>
                    <li> 
                        <strong>Usage Data:</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).
                    </li>
                    <li> 
                        <strong>You:</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.
                    </li>
                  </ul>
                </div>
              </section>

              <section id="compliance">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">4. COMPREHENSIVE TERMS OF SERVICE: COMPLIANCE WITH BOT AND AUTOMATED TRADING RESTRICTIONS</h2>
                <div className="space-y-6 text-gray-800 leading-relaxed">
                  <p>
                    The Terms of Service (ToS) for trading platforms establish the rules and responsibilities of users to ensure fair, lawful, and secure operations. 
                    These rules include strict prohibitions on using unauthorized bots or automated trading systems, with compliance essential for avoiding penalties under platform policies 
                    and federal regulations, including those enforced by the U.S. Securities and Exchange Commission (SEC).
                  </p>
                  
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-black mb-3">Use of Services</h3>
                    <ul className="space-y-2">
                      <li>
                          <strong>Eligibility:</strong> You must be at least 18 years old and have the legal capacity to enter into contracts to use our services.
                      </li>
                      <li>
                          <strong>Account:</strong> To use certain features of our platform, you may need to create an account. You are responsible for maintaining the confidentiality 
                          of your account credentials and for any activities that occur under your account.
                      </li>
                      <li>
                          <strong>Prohibited Activities:</strong> You agree not to engage in any illegal, fraudulent, or unauthorized activities while using our platform. This includes, but is not limited to, 
                          unauthorized access to accounts, market manipulation, money laundering, or any other activities that violate applicable laws and regulations.
                      </li>
                      <li>
                          <strong>Compliance and Security:</strong> Ensure your account complies with our terms of service, particularly regarding the use of bots or automated trading systems, which may conflict with 
                          regular trader activities.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-black mb-3">Definition of Bots and Automated Trading Systems</h3>
                    <ul className="space-y-2">
                      <li>
                          <strong>Bots:</strong> Software programs or scripts automating trades, market monitoring, or strategy execution without direct user intervention.
                      </li>
                      <li>
                          <strong>Automated Trading Systems:</strong> Algorithms analyzing data and executing pre-set strategies, often operating at high frequency or with significant market impact.
                      </li>
                    </ul>
                    <p className="mt-2">
                      Although regulated systems (e.g., institutional high-frequency trading) are permissible, unauthorized use by individuals is prohibited to maintain fairness.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-black mb-3">Key Provisions on Prohibited Activities</h3>
                    <p>Prohibited actions include:</p>
                    <ul className="space-y-2 mt-2">
                      <li>• Automated placement, cancellation, or modification of orders.</li>
                      <li>• Trading based on scraped platform data.</li>
                      <li>• Mimicking human activity to bypass detection mechanisms.</li>
                    </ul>
                    <p className="mt-2">These actions contravene principles of fair use and can distort market integrity.</p>
                    <p className="mt-2"><strong>Fair Use Violations:</strong> Bots creating an unfair advantage by exploiting market inefficiencies undermine equitable trading access.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-black mb-3">Implications Under SEC Regulations</h3>
                    <ul className="space-y-2">
                      <li>
                          <strong>Market Manipulation:</strong> Practices like spoofing (placing fake orders to manipulate prices) or layering (sending false supply/demand signals) are violations of federal securities laws.
                      </li>
                      <li>
                         <strong>Insider Trading:</strong> Bots exploiting non-public, material information breach insider trading regulations.
                      </li>
                      <li>
                         <strong>Fraudulent Activity:</strong> Use of bots for deceptive practices violates securities fraud provisions.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-black mb-3">Penalties for Violations</h3>
                    <ul className="space-y-2">
                      <li>• Fines and financial penalties.</li>
                      <li>• Suspension or permanent account bans.</li>
                      <li>• Criminal charges, including imprisonment, for severe offenses.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-black mb-3">Platform Enforcement Measures</h3>
                    <p>To ensure compliance and security, platforms employ:</p>
                    <ul className="space-y-2 mt-2">
                      <li>
                          <strong>Monitoring Algorithms:</strong> Sophisticated systems track unusual patterns (e.g., rapid trade executions, anomalous orders).
                      </li>
                      <li>
                         <strong>Account Audits:</strong> Users may be required to provide proof of manual trading when suspicious activity is detected.
                      </li>
                      <li>
                        <strong>Legal Reporting:</strong> Violations may be reported to the SEC or equivalent regulatory bodies for further action.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="trading">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">5. CRYPTOCURRENCY TRADING</h2>
                 <div className="space-y-4 text-gray-800 leading-relaxed">
                  <ul className="space-y-3">
                    <li>
                        <strong>Risks:</strong> COINCHIcoin trading involves significant risks, and the value of COINCHIcoin and other cryptocurrencies can be highly volatile. 
                        You acknowledge and understand the risks associated with trading digital assets.
                    </li>
                    <li>
                        <strong>Investment Advice:</strong> Our platform does not provide investment advice. You should conduct your research and seek advice from a qualified
                         financial advisor before making any trading decisions.
                    </li>
                    <li>
                        <strong>Fees:</strong> Fees and charges related to COINCHIcoin trading are outlined in a separate fee schedule available on our website.
                    </li>
                  </ul>
                </div>
              </section>

              <section id="services">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">6. COINCHICOIN AND SERVICES</h2>
                 <div className="space-y-4 text-gray-800 leading-relaxed">
                  <ul className="space-y-3">
                    <li>
                        <strong>Availability:</strong> We will make reasonable efforts to ensure the availability of COINCHIcoin and a wide range of services on our platform. 
                        However, we do not guarantee the availability of COINCHIcoin or specific services.
                    </li>
                    <li>
                        <strong>Modifications:</strong> We reserve the right to modify or discontinue COINCHIcoin or any services at any time without prior notice.
                    </li>
                  </ul>
                </div>
              </section>

              <section id="intellectual-property">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">7. INTELLECTUAL PROPERTY</h2>
                 <div className="space-y-4 text-gray-800 leading-relaxed">
                  <ul className="space-y-3">
                    <li>
                        <strong>Ownership:</strong> All content and materials on our platform, including logos, trademarks, graphics, and software, are the property of 
                        COINCHIcoin and are protected by intellectual property laws.
                    </li>
                    <li>
                        <strong>Limited License:</strong> You are granted a limited, non-exclusive, non-transferable license to access and use our platform for personal, non-commercial purposes.
                    </li>
                  </ul>
                </div>
              </section>

              <section id="privacy">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">8. PRIVACY POLICY</h2>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  <p>Please refer to our Privacy Policy, which outlines how we collect, use, and protect your personal information.</p>
                </div>
              </section>

              <section id="liability">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">9. LIMITATION OF LIABILITY</h2>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  <ul className="space-y-3">
                    <li>
                        <strong>No Liability for Losses:</strong> We are not responsible for any losses or damages resulting from your use of our platform or any actions 
                        taken based on the information available on our platform.
                    </li>
                    <li>
                        <strong>Third-Party Services:</strong> We are not liable for any third-party services or products you may access through our platform.
                    </li>
                  </ul>
                </div>
              </section>

              <section id="indemnification">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">10. INDEMNIFICATION</h2>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  <p>You agree to indemnify and hold COINCHIcoin, its affiliates, and their respective officers, directors, employees, and agents harmless from and against any claims, liabilities, damages, losses, and expenses arising from your use of our platform.</p>
                </div>
              </section>

              <section id="governing-law">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">11. GOVERNING LAW AND DISPUTE RESOLUTION</h2>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of California, United States. Any disputes arising out of or relating to these Terms
                     shall be resolved through arbitration in accordance with the rules of the American Arbitration Association, held in California, with each party bearing its own costs.
                  </p>
                </div>
              </section>

              <section id="changes">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">12. CHANGES TO TERMS</h2>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  <p>
                    We may update or modify these Terms at any time. Any changes will be posted on our website, and your continued use of our platform after the 
                    changes constitute your acceptance of the modified Terms.
                  </p>
                </div>
              </section>
            </div>

            {/* Contact Information */}
            <div className="mt-16 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-black mb-3">Questions About These Terms?</h3>
              <p className="text-gray-700 mb-3">
                If you have any questions about these Terms of Service, please contact our support team.
              </p>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Email: legal@coinchi.co</p>
                <p>Support Center: Available 24/7</p>
              </div>
            </div>
          </div>

          {/* Table of Contents Sidebar - Hidden on mobile and tablet */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Table of Contents</h3>
                <nav className="flex flex-col">
                  {tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left py-1.5 px-2 rounded text-sm transition-colors block ${
                        activeSection === item.id
                          ? 'bg-blue-50 text-[#014EB2] font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start w-full">
                        <span className="font-medium mr-2 flex-shrink-0 min-w-[1.2rem]">{item.number}</span>
                        <span className="leading-tight break-words flex-1">{item.title}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;