import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Facebook, Linkedin, MessageCircle, Link2, ChevronRight, Eye, Clock, Calendar } from 'lucide-react';
import HowDoIMakeADepositAsset1 from '../../assets/assets/ASSET 1 (1).png';
import HowDoIMakeADepositAsset2 from '../../assets/assets/ASSET 2 (1).png';
import WhyHaveIStillNotReceivedMyDepositAsset1 from '../../assets/assets/ASSET 4.png';
import HowDoIFindMyDepositAddress from '../../assets/assets/ASSET 5.png';

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
  { id: 1, question: "How do I make a deposit?", slug: "how-to-make-deposit" },
  { id: 2, question: "Why have I still not received my deposit?", slug: "deposit-not-received" },
  { id: 3, question: "How do I find my deposit address and tag/memos?", slug: "find-deposit-address-tag-memos" },
  { id: 4, question: "How to check the deposit progress?", slug: "check-deposit-progress" },
];

// Article Data
const articleData = {
  'how-to-make-deposit': {
    title: 'How do I make a deposit?',
    publishDate: 'Aug 15, 2023',
    updateDate: 'Apr 15, 2024',
    readTime: '5 min read',
    views: 6989,
    category: 'Getting Started',
    difficulty: 'Beginner',
    breadcrumbs: ['Support Center', 'FAQ', 'Deposit & Withdrawal', 'Crypto Deposit'],
    sections: [
      {
        type: 'section',
        title: 'Getting Started with Your First Deposit',
        steps: [
          {
            number: 1,
            content: 'Log in to your account at <strong class="text-[#2EBD85]">gld.co</strong>, navigate to the <strong class="text-white">Assets</strong> section, and click on <strong class="text-[#2EBD85]">Deposit</strong>.'
          },
          {
            number: 2,
            content: 'Choose the cryptocurrency you want to deposit from the <strong class="text-white">Select crypto</strong> dropdown and select your preferred network in the <strong class="text-white">Deposit network</strong> field, then click <strong class="text-[#2EBD85]">Next</strong>.'
          }
        ],
        images: [
          {
            src: HowDoIMakeADepositAsset1,
            alt: 'Screenshot showing the crypto selection and network options',
            description: 'Select your cryptocurrency and network from the dropdown menus'
          }
        ],
        additionalSteps: [
          {
            number: 3,
            content: 'Your unique deposit details will be automatically generated for your selected cryptocurrency and network.'
          },
          {
            number: 4,
            content: 'Complete your deposit by either <strong class="text-[#2EBD85]">copying</strong> the deposit address to your sending platform, or <strong class="text-[#2EBD85]">scanning the QR code</strong> with your mobile wallet app.'
          }
        ],
        additionalImages: [
          {
            src: HowDoIMakeADepositAsset2,
            alt: 'Select Copy or scan the QR code to make a deposit',
            description: 'Copy the deposit address or scan the QR code to complete your deposit'
          }
        ]
      }
    ],
    notes: [
      'Make sure the selected crypto and network on both platforms are the same to ensure a successful deposit. Otherwise, you\'ll lose your assets.',
      'You can find the minimum deposit for connection numbers, and contract address in the <strong class="text-[#2EBD85]">Deposit</strong> page.',
      'You won\'t receive your assets if you deposited the crypto amount less than the minimum amount.',
      'Some crypto (for example, XRP) generates a tag/memo which is usually a string of numbers. You need to enter both the deposit address and tag/memo when you\'re depositing. Otherwise, you\'ll lose your assets.'
    ],
    disclaimer: 'This content is provided for informational purposes only and may cover products that are not available in your region. Digital asset holdings involve substantial risk and may fluctuate significantly.'
  },
  'deposit-not-received': {
    title: 'Why have I still not received my deposit?',
    publishDate: 'Sep 10, 2023',
    updateDate: 'May 20, 2024',
    readTime: '3 min read',
    views: 4521,
    category: 'Troubleshooting',
    difficulty: 'Intermediate',
    breadcrumbs: ['Support Center', 'FAQ', 'Deposit & Withdrawal', 'Crypto Deposit'],
    sections: [
      {
        type: 'section',
        title: 'Common Reasons for Delayed Deposits',
        steps: [
          {
            number: 1,
            content: 'Check if you\'ve sent the deposit to the correct <strong class="text-[#2EBD85]">network</strong> and <strong class="text-[#2EBD85]">address</strong>. Sending to the wrong network is the most common cause of lost deposits.'
          },
          {
            number: 2,
            content: 'Verify that the deposit amount meets the <strong class="text-[#2EBD85]">minimum deposit requirement</strong>. Deposits below the minimum threshold will not be credited to your account.'
          },
          {
            number: 3,
            content: 'Check the <strong class="text-[#2EBD85]">network confirmation status</strong> - some networks require multiple confirmations before the deposit is credited.'
          },
          {
            number: 4,
            content: 'Verify that you included the correct <strong class="text-[#2EBD85]">tag/memo</strong> if required for your chosen cryptocurrency (XRP, XLM, EOS, etc.).'
          }
        ],
        images: [
          {
            src: WhyHaveIStillNotReceivedMyDepositAsset1,
            alt: 'Common deposit issues troubleshooting guide',
            description: 'Common reasons why deposits may be delayed or not received'
          }
        ]
      },
      {
        type: 'section',
        title: 'What to Do Next',
        steps: [
          
          {
            number: 1,
            content: 'If the transaction shows as confirmed on the blockchain but hasn\'t appeared in your account, wait up to 30 minutes for processing.'
          },
          {
            number: 2,
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
    views: 3892,
    category: 'Account Management',
    difficulty: 'Beginner',
    breadcrumbs: ['Support Center', 'FAQ', 'Deposit & Withdrawal', 'Crypto Deposit'],
    sections: [
      {
        type: 'section',
        title: 'Finding Your Deposit Address',
        steps: [
          {
            number: 1,
            content: 'Navigate to <strong class="text-[#2EBD85]">Assets</strong> > <strong class="text-[#2EBD85]">Deposit</strong> in your account dashboard.'
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
            description: 'Location of deposit address and tag/memo in the deposit interface'
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
    views: 2134,
    category: 'Account Management',
    difficulty: 'Beginner',
    breadcrumbs: ['Support Center', 'FAQ', 'Deposit & Withdrawal', 'Crypto Deposit'],
    sections: [
      {
        type: 'section',
        title: 'Checking Your Deposit Status',
        steps: [
          {
            number: 1,
            content: 'Go to <strong class="text-[#2EBD85]">Assets</strong> > <strong class="text-[#2EBD85]">Transaction History</strong> in your account.'
          },
          {
            number: 2,
            content: 'Filter by <strong class="text-[#2EBD85]">Deposit</strong> to see all your deposit transactions.'
          },
          {
            number: 3,
            content: 'Check the status column to see if your deposit is <strong class="text-green-600">Completed</strong>, <strong class="text-[#2EBD85]">Pending</strong>, or <strong class="text-red-600">Failed</strong>.'
          },
          {
            number: 4,
            content: 'Click on any transaction to view detailed information including transaction hash and confirmation status.'
          }
        ]
      },
      {
        type: 'section',
        title: 'Understanding Deposit Status',
        steps: [
          {
            number: 1,
            content: '<strong class="text-[#2EBD85]">Pending:</strong> Your deposit is being processed on the blockchain.'
          },
          {
            number: 2,
            content: '<strong class="text-[#2EBD85]">Confirming:</strong> Your deposit has been detected and is awaiting network confirmations.'
          },
          {
            number: 3,
            content: '<strong class="text-green-600">Completed:</strong> Your deposit has been successfully credited to your account.'
          },
          {
            number: 4,
            content: '<strong class="text-red-600">Failed:</strong> There was an issue with your deposit - contact support for assistance.'
          }
        ]
      }
    ],
    notes: [
      'Pending deposits usually resolve within 30 minutes to 2 hours depending on network congestion.',
      'Contact support if a deposit shows as failed or has been pending for over 24 hours.',
      'Different networks have different confirmation requirements - Bitcoin may take longer than Ethereum.'
    ]
  }
};

const DepositGuide = () => {
  const { depositGuideSlug } = useParams();
  const navigate = useNavigate();
  const [faqSearch, setFaqSearch] = useState('');
  const [currentViews, setCurrentViews] = useState(0);
  
  const currentSlug = depositGuideSlug || 'how-to-make-deposit';
  const article = articleData[currentSlug];
  
  if (!article) {
    React.useEffect(() => {
      navigate('/help/how-to-make-deposit', { replace: true });
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
    navigate(`/help/deposit/${slug}`);
  };

  // Share functionality
  // const handleShare = async (platform) => {
  //   const url = window.location.href;
  //   const title = article.title;
  //   const text = `Check out this helpful guide: ${title}`;

  //   switch (platform) {
  //     case 'native':
  //       if (navigator.share) {
  //         try {
  //           await navigator.share({
  //             title: title,
  //             text: text,
  //             url: url
  //           });
  //         } catch (err) {
  //           // Fallback to copy URL
  //           await copyToClipboard(url);
  //         }
  //       } else {
  //         await copyToClipboard(url);
  //       }
  //       break;
  //     case 'facebook':
  //       window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
  //       break;
  //     case 'linkedin':
  //       window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
  //       break;
  //     case 'twitter':
  //       window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
  //       break;
  //     case 'copy':
  //       await copyToClipboard(url);
  //       break;
  //     default:
  //       await copyToClipboard(url);
  //   }
  // };

  // const copyToClipboard = async (text) => {
  //   try {
  //     await navigator.clipboard.writeText(text);
  //     // You could show a toast notification here
  //     console.log('Link copied to clipboard');
  //   } catch (err) {
  //     // Fallback for older browsers
  //     const textArea = document.createElement('textarea');
  //     textArea.value = text;
  //     document.body.appendChild(textArea);
  //     textArea.select();
  //     document.execCommand('copy');
  //     document.body.removeChild(textArea);
  //     console.log('Link copied to clipboard (fallback)');
  //   }
  // };

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
                    {idx > 0 && <ChevronRight className="w-4 h-4 text-[#5E6673] flex-shrink-0" />}
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
                        <div className="flex-shrink-0 w-6 h-6 bg-[#2EBD85]/50 text-white rounded-full flex items-center justify-center text-sm font-medium">
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

                  {/* Additional Steps */}
                  {section.additionalSteps && (
                    <div className="space-y-4 mb-6">
                      {section.additionalSteps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-[#2EBD85]/50 text-white rounded-full flex items-center justify-center text-sm font-medium">
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
                  )}

                  {/* Additional Images */}
                  {section.additionalImages && section.additionalImages.map((image, imageIndex) => (
                    <ImageWithFallback
                      key={`additional-img-${imageIndex}`}
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

export default DepositGuide;