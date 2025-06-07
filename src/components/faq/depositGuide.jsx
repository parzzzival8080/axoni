import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Facebook, Linkedin, MessageCircle, Link2, ChevronRight } from 'lucide-react';
import HowDoIMakeADepositAsset1 from '../../assets/assets/ASSET 1 (1).png';
import HowDoIMakeADepositAsset2 from '../../assets/assets/ASSET 2 (1).png';
import WhyHaveIStillNotReceivedMyDepositAsset1 from '../../assets/assets/ASSET 4.png';
import HowDoIFindMyDepositAddress from '../../assets/assets/ASSET 5.png';

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
  { id: 1, question: "How do I make a deposit?", slug: "how-to-make-deposit" },
  { id: 2, question: "Why have I still not received my deposit?", slug: "deposit-not-received" },
  { id: 3, question: "How do I find my deposit address and tag/memos?", slug: "find-deposit-address-tag-memos" },
  { id: 4, question: "How to check the deposit progress?", slug: "check-deposit-progress" },
];

// Article Data with Image Support
const articleData = {
  'how-to-make-deposit': {
    title: 'How do I make a deposit?',
    publishDate: 'Aug 15, 2023',
    updateDate: 'Apr 15, 2024',
    readTime: '5 min read',
    views: '6,989',
    breadcrumbs: ['Support center', 'FAQ', 'Deposit and withdrawal', 'Crypto deposit', 'Article'],
    sections: [
      {
        type: 'section',
        title: 'Getting Started',
        steps: [
          {
            number: 1,
            content: 'Log in to your account at <strong>flux.com</strong>, go to the <strong class="text-black">Assets</strong>, and select <strong class="text-[#ff6901]">Deposit</strong>.'
          },
          {
            number: 2,
            content: 'Select the crypto that you want to deposit in <strong class="text-black">Select crypto</strong> and deposit network in the <strong class="text-black">Deposit network</strong> field, then select <strong class="text-[#ff6901]">Next</strong>.'
          }
        ],
        images: [
          {
            src: HowDoIMakeADepositAsset1 ,
            alt: 'Screenshot showing the crypto selection and network options',
            description: ''
          }
        ],
        additionalSteps: [
          {
            number: 3,
            content: 'Deposit details will then automatically generate.'
          },
          {
            number: 4,
            content: 'To make a deposit, you can either <strong class="text-[#ff6901]">Copy</strong> the deposit address to the platform you\'re sending from, or scan the <strong class="text-[#ff6901]">QR code</strong> using that platform\'s app.'
          }
        ],
        additionalImages: [
          {
            src: HowDoIMakeADepositAsset2, 
            alt: 'Select Copy or scan the QR code to make a deposit',
            description: ''
          }
        ]
      }
    ],
    notes: [
      'Make sure the selected crypto and network on both OKX and your withdrawal platform are the same to ensure a successful deposit. Otherwise, you\'ll lose your assets.',
      'You can find the minimum deposit for connection numbers, and contract address in the <strong class="text-[#ff6901]">Deposit</strong> page.',
      'You won\'t receive your assets if you deposited the crypto amount less than the minimum amount.',
      'Some crypto (for example, XRP) generates a tag/memo which is usually a string of numbers. You need to enter both the deposit address and tag/memo when you\'re depositing. Otherwise, you\'ll lose your assets. <span class="text-[#ff6901] underline cursor-pointer">Click here to learn more about how to deposit crypto with a tag/memo.</span>'
    ],
    disclaimer: 'This content is provided for informational purposes only and may cover products that are not available in your region. It is not intended to provide (i) investment advice or an investment recommendation; (ii) an offer or solicitation to buy, sell, or hold digital assets, or (iii) financial, accounting, legal, or tax advice. Digital asset holdings, including stablecoins and NFTs, involve substantial risk and may fluctuate significantly, leading to reduced value or complete loss. You should carefully consider whether trading or holding digital assets is suitable for you in light of your financial condition. Please consult your legal/tax/investment professional for questions about your specific circumstances.'
  },
  'deposit-not-received': {
    title: 'Why have I still not received my deposit?',
    publishDate: 'Sep 10, 2023',
    updateDate: 'May 20, 2024',
    readTime: '3 min read',
    views: '4,521',
    breadcrumbs: ['Support center', 'FAQ', 'Deposit and withdrawal', 'Crypto deposit', 'Article'],
    sections: [
      {
        type: 'section',
        title: 'Common Reasons for Delayed Deposits',
        steps: [
          {
            number: 1,
            content: 'Check if you\'ve sent the deposit to the correct <strong class="text-[#ff6901]">network</strong> and <strong class="text-[#ff6901]">address</strong>. Sending to the wrong network is the most common cause of lost deposits.'
          },
          {
            number: 2,
            content: 'Verify that the deposit amount meets the <strong class="text-[#ff6901]">minimum deposit requirement</strong>. Deposits below the minimum threshold will not be credited to your account.'
          },
          {
            number: 3,
            content: 'Check the <strong class="text-[#ff6901]">network confirmation status</strong> - some networks require multiple confirmations before the deposit is credited.'
          },
          {
            number: 4,
            content: 'Verify that you included the correct <strong class="text-[#ff6901]">tag/memo</strong> if required for your chosen cryptocurrency (XRP, XLM, EOS, etc.).'
          }
        ],
        images: [
          {
            src: WhyHaveIStillNotReceivedMyDepositAsset1,
            alt: 'Common deposit issues troubleshooting guide',
            description: ''
          }
        ]
      },
      {
        type: 'section',
        title: 'What to Do Next',
        steps: [
          {
            number: 1,
            content: 'Check your transaction on the blockchain explorer using your transaction hash (TXID).'
          },
          {
            number: 2,
            content: 'If the transaction shows as confirmed on the blockchain but hasn\'t appeared in your account, wait up to 30 minutes for processing.'
          },
          {
            number: 3,
            content: 'Contact our support team if your deposit hasn\'t appeared after 24 hours of blockchain confirmation.'
          }
        ]
      }
    ],
    notes: [
      'Network confirmations can take anywhere from a few minutes to several hours depending on network congestion.',
      'If you sent funds to the wrong network, your deposit may be permanently lost.',
      'Always double-check the deposit address and network before sending funds.',
      'Contact support immediately if you suspect you\'ve made an error with your deposit.'
    ]
  },
  'find-deposit-address-tag-memos': {
    title: 'How do I find my deposit address and tag/memos?',
    publishDate: 'Jul 22, 2023',
    updateDate: 'Mar 15, 2024',
    readTime: '4 min read',
    views: '3,892',
    breadcrumbs: ['Support center', 'FAQ', 'Deposit and withdrawal', 'Crypto deposit', 'Article'],
    sections: [
      {
        type: 'section',
        title: 'Finding Your Deposit Address',
        steps: [
          {
            number: 1,
            content: 'Navigate to <strong class="text-[#ff6901]">Assets</strong> > <strong class="text-[#ff6901]">Deposit</strong> in your account dashboard.'
          },
          {
            number: 2,
            content: 'Select the cryptocurrency you want to deposit from the dropdown menu.'
          },
          {
            number: 3,
            content: 'Choose the appropriate network for your deposit. Make sure this matches your withdrawal platform.'
          },
          {
            number: 4,
            content: 'Your deposit address and tag/memo (if required) will be automatically generated and displayed.'
          },
          {
            number: 5,
            content: 'Copy the address or scan the QR code to use on your sending platform.'
          }
        ],
        images: [
          {
            src: HowDoIFindMyDepositAddress,
            alt: 'Screenshot showing where to find deposit address and tag/memo',
            description: ''
          }
        ]
      },
      {
        type: 'section',
        title: 'Understanding Tags and Memos',
        steps: [
          {
            number: 1,
            content: 'Some cryptocurrencies require both an address and a tag/memo for deposits.'
          },
          {
            number: 2,
            content: 'Tags/memos are typically required for: <strong>XRP (Tag)</strong>, <strong>XLM (Memo)</strong>, <strong>EOS (Memo)</strong>, <strong>BNB (Memo)</strong>.'
          },
          {
            number: 3,
            content: 'The tag/memo helps identify your specific deposit among many others sent to the same address.'
          },
          {
            number: 4,
            content: '<strong class="text-red-600">Important:</strong> Always include the tag/memo when required, or your deposit will be lost.'
          }
        ],
        images: [
          {
            src: '', 
            alt: 'Example of tag/memo requirement for different cryptocurrencies',
            description: ''
          }
        ]
      }
    ],
    notes: [
      'Always double-check that the network matches between your withdrawal and deposit platforms.',
      'Never share your deposit address publicly or with untrusted parties.',
      'Each cryptocurrency may have different network options - choose carefully.',
      'If you\'re unsure about which network to use, contact support before making your deposit.'
    ]
  },
  'check-deposit-progress': {
    title: 'How to check the deposit progress?',
    publishDate: 'Aug 05, 2023',
    updateDate: 'Apr 10, 2024',
    readTime: '2 min read',  
    views: '2,134',
    breadcrumbs: ['Support center', 'FAQ', 'Deposit and withdrawal', 'Crypto deposit', 'Article'],
    sections: [
      {
        type: 'section',
        title: 'Checking Your Deposit Status',
        steps: [
          {
            number: 1,
            content: 'Go to <strong class="text-[#ff6901]">Assets</strong> > <strong class="text-[#ff6901]">Transaction History</strong> in your account.'
          },
          {
            number: 2,
            content: 'Filter by <strong class="text-[#ff6901]">Deposit</strong> to see all your deposit transactions.'
          },
          {
            number: 3,
            content: 'Check the status column to see if your deposit is <strong class="text-green-600">Completed</strong>, <strong class="text-yellow-600">Pending</strong>, or <strong class="text-red-600">Failed</strong>.'
          },
          {
            number: 4,
            content: 'Click on any transaction to view detailed information including transaction hash and confirmation status.'
          }
        ],
        images: [
          {
            src: '', 
            alt: 'Screenshot showing the transaction history page with deposit status',
            description: ''
          }
        ]
      },
      {
        type: 'section',
        title: 'Understanding Deposit Status',
        steps: [
          {
            number: 1,
            content: '<strong class="text-yellow-600">Pending:</strong> Your deposit is being processed on the blockchain.'
          },
          {
            number: 2,
            content: '<strong class="text-[#ff6901]">Confirming:</strong> Your deposit has been detected and is awaiting network confirmations.'
          },
          {
            number: 3,
            content: '<strong class="text-green-600">Completed:</strong> Your deposit has been successfully credited to your account.'
          },
          {
            number: 4,
            content: '<strong class="text-red-600">Failed:</strong> There was an issue with your deposit - contact support for assistance.'
          }
        ],
        images: [
          {
            src: '',
            alt: 'Visual guide showing different deposit status indicators',
            description: ''
          }
        ]
      }
    ],
    notes: [
      'You can also check the transaction on the blockchain using the transaction hash (TXID).',
      'Pending deposits usually resolve within 30 minutes to 2 hours depending on network congestion.',
      'Contact support if a deposit shows as failed or has been pending for over 24 hours.',
      'Different networks have different confirmation requirements - Bitcoin may take longer than Ethereum.'
    ]
  }
};

const DepositGuide = () => {
  const { depositGuideSlug } = useParams();
  const navigate = useNavigate();
  
  // Get article data based on slug, default to first article if slug not found
  const currentSlug = depositGuideSlug || 'how-to-make-deposit';
  const article = articleData[currentSlug];
  
  // If article not found, redirect to default
  if (!article) {
    React.useEffect(() => {
      navigate('/help/how-to-make-deposit', { replace: true });
    }, [navigate]);
    return null;
  }

  const handleFaqClick = (slug) => {
    navigate(`/help/deposit/${slug}`);
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
                  <div className="space-y-4 text-gray-700 leading-relaxed">
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

export default DepositGuide;