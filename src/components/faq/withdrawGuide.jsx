import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Facebook, Linkedin, MessageCircle, Link2, ChevronRight } from 'lucide-react';

// Enhanced Image Component with Loading States
const ImageWithFallback = ({ src, alt, description, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Return null if no src - completely hide the component
  if (!src || src === '' || src === null || src === undefined) {
    return null;
  }

  return (
    <div className="my-8">
      {!imageError ? (
        <div className="rounded-lg overflow-hidden border border-gray-200">
          {imageLoading && (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6901]"></div>
            </div>
          )}
          <img 
            src={src} 
            alt={alt}
            className={`w-full h-auto object-cover ${imageLoading ? 'hidden' : ''} ${className}`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        </div>
      ) : (
        // Fallback placeholder for failed loads only
        <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center text-gray-500">
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-lg">Failed to load image</span>
            </div>
          </div>
        </div>
      )}
      {description && (
        <p className="mt-2 text-sm text-gray-600 text-center">{description}</p>
      )}
    </div>
  );
};

// FAQ Questions Data
const faqQuestions = [
  { id: 1, question: "How do I make a withdrawal?", slug: "how-to-make-withdrawal" },
  { id: 2, question: "Why have I still not received my withdrawal?", slug: "withdrawal-not-received" },
  { id: 3, question: "How do I select the correct network for my crypto withdrawals and deposits?", slug: "select-correct-network" },
  { id: 4, question: "Do I need to pay fees for deposit and withdrawal?", slug: "withdrawal-deposit-fees" },
];

// Article Data with Image Support
const articleData = {
  'how-to-make-withdrawal': {
    title: 'How do I make a withdrawal?',
    publishDate: 'Aug 15, 2023',
    updateDate: 'Apr 15, 2024',
    readTime: '5 min read',
    views: '8,245',
    breadcrumbs: ['Support center', 'FAQ', 'Deposit and withdrawal', 'Crypto withdrawal', 'Article'],
    sections: [
      {
        type: 'section',
        title: 'Getting Started with Withdrawals',
        steps: [
          {
            number: 1,
            content: 'Log in to your account at <strong>flux.com</strong>, go to the <strong class="text-black">Assets</strong>, and select <strong class="text-[#ff6901]">Withdrawal</strong>.'
          },
          {
            number: 2,
            content: 'In the <strong class="text-black">Select crypto</strong> dropdown, choose the cryptocurrency you want to withdraw.'
          }
        ],
        images: [
          {
            src: null, // Add your withdrawal step 1-2 image here
            alt: 'Screenshot showing crypto selection for withdrawal',
            description: 'Select the cryptocurrency you want to withdraw'
          }
        ],
        additionalSteps: [
          {
            number: 3,
            content: 'Choose your withdrawal method: <strong class="text-[#ff6901]">On-chain withdrawal</strong> (to external wallet) or <strong class="text-[#ff6901]">Internal withdrawal</strong> (to another Flux account).'
          },
          {
            number: 4,
            content: 'Select the appropriate <strong class="text-black">Network</strong> for your withdrawal. Make sure this matches the network supported by your destination wallet or exchange.'
          },
          {
            number: 5,
            content: 'Enter the destination <strong class="text-black">Address</strong> where you want to send your crypto. You can also select from your saved addresses using <strong class="text-[#ff6901]">Manage address book</strong>.'
          },
          {
            number: 6,
            content: 'Set the <strong class="text-black">withdrawal amount</strong>. You can see your available balance and use the <strong class="text-[#ff6901]">Max</strong> button to withdraw the maximum amount.'
          }
        ],
        additionalImages: [
          {
            src: null, // Add your withdrawal form image here
            alt: 'Withdrawal form showing network, address, and amount fields',
            description: 'Complete the withdrawal form with network, address, and amount details'
          }
        ],
        finalSteps: [
          {
            number: 7,
            content: 'Review the <strong class="text-black">Network fee</strong> and <strong class="text-black">Amount received</strong> details.'
          },
          {
            number: 8,
            content: 'Click <strong class="text-[#ff6901]">Next</strong> to proceed with your withdrawal.'
          },
          {
            number: 9,
            content: 'Complete any required security verification (2FA, email confirmation, etc.) to finalize your withdrawal.'
          }
        ]
      }
    ],
    notes: [
      'Always double-check the destination address and network before confirming your withdrawal. Sending to the wrong address or network may result in permanent loss of funds.',
      'Network fees are automatically calculated and deducted from your withdrawal amount.',
      'Withdrawal processing times vary by network and can take from a few minutes to several hours.',
      'Some cryptocurrencies require a minimum withdrawal amount. Check the details before proceeding.',
      'For large withdrawals, additional security verification may be required.'
    ],
    disclaimer: 'This content is provided for informational purposes only and may cover products that are not available in your region. It is not intended to provide (i) investment advice or an investment recommendation; (ii) an offer or solicitation to buy, sell, or hold digital assets, or (iii) financial, accounting, legal, or tax advice. Digital asset holdings, including stablecoins and NFTs, involve substantial risk and may fluctuate significantly, leading to reduced value or complete loss. You should carefully consider whether trading or holding digital assets is suitable for you in light of your financial condition. Please consult your legal/tax/investment professional for questions about your specific circumstances.'
  },
  'withdrawal-not-received': {
    title: 'Why have I still not received my withdrawal?',
    publishDate: 'Sep 10, 2023',
    updateDate: 'May 20, 2024',
    readTime: '4 min read',
    views: '5,892',
    breadcrumbs: ['Support center', 'FAQ', 'Deposit and withdrawal', 'Crypto withdrawal', 'Article'],
    sections: [
      {
        type: 'section',
        title: 'Common Reasons for Delayed Withdrawals',
        steps: [
          {
            number: 1,
            content: 'Check the <strong class="text-[#ff6901]">network confirmation status</strong>. Different networks require different numbers of confirmations before the transaction is considered complete.'
          },
          {
            number: 2,
            content: 'Verify that you sent to the correct <strong class="text-[#ff6901]">network</strong>. Sending to the wrong network is a common cause of delays or lost funds.'
          },
          {
            number: 3,
            content: 'Check for <strong class="text-[#ff6901]">network congestion</strong>. During high traffic periods, transactions may take longer than usual to process.'
          },
          {
            number: 4,
            content: 'Review your <strong class="text-[#ff6901]">destination wallet</strong> settings. Some wallets or exchanges may have additional processing times.'
          }
        ]
      },
      {
        type: 'section',
        title: 'Steps to Track Your Withdrawal',
        steps: [
          {
            number: 1,
            content: 'Go to <strong class="text-[#ff6901]">Assets</strong> > <strong class="text-[#ff6901]">Transaction History</strong> to view your withdrawal status.'
          },
          {
            number: 2,
            content: 'Copy the <strong class="text-[#ff6901]">Transaction Hash (TXID)</strong> from your withdrawal record.'
          },
          {
            number: 3,
            content: 'Search for your transaction on the appropriate blockchain explorer (e.g., Etherscan for Ethereum, Blockchain.info for Bitcoin).'
          },
          {
            number: 4,
            content: 'Check the confirmation status on the blockchain explorer. If confirmed, contact your destination wallet support.'
          }
        ]
      },
      {
        type: 'section',
        title: 'When to Contact Support',
        steps: [
          {
            number: 1,
            content: 'If your withdrawal shows as <strong class="text-red-600">Failed</strong> in your transaction history.'
          },
          {
            number: 2,
            content: 'If the transaction is confirmed on the blockchain but not showing in your destination wallet after 24 hours.'
          },
          {
            number: 3,
            content: 'If you suspect you may have sent funds to the wrong address or network.'
          }
        ]
      }
    ],
    notes: [
      'Bitcoin transactions typically require 1-6 confirmations, while Ethereum usually requires 12-35 confirmations.',
      'Network fees during peak times can significantly delay transactions if set too low.',
      'Some exchanges and wallets have their own processing times separate from blockchain confirmations.',
      'Always keep your transaction hash (TXID) for tracking and support purposes.'
    ]
  },
  'select-correct-network': {
    title: 'How do I select the correct network for my crypto withdrawals and deposits?',
    publishDate: 'Jul 22, 2023',
    updateDate: 'Mar 15, 2024',
    readTime: '6 min read',
    views: '7,123',
    breadcrumbs: ['Support center', 'FAQ', 'Deposit and withdrawal', 'Networks', 'Article'],
    sections: [
      {
        type: 'section',
        title: 'Understanding Crypto Networks',
        steps: [
          {
            number: 1,
            content: 'Each cryptocurrency can exist on multiple networks. For example, <strong>USDT</strong> is available on Ethereum (ERC-20), Tron (TRC-20), Binance Smart Chain (BEP-20), and others.'
          },
          {
            number: 2,
            content: 'The network determines the <strong class="text-[#ff6901]">transaction fees</strong>, <strong class="text-[#ff6901]">speed</strong>, and <strong class="text-[#ff6901]">compatibility</strong> with your destination wallet or exchange.'
          },
          {
            number: 3,
            content: 'Always ensure the <strong class="text-red-600">sending and receiving networks match</strong> to avoid losing your funds.'
          }
        ]
      },
      {
        type: 'section',
        title: 'Choosing the Right Network',
        steps: [
          {
            number: 1,
            content: 'Check your destination wallet or exchange to see which networks they support for your chosen cryptocurrency.'
          },
          {
            number: 2,
            content: 'Consider the <strong class="text-[#ff6901]">transaction fees</strong>: TRC-20 (Tron) typically has lower fees than ERC-20 (Ethereum).'
          },
          {
            number: 3,
            content: 'Consider the <strong class="text-[#ff6901]">transaction speed</strong>: BSC and Tron are usually faster than Ethereum.'
          },
          {
            number: 4,
            content: 'When in doubt, <strong class="text-[#ff6901]">contact the receiving platform</strong> to confirm which network they prefer or support.'
          }
        ]
      },
      {
        type: 'section',
        title: 'Common Network Examples',
        steps: [
          {
            number: 1,
            content: '<strong>ERC-20 (Ethereum)</strong>: Higher fees, well-established, widely supported. Good for large amounts.'
          },
          {
            number: 2,
            content: '<strong>TRC-20 (Tron)</strong>: Very low fees, fast transactions. Popular for smaller amounts and frequent transfers.'
          },
          {
            number: 3,
            content: '<strong>BEP-20 (Binance Smart Chain)</strong>: Low fees, fast transactions, widely supported by exchanges.'
          },
          {
            number: 4,
            content: '<strong>Bitcoin Network</strong>: Only for Bitcoin (BTC). Fees vary based on network congestion.'
          }
        ]
      }
    ],
    notes: [
      'Never mix networks - sending ERC-20 tokens to a TRC-20 address will result in permanent loss.',
      'Some wallets support multiple networks for the same token - always double-check before sending.',
      'Network fees are separate from platform fees and vary based on blockchain congestion.',
      'Test with a small amount first if you\'re unsure about network compatibility.'
    ]
  },
  'withdrawal-deposit-fees': {
    title: 'Do I need to pay fees for deposit and withdrawal?',
    publishDate: 'Aug 05, 2023',
    updateDate: 'Apr 10, 2024',
    readTime: '3 min read',  
    views: '9,876',
    breadcrumbs: ['Support center', 'FAQ', 'Deposit and withdrawal', 'Fees', 'Article'],
    sections: [
      {
        type: 'section',
        title: 'Deposit Fees',
        steps: [
          {
            number: 1,
            content: '<strong class="text-green-600">Deposits are generally free</strong> on most platforms, including Flux. You only pay the network fee from your sending wallet.'
          },
          {
            number: 2,
            content: 'The network fee is paid to miners/validators and is <strong class="text-[#ff6901]">not collected by Flux</strong>.'
          },
          {
            number: 3,
            content: 'Network fees vary by blockchain and current congestion levels.'
          }
        ]
      },
      {
        type: 'section',
        title: 'Withdrawal Fees',
        steps: [
          {
            number: 1,
            content: 'Withdrawal fees are charged to cover blockchain network costs and platform maintenance.'
          },
          {
            number: 2,
            content: 'The fee structure varies by cryptocurrency and network. You can see the exact fee before confirming your withdrawal.'
          },
          {
            number: 3,
            content: 'Fees are automatically deducted from your withdrawal amount. The <strong class="text-[#ff6901]">Amount received</strong> shows what you\'ll actually receive.'
          },
          {
            number: 4,
            content: 'Some networks offer lower fees: TRC-20 typically has lower fees than ERC-20.'
          }
        ]
      },
      {
        type: 'section',
        title: 'Fee Examples (Approximate)',
        steps: [
          {
            number: 1,
            content: '<strong>Bitcoin (BTC)</strong>: Network-dependent, typically 0.0005-0.001 BTC'
          },
          {
            number: 2,
            content: '<strong>Ethereum (ETH)</strong>: Network-dependent, typically 0.005-0.01 ETH'
          },
          {
            number: 3,
            content: '<strong>USDT TRC-20</strong>: Typically 1-2 USDT'
          },
          {
            number: 4,
            content: '<strong>USDT ERC-20</strong>: Typically 5-20 USDT (varies with network congestion)'
          }
        ]
      }
    ],
    notes: [
      'Fees are subject to change based on network conditions and platform policies.',
      'Internal transfers (between Flux accounts) may have different fee structures.',
      'Always check the current fee before confirming your transaction.',
      'Choose networks with lower fees for smaller amounts to maximize efficiency.'
    ]
  }
};

const WithdrawalGuide = () => {
  const { withdrawalGuideSlug } = useParams();
  const navigate = useNavigate();
  
  // Get article data based on slug, default to first article if slug not found
  const currentSlug = withdrawalGuideSlug || 'how-to-make-withdrawal';
  const article = articleData[currentSlug];
  
  // If article not found, redirect to default
  if (!article) {
    React.useEffect(() => {
      navigate('/help/how-to-make-withdrawal', { replace: true });
    }, [navigate]);
    return null;
  }

  const handleFaqClick = (slug) => {
    navigate(`/help/withdrawal/${slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          {/* Breadcrumb Navigation and Search Bar on same line */}
          <div className="flex items-center justify-between">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center text-sm text-gray-600">
              {article.breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <span className={index === article.breadcrumbs.length - 1 ? "text-gray-900" : "hover:text-[#ff6901] cursor-pointer"}>
                    {crumb}
                  </span>
                  {index < article.breadcrumbs.length - 1 && (
                    <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </nav>
            
            {/* Search Bar - Right Side */}
            <div className="relative w-80 ml-12">
              <input 
                type="text" 
                placeholder="Search FAQ articles" 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 text-gray-900 placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              />
              <div className="absolute left-3 top-2.5">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
            {/* Article Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span>Published on {article.publishDate}</span>
                <span>•</span>
                <span>Updated on {article.updateDate}</span>
                <span>•</span>
                <span>{article.readTime}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span className="text-orange-500">👁</span>
                  <span>{article.views}</span>
                </div>
              </div>

              {/* Social Share Icons */}
              <div className="flex items-center gap-3 text-gray-400">
                <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <Share2 className="w-4 h-4" />
                </div>
                <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <Facebook className="w-4 h-4" />
                </div>
                <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <Linkedin className="w-4 h-4" />
                </div>
                <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <Link2 className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Dynamic Content Sections */}
            {article.sections.map((section, sectionIndex) => (
              <section key={sectionIndex} className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{section.title}</h2>
                
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  {section.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#ffdab9] text-[#ff6901] rounded-full flex items-center justify-center text-sm font-medium">
                        {step.number}
                      </span>
                      <p dangerouslySetInnerHTML={{ __html: step.content }} />
                    </div>
                  ))}
                </div>

                {/* Dynamic Image Containers */}
                {section.images && section.images.map((image, imageIndex) => (
                  <ImageWithFallback
                    key={imageIndex}
                    src={image.src}
                    alt={image.alt}
                    description={image.description}
                  />
                ))}

                {/* Additional Steps */}
                {section.additionalSteps && (
                  <div className="space-y-4 text-gray-700 leading-relaxed mt-6">
                    {section.additionalSteps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-[#ffdab9] text-[#ff6901] rounded-full flex items-center justify-center text-sm font-medium">
                          {step.number}
                        </span>
                        <p dangerouslySetInnerHTML={{ __html: step.content }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Additional Images */}
                {section.additionalImages && section.additionalImages.map((image, imageIndex) => (
                  <ImageWithFallback
                    key={imageIndex}
                    src={image.src}
                    alt={image.alt}
                    description={image.description}
                  />
                ))}

                {/* Final Steps */}
                {section.finalSteps && (
                  <div className="space-y-4 text-gray-700 leading-relaxed mt-6">
                    {section.finalSteps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-[#ffdab9] text-[#ff6901] rounded-full flex items-center justify-center text-sm font-medium">
                          {step.number}
                        </span>
                        <p dangerouslySetInnerHTML={{ __html: step.content }} />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}

            {/* Dynamic Notes Section */}
            {article.notes && article.notes.length > 0 && (
              <section className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Note:</h3>
                
                <div className="space-y-3 text-gray-700 leading-relaxed">
                  {article.notes.map((note, noteIndex) => (
                    <div key={noteIndex} className="flex gap-2">
                      <span className="text-[#ff6901] mt-1">•</span>
                      <p dangerouslySetInnerHTML={{ __html: note }} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Dynamic Disclaimer Section */}
            {article.disclaimer && (
              <section className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Disclaimer</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {article.disclaimer}
                </p>
              </section>
            )}
          </div>

          {/* Sidebar - FAQ Section */}
          <div className="w-80">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-8">
              <h2 className="text-base font-semibold mb-4 text-gray-900">FAQ</h2>
              <ul className="space-y-3">
                {faqQuestions.map((faq) => (
                  <li key={faq.id}>
                    <button
                      onClick={() => handleFaqClick(faq.slug)}
                      className={`text-sm text-left w-full hover:text-gray-900 hover:underline transition-colors ${
                        currentSlug === faq.slug 
                          ? 'text-[#ff6901] font-medium' 
                          : 'text-gray-700'
                      }`}
                    >
                      {faq.question}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalGuide;