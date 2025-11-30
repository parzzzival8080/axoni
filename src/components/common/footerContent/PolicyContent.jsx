import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Send,
  Link,
  Eye,
  Shield,
  AlertTriangle,
  FileText,
  Scale,
  Globe,
} from "lucide-react";

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const [showMobileTOC, setShowMobileTOC] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "introduction",
        "scope",
        "information-use",
        "information-storage",
        "cookies",
        "security",
        "data-protection",
        "disclaimer",
      ];

      const currentSection = sections.find((section) => {
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tableOfContents = [
    {
      id: "introduction",
      title: "PRIVACY AGREEMENT AND DISCLAIMER",
      number: "1.",
    },
    { id: "scope", title: "SCOPE OF APPLICATION", number: "2." },
    { id: "information-use", title: "INFORMATION USE", number: "3." },
    {
      id: "information-storage",
      title: "INFORMATION STORAGE AND EXCHANGE",
      number: "4.",
    },
    { id: "cookies", title: "USE OF COOKIES", number: "5." },
    { id: "indemnification", title: "INDEMNIFICATION", number: "6." },
    { id: "security", title: "INFORMATION SECURITY", number: "7." },
    {
      id: "data-protection",
      title: "PROTECTION OF PERSONAL DATA",
      number: "8.",
    },
    { id: "disclaimer", title: "DISCLAIMER", number: "9." },
    {
      id: "withdrawal",
      title: "ACCOUNT TIERS AND CORRESPONDING LIMITS",
      number: "10.",
    },
  ];

  //   const SocialButton = ({ icon: Icon, label }) => (
  //     <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
  //       <Icon className="w-4 h-4 text-gray-600" />
  //     </button>
  //   );

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <span className="hover:text-gray-700 cursor-pointer">
            Support center
          </span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-gray-700 cursor-pointer">
            Privacy agreement
          </span>
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
              <h1 className="text-3xl sm:text-4xl font-bold text-black mb-6">
                Privacy Policy
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                Published on January 01, 2024
              </p>

              {/* Mobile Table of Contents Toggle */}
              <div className="xl:hidden mb-6">
                <button
                  onClick={() => setShowMobileTOC(!showMobileTOC)}
                  className="w-full bg-gray-100 hover:bg-gray-200 p-3 rounded-lg flex items-center justify-between transition-colors"
                >
                  <span className="font-medium text-gray-900">
                    Table of Contents
                  </span>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-600 transform transition-transform ${
                      showMobileTOC ? "rotate-90" : ""
                    }`}
                  />
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
                              ? "bg-yellow-50 text-[#F0B90B] font-medium"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start w-full">
                            <span className="font-medium mr-2 flex-shrink-0 min-w-[1.2rem]">
                              {item.number}
                            </span>
                            <span className="leading-tight break-words flex-1">
                              {item.title}
                            </span>
                          </div>
                        </button>
                      ))}
                    </nav>
                  </div>
                )}
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-8 sm:space-y-12">
              <section id="introduction">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">
                  1. PRIVACY AGREEMENT AND DISCLAIMER
                </h2>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  <p>
                    The platform (hereinafter referred to as the 'platform') is
                    committed to respecting and protecting the personal privacy
                    of all users who utilize its network services. To deliver
                    more accurate and personalized services, the platform will
                    use and disclose your personal information in accordance
                    with this privacy policy. The platform's products and
                    services encompass, but are not limited to, its website,
                    mobile application, offline events, and data and information
                    services. We are dedicated to implementing robust measures
                    to safeguard our users' privacy.
                  </p>
                  <p>
                    By agreeing to the platform's network service use agreement,
                    you are considered to have accepted the entirety of this
                    privacy policy, which is an integral part of the service use
                    agreement. Please be aware that the platform periodically
                    reviews its privacy practices, and changes may occur as a
                    result. We encourage you to visit this page regularly to
                    stay informed about the latest version of our privacy
                    policy.
                  </p>
                </div>
              </section>

              <section id="scope">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">
                  2. SCOPE OF APPLICATION
                </h2>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  <ul className="space-y-3 ml-4 list-disc list-inside">
                    <li>
                      When you register for an account on the platform, you
                      provide personal information as required by the platform;
                    </li>
                    <li>
                      When you use the platform's network services or visit its
                      webpage, the platform automatically collects and records
                      information from your browser and computer. This includes,
                      but is not limited to, your IP address, browser type,
                      language preferences, date and time of your visit,
                      software and hardware details, and the web pages you
                      access;
                    </li>
                    <li>
                      The platform legally obtains user personal data from
                      business partners. You understand and agree that the
                      following information is not covered by this privacy
                      policy:
                      <ul className="space-y-2 ml-6 mt-3 list-disc list-inside">
                        <li>
                          Keywords you enter while using the platform's search
                          services;
                        </li>
                        <li>
                          Information and data you post on the platform,
                          including but not limited to forum posts;
                        </li>
                        <li>
                          Any information regarding violations of laws or
                          platform regulations and the actions the platform has
                          taken against you.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </section>

              <section id="information-use">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">
                  3. INFORMATION USE
                </h2>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  <p>
                    To better serve users, the platform may use your personal
                    information to provide you with content that interests you.
                    This includes, but is not limited to, sending you
                    information about products and services or sharing your
                    information with platform partners, so they can send you
                    information about their products and services (the latter
                    requires your prior consent).
                  </p>
                  <p>
                    The information you provide to the platform will be
                    collected, organized, and appropriately managed by the
                    platform. For instance, if the platform and partner
                    companies jointly offer services, the platform may need to
                    share user information with the partner company. The
                    platform will ensure that partner companies protect user
                    information in accordance with this policy.
                  </p>
                </div>
              </section>

              <section id="information-storage">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">
                  4. INFORMATION STORAGE AND EXCHANGE
                </h2>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  <p>
                    The information and data collected by the platform about you
                    will be stored on the servers of the platform and/or its
                    affiliates. This information and data may be transmitted to,
                    accessed, stored, and displayed in your country or region,
                    or in the location where the platform collects the
                    information, including locations abroad.
                  </p>
                </div>
              </section>

              <section id="cookies">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">
                  5. USE OF COOKIES
                </h2>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  <p>
                    If you do not decline Cookies, the platform will set or
                    access Cookies on your computer to enable you to log in or
                    use platform services or features that rely on Cookies. By
                    using Cookies, the platform can provide you with more
                    thoughtful and personalized services, including promotional
                    services.
                  </p>
                  <p>
                    You have the right to accept or decline Cookies. You can
                    refuse Cookies by adjusting your browser settings. However,
                    if you choose to decline Cookies, you may not be able to log
                    in or use certain platform network services or functions
                    that rely on them.
                  </p>
                </div>
              </section>

              <section id="indemnification">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">
                  6. Indemnification
                </h2>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  <p>
                    You agree to indemnify and hold AXONI coin, its affiliates,
                    and their respective officers, directors, employees, and
                    agents harmless from and against any claims, liabilities,
                    damages, losses, and expenses arising from your use of our
                    platform.
                  </p>
                </div>
              </section>

              <section id="security">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">
                  7. INFORMATION SECURITY
                </h2>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  <p>
                    The platform account includes security protection features.
                    Please ensure you keep your username and password secure.
                    The platform uses security measures, such as password
                    encryption, to protect your information from being lost,
                    misused, or altered. However, please be aware that no
                    security measure on the information network is completely
                    foolproof.
                  </p>
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 sm:p-6 mb-6">
                    <div className="flex items-start">
                      <Shield className="w-6 h-6 text-amber-600 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-800 mb-2">
                          Security Notice
                        </h4>
                        <p className="text-amber-700 text-sm">
                          When using platform network services for online
                          transactions, ensure you protect your personal
                          information and only share it when absolutely
                          necessary.
                        </p>
                      </div>
                    </div>
                  </div>
                  <p>
                    The platform account includes security protection features.
                    Please ensure you keep your username and password secure.
                    The platform uses security measures, such as password
                    encryption, to protect your information from being lost,
                    misused, or altered. However, please be aware that no
                    security measure on the information network is completely
                    foolproof. When using platform network services for online
                    transactions, you may need to disclose personal information,
                    such as your contact details or postal address, to the other
                    party or potential other party. Ensure you protect your
                    personal information and only share it when absolutely
                    necessary. If you discover that your personal information,
                    especially your platform username and password, has been
                    compromised, please contact platform customer service
                    immediately so that appropriate actions can be taken.
                  </p>
                </div>
              </section>

              <section id="data-protection">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">
                  8. PROTECTION OF PERSONAL DATA
                </h2>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  <p>
                    We employ appropriate physical, electronic, managerial, and
                    technical measures to safeguard your personal information.
                    We strive to ensure that any personal information collected
                    through our website is protected from unauthorized third
                    parties. Our security measures include, but are not limited
                    to:
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-black mb-2">
                        Physical measures
                      </h4>
                      <p>
                        Records containing your personal information are stored
                        in a secure, locked location.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-black mb-2">
                        Electronic Measures
                      </h4>
                      <p>
                        Computer data containing your personal information are
                        stored on systems and storage media with strict login
                        restrictions.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-black mb-2">
                        Managerial Measures
                      </h4>
                      <p>
                        Only authorized personnel can access your personal data,
                        and they are required to adhere to our internal
                        confidentiality policies.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-black mb-2">
                        Technical Measures
                      </h4>
                      <p>
                        Encryption technologies, such as Secure Socket Layer
                        (SSL) encryption, may be used to transmit your personal
                        data.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-black mb-2">
                        Additional Measures
                      </h4>
                      <p> Our web server is protected by a firewall.</p>
                    </div>
                  </div>

                  <p>
                    If you become aware of any security vulnerabilities on our
                    website, please contact us immediately so we can take
                    appropriate action promptly.
                  </p>

                  <p>
                    Despite these technical and security measures, we cannot
                    guarantee the absolute security of information transmitted
                    over the Internet. Therefore, we cannot ensure that the
                    personal information you provide through our website will
                    always be secure. We are not liable for any incidents
                    resulting from unauthorized access to your personal data,
                    nor for any loss or damage incurred as a result.
                  </p>
                </div>
              </section>

              <section id="disclaimer">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">
                  9. DISCLAIMER
                </h2>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  <p>
                    You acknowledge and agree that, under any circumstances, we
                    shall not be held responsible for the following:
                  </p>

                  <ul className="space-y-2 ml-4">
                    <li>• Loss of income</li>
                    <li>• Loss of trading profits or contracts</li>
                    <li>• Business interruption</li>
                    <li>• Loss of expected currency savings</li>
                    <li>• Loss of information</li>
                    <li>• Loss of opportunities, goodwill, or reputation</li>
                    <li>• Damage or loss of data</li>
                    <li>
                      • Costs incurred from purchasing alternative products or
                      services
                    </li>
                    <li>
                      • Any indirect, special, or incidental losses or damages
                      resulting from infringement (including negligence), breach
                      of contract, or any other reason, regardless of whether
                      such losses or damages could have been reasonably foreseen
                      by us, and regardless of whether we were notified in
                      advance of the possibility of such losses or damages.
                    </li>
                  </ul>
                </div>
              </section>

              <section id="withdrawal">
                <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">
                  10. ACCOUNT TIERS AND CORRESPONDING LIMITS
                </h2>
                <div className="space-y-4 text-gray-800 leading-relaxed">
                  <p>
                    For newly created accounts, the maximum withdrawal amount is
                    limited to 500 USDT. This policy applies uniformly to all
                    new users to ensure a secure and consistent experience
                    across the platform. Users may increase their withdrawal
                    limits by availing the account tiering system, which
                    provides higher withdrawal thresholds according to the
                    selected tier level.{" "}
                  </p>

                  <ul className="space-y-2 ml-4">
                    <li>
                      • Bronze Tier: Recharge 10,000 USDT → Daily Limit: 5,000
                      USDT
                    </li>
                    <li>
                      • Silver Tier: Recharge 15,000 USDT → Daily Limit: 7,000
                      USDT
                    </li>
                    <li>
                      • Gold Tier: Recharge 20,000 USDT → Daily Limit: 10,000
                      USDT
                    </li>
                    <li>
                      • Diamond Tier: Recharge 25,000 USDT → Daily Limit: 12,000
                      USDT
                    </li>
                    <li>
                      • Platinum Tier: Recharge 30,000 USDT → Daily Limit:
                      15,000 USDT
                    </li>
                  </ul>
                </div>
              </section>
            </div>

            {/* Contact Information */}
            <div className="mt-16 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-black mb-3">
                Questions About This Privacy Policy?
              </h3>
              <p className="text-gray-700 mb-3">
                If you have any questions about this Privacy Policy, please
                contact our support team.
              </p>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Email: customerservice@axoni.co</p>
                <p>Support Center: Available 24/7</p>
              </div>
            </div>
          </div>

          {/* Table of Contents Sidebar - Hidden on mobile and tablet */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Table of Contents
                </h3>
                <nav className="flex flex-col">
                  {tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left py-1.5 px-2 rounded text-sm transition-colors block ${
                        activeSection === item.id
                          ? "bg-yellow-50 text-[#F0B90B] font-medium"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start w-full">
                        <span className="font-medium mr-2 flex-shrink-0 min-w-[1.2rem]">
                          {item.number}
                        </span>
                        <span className="leading-tight break-words flex-1">
                          {item.title}
                        </span>
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

export default PrivacyPolicy;
