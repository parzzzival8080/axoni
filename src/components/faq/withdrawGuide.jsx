import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Facebook, Linkedin, MessageCircle, Link2, ChevronRight, Eye, Clock, Calendar } from 'lucide-react';

// Enhanced Image Component with Loading States
const ImageWithFallback = ({ src, alt, description, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!src || src === '' || src === null || src === undefined) {
    return null;
  }

  return (
    <div className="my-6">
      {!imageError ? (
        <div className="rounded-lg overflow-hidden border border-[#2A2A2A] bg-[#0a0a0a]">
          {imageLoading && (
            <div className="w-full h-64 md:h-80 bg-[#1E1E1E] flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#2EBD85] border-t-transparent"></div>
            </div>
          )}
          <img 
            src={src} 
            alt={alt}
            className={`w-full h-auto object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0 absolute' : 'opacity-100'} ${className}`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        </div>
      ) : (
        <div className="p-6 bg-[#1E1E1E] rounded-lg border border-[#2A2A2A]">
          <div className="text-center text-[#5E6673]">
            <div className="w-12 h-12 bg-[#2A2A2A] rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <p className="text-sm">Image unavailable</p>
          </div>
        </div>
      )}
      {description && (
        <p className="mt-3 text-sm text-[#848E9C]">{description}</p>
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
    views: 8245,
    category: 'Getting Started',
    difficulty: 'Beginner',
    breadcrumbs: ['Support Center', 'FAQ', 'Deposit & Withdrawal', 'Crypto Withdrawal'],
    sections: [
      {
        type: 'section',
        title: 'Getting Started with Withdrawals',
        steps: [
          {
            number: 1,
            content: 'Log in to your account at <strong>gldcoin.co</strong>, go to the <strong class="text-white">Assets</strong>, and select <strong class="text-[#2EBD85]">Withdrawal</strong>.'
          },
          {
            number: 2,
            content: 'In the <strong class="text-white">Select crypto</strong> dropdown, choose the cryptocurrency you want to withdraw.'
          },
          {
            number: 3,
            content: 'Choose your withdrawal method: <strong class="text-[#2EBD85]">On-chain withdrawal</strong> (to external wallet) or <strong class="text-[#2EBD85]">Internal withdrawal</strong> (to another GLD account).'
          },
          {
            number: 4,
            content: 'Select the appropriate <strong class="text-white">Network</strong> for your withdrawal. Make sure this matches the network supported by your destination wallet or exchange.'
          },
          {
            number: 5,
            content: 'Enter the destination <strong class="text-white">Address</strong> where you want to send your crypto. You can also select from your saved addresses using <strong class="text-[#2EBD85]">Manage address book</strong>.'
          },
          {
            number: 6,
            content: 'Set the <strong class="text-white">withdrawal amount</strong>. You can see your available balance and use the <strong class="text-[#2EBD85]">Max</strong> button to withdraw the maximum amount.'
          },
          {
            number: 7,
            content: 'Review the <strong class="text-white">Network fee</strong> and <strong class="text-white">Amount received</strong> details.'
          },
          {
            number: 8,
            content: 'Click <strong class="text-[#2EBD85]">Next</strong> to proceed with your withdrawal.'
          },
          {
            number: 9,
            content: 'Complete any required security verification (2FA, email confirmation, etc.) to finalize your withdrawal.'
          }
        ],
        images: [
          {
            src: null,
            alt: 'Screenshot showing crypto selection for withdrawal',
            description: 'Select the cryptocurrency you want to withdraw'
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
    disclaimer: 'This content is provided for informational purposes only and may cover products that are not available in your region. Digital asset holdings involve substantial risk and may fluctuate significantly.'
  },
  'withdrawal-not-received': {
    title: 'Why have I still not received my withdrawal?',
    publishDate: 'Sep 10, 2023',
    updateDate: 'May 20, 2024',
    readTime: '4 min read',
    views: 5892,
    category: 'Troubleshooting',
    difficulty: 'Intermediate',
    breadcrumbs: ['Support Center', 'FAQ', 'Deposit & Withdrawal', 'Crypto Withdrawal'],
    sections: [
      {
        type: 'section',
        title: 'Common Reasons for Delayed Withdrawals',
        steps: [
          {
            number: 1,
            content: 'Check the <strong class="text-[#2EBD85]">network confirmation status</strong>. Different networks require different numbers of confirmations before the transaction is considered complete.'
          },
          {
            number: 2,
            content: 'Verify that you sent to the correct <strong class="text-[#2EBD85]">network</strong>. Sending to the wrong network is a common cause of delays or lost funds.'
          },
          {
            number: 3,
            content: 'Check for <strong class="text-[#2EBD85]">network congestion</strong>. During high traffic periods, transactions may take longer than usual to process.'
          },
          {
            number: 4,
            content: 'Review your <strong class="text-[#2EBD85]">destination wallet</strong> settings. Some wallets or exchanges may have additional processing times.'
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
    ]
  },
  'select-correct-network': {
    title: 'How do I select the correct network for my crypto withdrawals and deposits?',
    publishDate: 'Jul 22, 2023',
    updateDate: 'Mar 15, 2024',
    readTime: '6 min read',
    views: 7123,
    category: 'Networks',
    difficulty: 'Intermediate',
    breadcrumbs: ['Support Center', 'FAQ', 'Deposit & Withdrawal', 'Networks'],
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
            content: 'The network determines the <strong class="text-[#2EBD85]">transaction fees</strong>, <strong class="text-[#2EBD85]">speed</strong>, and <strong class="text-[#2EBD85]">compatibility</strong> with your destination wallet or exchange.'
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
            content: 'Consider the <strong class="text-[#2EBD85]">transaction fees</strong>: TRC-20 (Tron) typically has lower fees than ERC-20 (Ethereum).'
          },
          {
            number: 3,
            content: 'Consider the <strong class="text-[#2EBD85]">transaction speed</strong>: BSC and Tron are usually faster than Ethereum.'
          },
          {
            number: 4,
            content: 'When in doubt, <strong class="text-[#2EBD85]">contact the receiving platform</strong> to confirm which network they prefer or support.'
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
    views: 9876,
    category: 'Fees',
    difficulty: 'Beginner',
    breadcrumbs: ['Support Center', 'FAQ', 'Deposit & Withdrawal', 'Fees'],
    sections: [
      {
        type: 'section',
        title: 'Deposit Fees',
        steps: [
          {
            number: 1,
            content: '<strong class="text-green-600">Deposits are generally free</strong> on most platforms, including GLD. You only pay the network fee from your sending wallet.'
          },
          {
            number: 2,
            content: 'The network fee is paid to miners/validators and is <strong class="text-[#2EBD85]">not collected by GLD</strong>.'
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
            content: 'Fees are automatically deducted from your withdrawal amount. The <strong class="text-[#2EBD85]">Amount received</strong> shows what you\'ll actually receive.'
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
      'Internal transfers (between GLD accounts) may have different fee structures.',
      'Always check the current fee before confirming your transaction.',
      'Choose networks with lower fees for smaller amounts to maximize efficiency.'
    ]
  }
};

const WithdrawalGuide = () => {
  const { withdrawalGuideSlug } = useParams();
  const navigate = useNavigate();
  const [faqSearch, setFaqSearch] = useState('');
  const [currentViews, setCurrentViews] = useState(0);
  
  const currentSlug = withdrawalGuideSlug || 'how-to-make-withdrawal';
  const article = articleData[currentSlug];
  
  if (!article) {
    React.useEffect(() => {
      navigate('/help/how-to-make-withdrawal', { replace: true });
    }, [navigate]);
    return null;
  }

  // Simulate view increment on page load
  useEffect(() => {
    setCurrentViews(article.views);
    // Simulate incrementing views
    const timer = setTimeout(() => {
      setCurrentViews(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentSlug, article.views]);

  const handleFaqClick = (slug) => {
    navigate(`/help/withdrawal/${slug}`);
  };

  // Share functionality
  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = article.title;
    const text = `Check out this helpful guide: ${title}`;

    switch (platform) {
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: title,
              text: text,
              url: url
            });
          } catch (err) {
            // Fallback to copy URL
            await copyToClipboard(url);
          }
        } else {
          await copyToClipboard(url);
        }
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        break;
      case 'copy':
        await copyToClipboard(url);
        break;
      default:
        await copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could show a toast notification here
      console.log('Link copied to clipboard');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      console.log('Link copied to clipboard (fallback)');
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toLocaleString();
  };

  const filteredFaqQuestions = faqQuestions.filter(q => 
    !faqSearch || q.question.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="bg-[#0a0a0a]">
      {/* Subtle yellow Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-yellow-50 border-b border-yellow-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb Navigation */}
          <nav className="mb-3 sm:mb-4">
            {/* Mobile: Show only last 2 breadcrumbs */}
            <div className="flex items-center space-x-1 text-[#5E6673] text-xs sm:hidden overflow-hidden">
              {article.breadcrumbs.length > 2 && (
                <>
                  <span className="text-[#5E6673]">...</span>
                  <ChevronRight className="w-3 h-3 text-[#5E6673] flex-shrink-0" />
                </>
              )}
              {article.breadcrumbs.slice(-2).map((crumb, idx, arr) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-[#5E6673] flex-shrink-0" />}
                  <span 
                    className={`hover:text-[#2EBD85] cursor-pointer transition-colors truncate ${
                      idx === arr.length - 1 ? 'max-w-[120px]' : 'max-w-[80px]'
                    }`}
                    title={crumb}
                  >
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
            
            {/* Desktop: Show all breadcrumbs with horizontal scroll */}
            <div className="hidden sm:flex items-center space-x-2 text-[#5E6673] text-sm overflow-x-auto pb-1 scrollbar-hide">
              <div className="flex items-center space-x-2 whitespace-nowrap">
                {article.breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <ChevronRight className="w-4 h-4 text-[#5E6673]" />}
                    <span className="hover:text-[#2EBD85] cursor-pointer transition-colors">{crumb}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </nav>
          
          {/* Category and Difficulty Tags */}
          <div className="flex items-center space-x-3 mb-4">
            <span className="px-3 py-1 bg-[#2EBD85]/10 text-[#2EBD85] rounded-full text-xs font-medium">
              {article.category}
            </span>
            <span className="px-3 py-1 bg-[#2EBD85]/10 text-[#2EBD85] rounded-full text-xs font-medium">
              {article.difficulty}
            </span>
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold mb-4 text-white">
            {article.title}
          </h1>
          
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-[#848E9C] mb-6">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{formatViews(currentViews)} views</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{article.readTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Updated {article.updateDate}</span>
            </div>
          </div>

          {/* Social Share */}
          {/* <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[#848E9C]">Share:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleShare('native')}
                className="p-2 bg-[#0a0a0a] hover:bg-[#2EBD85]/5 rounded-lg transition-colors border border-[#2A2A2A] hover:border-[#2EBD85]/20"
                title="Share"
              >
                <Share2 className="w-4 h-4 text-[#5E6673] hover:text-[#2EBD85]" />
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="p-2 bg-[#0a0a0a] hover:bg-[#2EBD85]/5 rounded-lg transition-colors border border-[#2A2A2A] hover:border-[#2EBD85]/20"
                title="Share on Facebook"
              >
                <Facebook className="w-4 h-4 text-[#5E6673] hover:text-[#2EBD85]" />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="p-2 bg-[#0a0a0a] hover:bg-[#2EBD85]/5 rounded-lg transition-colors border border-[#2A2A2A] hover:border-[#2EBD85]/20"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-[#5E6673] hover:text-[#2EBD85]" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="p-2 bg-[#0a0a0a] hover:bg-[#2EBD85]/5 rounded-lg transition-colors border border-[#2A2A2A] hover:border-[#2EBD85]/20"
                title="Share on Twitter"
              >
                <MessageCircle className="w-4 h-4 text-[#5E6673] hover:text-[#2EBD85]" />
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="p-2 bg-[#0a0a0a] hover:bg-[#1E1E1E] rounded-lg transition-colors border border-[#2A2A2A] hover:border-[#2A2A2A]"
                title="Copy Link"
              >
                <Link2 className="w-4 h-4 text-[#5E6673] hover:text-[#848E9C]" />
              </button>
            </div>
          </div> */}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Article Content */}
          <main className="lg:col-span-2">
            <div className="space-y-8">
              
              {/* Article Sections */}
              {article.sections.map((section, sectionIndex) => (
                <section key={sectionIndex}>
                  <h2 className="text-xl font-semibold text-white mb-6">
                    {section.title}
                  </h2>
                  
                  {/* Steps */}
                  <div className="space-y-4 mb-6">
                    {section.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-[#2EBD85] text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {step.number}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p 
                            className="text-[#848E9C] leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(step.content) }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Images */}
                  {section.images && section.images.map((image, imageIndex) => (
                    <ImageWithFallback
                      key={imageIndex}
                      src={image.src}
                      alt={image.alt}
                      description={image.description}
                    />
                  ))}
                </section>
              ))}

              {/* Note Section */}
              {article.notes && article.notes.length > 0 && (
                <div className="bg-[#2EBD85]/5 border border-[#2EBD85]/20 rounded-lg p-6">
                  <h3 className="text-base font-semibold text-white mb-4">Note:</h3>
                  <div className="space-y-3">
                    {article.notes.map((note, noteIndex) => (
                      <div key={noteIndex} className="flex gap-2">
                        <span className="text-[#2EBD85] mt-1 text-sm">•</span>
                        <p 
                          className="text-[#848E9C] text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note) }} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              {article.disclaimer && (
                <div className="border border-[#2A2A2A] rounded-lg p-6 bg-[#1E1E1E]">
                  <h3 className="text-base font-semibold text-white mb-3">
                    Disclaimer
                  </h3>
                  <p className="text-sm text-[#848E9C] leading-relaxed">
                    {article.disclaimer}
                  </p>
                </div>
              )}
            </div>
          </main>

          {/* FAQ Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-[#1E1E1E] rounded-lg p-6 sticky top-8">
              <h2 className="text-base font-semibold text-white mb-4">
                FAQ
              </h2>
              
              {/* Search */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  className="w-full pl-3 pr-3 py-2 text-sm border border-[#2A2A2A] rounded-md focus:outline-none focus:ring-2 focus:ring-[#2EBD85] focus:border-[#2EBD85] bg-[#0a0a0a]"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                />
              </div>

              {/* FAQ List */}
              <div className="space-y-3">
                {filteredFaqQuestions.map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => handleFaqClick(faq.slug)}
                    className={`w-full text-left text-sm hover:text-white transition-colors ${
                      currentSlug === faq.slug 
                        ? 'text-[#2EBD85] font-medium' 
                        : 'text-[#848E9C]'
                    }`}
                  >
                    {faq.question}
                  </button>
                ))}
                
                {filteredFaqQuestions.length === 0 && (
                  <div className="text-center py-4 text-[#5E6673]">
                    <p className="text-sm">No results found for "{faqSearch}"</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalGuide;