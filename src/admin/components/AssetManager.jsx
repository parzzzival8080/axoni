import React, { useState, useRef } from 'react';
import { useWhiteLabel } from '../context/WhiteLabelContext';

const AssetManager = () => {
  const { config, updateConfig, uploadFile } = useWhiteLabel();
  const [uploading, setUploading] = useState({});
  const [dragStates, setDragStates] = useState({});
  
  // Ensure config.assets exists and arrays are properly initialized
  const safeConfig = {
    ...config,
    assets: {
      ...config.assets,
      sponsors: Array.isArray(config.assets?.sponsors) ? config.assets.sponsors : [],
      appStoreImages: Array.isArray(config.assets?.appStoreImages) ? config.assets.appStoreImages : [],
      playStoreImages: Array.isArray(config.assets?.playStoreImages) ? config.assets.playStoreImages : []
    }
  };
  
  // Create refs for all asset types
  const fileInputRefs = {};
  const assetCategories = [
    {
      title: 'Login & Auth Assets',
      icon: '🔐',
      assets: [
        {
          key: 'loginBackground',
          label: 'Login Background',
          description: 'Background image for login pages',
          recommended: '1920x1080px, JPG/PNG',
          currentPath: '/assets/login/login.png'
        },
        {
          key: 'signupBackground',
          label: 'Signup Background',
          description: 'Background image for signup pages',
          recommended: '1920x1080px, JPG/PNG',
          currentPath: '/assets/login/signup.png'
        },
        {
          key: 'loginQRCode',
          label: 'Login QR Code',
          description: 'QR code for mobile login',
          recommended: '256x256px, PNG',
          currentPath: '/assets/login/qr-code.png'
        }
      ]
    },
    {
      title: 'Homepage Assets',
      icon: '🏠',
      assets: [
        {
          key: 'heroBackground',
          label: 'Hero Background',
          description: 'Main homepage hero section background',
          recommended: '1920x800px, JPG/PNG',
          currentPath: '/assets/homepage/background.png'
        },
        {
          key: 'aboutImage',
          label: 'About Section Image',
          description: 'Image used in the about section',
          recommended: '800x600px, JPG/PNG',
          currentPath: '/assets/homepage/image.png'
        },
        {
          key: 'laptopImage',
          label: 'Trading Platform Laptop',
          description: 'Laptop showing trading platform',
          recommended: '800x600px, JPG/PNG',
          currentPath: '/assets/homepage/laptop.png'
        },
        {
          key: 'mobileApp',
          label: 'Mobile App Mockup',
          description: 'Mobile app screenshot/mockup',
          recommended: '400x800px, PNG',
          currentPath: '/assets/homepage/mobile-app.png'
        },
        {
          key: 'faqImage',
          label: 'FAQ Section Image',
          description: 'Image for FAQ section',
          recommended: '600x400px, PNG',
          currentPath: '/assets/homepage/faq.png'
        },
        {
          key: 'news1',
          label: 'News Image 1',
          description: 'First news article image',
          recommended: '400x300px, PNG',
          currentPath: '/assets/homepage/news1.png'
        },
        {
          key: 'news2',
          label: 'News Image 2',
          description: 'Second news article image',
          recommended: '400x300px, PNG',
          currentPath: '/assets/homepage/news2.png'
        },
        {
          key: 'news3',
          label: 'News Image 3',
          description: 'Third news article image',
          recommended: '400x300px, PNG',
          currentPath: '/assets/homepage/news3.png'
        }
      ]
    },
    {
      title: 'App Store Assets',
      icon: '📱',
      assets: [
        {
          key: 'appStoreImage1',
          label: 'App Store Screenshot 1',
          description: 'First app store screenshot',
          recommended: '1242x2688px, PNG',
          currentPath: '/assets/appstore/1.png'
        },
        {
          key: 'appStoreImage2',
          label: 'App Store Screenshot 2',
          description: 'Second app store screenshot',
          recommended: '1242x2688px, PNG',
          currentPath: '/assets/appstore/2.png'
        },
        {
          key: 'appStoreImage3',
          label: 'App Store Screenshot 3',
          description: 'Third app store screenshot',
          recommended: '1242x2688px, PNG',
          currentPath: '/assets/appstore/3.png'
        },
        {
          key: 'appStoreImage4',
          label: 'App Store Screenshot 4',
          description: 'Fourth app store screenshot',
          recommended: '1242x2688px, PNG',
          currentPath: '/assets/appstore/4.png'
        },
        {
          key: 'appStoreIcon',
          label: 'App Store Icon',
          description: 'App icon for App Store',
          recommended: '1024x1024px, PNG',
          currentPath: '/assets/appstore/icon.png'
        }
      ]
    },
    {
      title: 'Google Play Assets',
      icon: '🤖',
      assets: [
        {
          key: 'playStoreImage1',
          label: 'Play Store Screenshot 1',
          description: 'First Play Store screenshot',
          recommended: '1080x1920px, PNG',
          currentPath: '/assets/playstore/1.png'
        },
        {
          key: 'playStoreImage2',
          label: 'Play Store Screenshot 2',
          description: 'Second Play Store screenshot',
          recommended: '1080x1920px, PNG',
          currentPath: '/assets/playstore/2.png'
        },
        {
          key: 'playStoreImage3',
          label: 'Play Store Screenshot 3',
          description: 'Third Play Store screenshot',
          recommended: '1080x1920px, PNG',
          currentPath: '/assets/playstore/3.png'
        },
        {
          key: 'playStoreImage4',
          label: 'Play Store Screenshot 4',
          description: 'Fourth Play Store screenshot',
          recommended: '1080x1920px, PNG',
          currentPath: '/assets/playstore/4.png'
        },
        {
          key: 'playStoreBanner',
          label: 'Play Store Banner',
          description: 'Banner image for Play Store',
          recommended: '1024x500px, PNG',
          currentPath: '/assets/playstore/banner.png'
        },
        {
          key: 'playStoreIcon',
          label: 'Play Store Icon',
          description: 'App icon for Play Store',
          recommended: '512x512px, PNG',
          currentPath: '/assets/playstore/icon.png'
        },
        {
          key: 'googlePlayBadge',
          label: 'Google Play Badge',
          description: 'Google Play download badge',
          recommended: '646x250px, PNG',
          currentPath: '/assets/playstore/googleplay.png'
        }
      ]
    },
    {
      title: 'Download Page Assets',
      icon: '⬇️',
      assets: [
        {
          key: 'downloadAsset1',
          label: 'Download Asset 1',
          description: 'First download page asset',
          recommended: '600x400px, PNG',
          currentPath: '/assets/assets/asset1.png'
        },
        {
          key: 'downloadAsset2',
          label: 'Download Asset 2',
          description: 'Second download page asset',
          recommended: '600x400px, PNG',
          currentPath: '/assets/assets/asset2.png'
        },
        {
          key: 'downloadAsset3',
          label: 'Download Asset 3',
          description: 'Third download page asset',
          recommended: '600x400px, PNG',
          currentPath: '/assets/assets/Asset 3.png'
        },
        {
          key: 'playStoreWebImg',
          label: 'Play Store Web Image',
          description: 'Play Store web version image',
          recommended: '400x300px, WebP',
          currentPath: '/assets/img/playstore.webp'
        },
        {
          key: 'appStoreWebImg',
          label: 'App Store Web Image',
          description: 'App Store web version image',
          recommended: '400x300px, PNG',
          currentPath: '/assets/img/appstore.png'
        }
      ]
    },
    {
      title: 'Conversion Assets',
      icon: '🔄',
      assets: [
        {
          key: 'bitcoinConvert',
          label: 'Bitcoin Convert Image',
          description: 'Bitcoin image for conversion',
          recommended: '100x100px, PNG',
          currentPath: '/assets/img/BitCoin.png'
        },
        {
          key: 'zeroTradingFees',
          label: 'Zero Trading Fees',
          description: 'Zero trading fees illustration',
          recommended: '200x200px, PNG',
          currentPath: '/assets/img/Convert_1-removebg-preview.png'
        },
        {
          key: 'noSlippage',
          label: 'No Slippage',
          description: 'No slippage illustration',
          recommended: '200x200px, PNG',
          currentPath: '/assets/img/convert-2-removebg-preview.png'
        },
        {
          key: 'morePairs',
          label: 'More Pairs',
          description: 'More trading pairs illustration',
          recommended: '200x200px, PNG',
          currentPath: '/assets/img/convert-3-removebg-preview.png'
        }
      ]
    },
    {
      title: 'Affiliate Assets',
      icon: '🤝',
      assets: [
        {
          key: 'affiliateJoin1',
          label: 'Affiliate Join Image 1',
          description: 'First affiliate join us image',
          recommended: '300x200px, PNG',
          currentPath: '/assets/img/affiliate-join-us-1.png'
        },
        {
          key: 'affiliateJoin2',
          label: 'Affiliate Join Image 2',
          description: 'Second affiliate join us image',
          recommended: '300x200px, PNG',
          currentPath: '/assets/img/affiliate-join-us-2.png'
        },
        {
          key: 'affiliateJoin3',
          label: 'Affiliate Join Image 3',
          description: 'Third affiliate join us image',
          recommended: '300x200px, PNG',
          currentPath: '/assets/img/affiliate-join-us-3.png'
        },
        {
          key: 'howItWorks1',
          label: 'How It Works Image 1',
          description: 'First how it works image',
          recommended: '300x200px, PNG',
          currentPath: '/assets/img/how-it-works-1.png'
        },
        {
          key: 'howItWorks2',
          label: 'How It Works Image 2',
          description: 'Second how it works image',
          recommended: '300x200px, PNG',
          currentPath: '/assets/img/how-it-works-2.png'
        },
        {
          key: 'howItWorks3',
          label: 'How It Works Image 3',
          description: 'Third how it works image',
          recommended: '300x200px, PNG',
          currentPath: '/assets/img/how-it-works-3.png'
        }
      ]
    },
    {
      title: 'Referral Assets',
      icon: '👥',
      assets: [
        {
          key: 'referralImage1',
          label: 'Referral Image 1',
          description: 'First referral program image',
          recommended: '400x300px, WebP',
          currentPath: '/assets/referral/0DEDDD03AB730CD5.webp'
        },
        {
          key: 'referralImage2',
          label: 'Referral Image 2',
          description: 'Second referral program image',
          recommended: '400x300px, WebP',
          currentPath: '/assets/referral/D664C8EB85A43D97.webp'
        },
        {
          key: 'referralImage3',
          label: 'Referral Image 3',
          description: 'Third referral program image',
          recommended: '400x300px, WebP',
          currentPath: '/assets/referral/F5935075AB7CA066.webp'
        },
        {
          key: 'inviteImage',
          label: 'Invite Image',
          description: 'Invite friends image',
          recommended: '400x300px, WebP',
          currentPath: '/assets/referral/invite.webp'
        }
      ]
    },
    {
      title: 'Campaign Assets',
      icon: '🎯',
      assets: [
        {
          key: 'campaignImage',
          label: 'Campaign Center Image',
          description: 'Campaign center main image',
          recommended: '300x300px, PNG',
          currentPath: '/assets/campaign/4CB74EBAAA39B076.png'
        }
      ]
    },
    {
      title: 'Earn Assets',
      icon: '💰',
      assets: [
        {
          key: 'earnOverviewAsset',
          label: 'Earn Overview Asset',
          description: 'Earn overview main image',
          recommended: '600x400px, PNG',
          currentPath: '/assets/assets/Earn overview asset.png'
        },
        {
          key: 'simpleEarnAsset',
          label: 'Simple Earn Asset',
          description: 'Simple earn main image',
          recommended: '600x400px, PNG',
          currentPath: '/assets/assets/Simple Earn Asset.png'
        },
        {
          key: 'earnIcon',
          label: 'Earn Icon',
          description: 'Earn feature icon',
          recommended: '64x64px, SVG',
          currentPath: '/assets/assets/earn-icon.svg'
        }
      ]
    },
    {
      title: 'Trading Assets',
      icon: '📈',
      assets: [
        {
          key: 'tradingAsset',
          label: 'Trading Asset',
          description: 'General trading asset',
          recommended: '600x400px, WebP',
          currentPath: '/assets/assets/411B1865A7B26122.webp'
        },
        {
          key: 'getStartedAsset',
          label: 'Get Started Asset',
          description: 'Get started section image',
          recommended: '600x400px, PNG',
          currentPath: '/assets/assets/Get Started Asset (1).png'
        },
        {
          key: 'noRecordsFound',
          label: 'No Records Found',
          description: 'No records found illustration',
          recommended: '300x300px, WebP',
          currentPath: '/assets/img/no-records-found.webp'
        }
      ]
    },
    {
      title: 'FAQ Assets',
      icon: '❓',
      assets: [
        {
          key: 'depositAsset1',
          label: 'Deposit Guide Asset 1',
          description: 'How to make a deposit - step 1',
          recommended: '600x400px, PNG',
          currentPath: '/assets/assets/ASSET 1 (1).png'
        },
        {
          key: 'depositAsset2',
          label: 'Deposit Guide Asset 2',
          description: 'How to make a deposit - step 2',
          recommended: '600x400px, PNG',
          currentPath: '/assets/assets/ASSET 2 (1).png'
        },
        {
          key: 'depositAsset4',
          label: 'Deposit Guide Asset 4',
          description: 'Why deposit not received',
          recommended: '600x400px, PNG',
          currentPath: '/assets/assets/ASSET 4.png'
        },
        {
          key: 'depositAsset5',
          label: 'Deposit Guide Asset 5',
          description: 'How to find deposit address',
          recommended: '600x400px, PNG',
          currentPath: '/assets/assets/ASSET 5.png'
        }
      ]
    },
    {
      title: 'General Assets',
      icon: '📁',
      assets: [
        {
          key: 'defaultImage',
          label: 'Default Image',
          description: 'Default placeholder image',
          recommended: '300x300px, PNG',
          currentPath: '/assets/assets/default.png'
        },
        {
          key: 'comingSoonImage',
          label: 'Coming Soon Image',
          description: 'Coming soon placeholder',
          recommended: '400x300px, PNG',
          currentPath: '/assets/img/coming-soon.png'
        },
        {
          key: 'rewardsIcon',
          label: 'Rewards Icon',
          description: 'Rewards feature icon',
          recommended: '64x64px, SVG',
          currentPath: '/public/images/rewards-icon.svg'
        },
        {
          key: 'referralIllustration',
          label: 'Referral Illustration',
          description: 'Referral program illustration',
          recommended: '400x300px, SVG',
          currentPath: '/public/images/referral-illustration.svg'
        }
      ]
    },
    {
      title: 'Sponsor Logos',
      icon: '🏢',
      assets: [
        {
          key: 'sponsor1',
          label: 'Sponsor 1 PNG',
          description: 'First sponsor logo (PNG)',
          recommended: '200x100px, PNG',
          currentPath: '/assets/sponsor1.png'
        },
        {
          key: 'sponsor1WebP',
          label: 'Sponsor 1 WebP',
          description: 'First sponsor logo (WebP)',
          recommended: '200x100px, WebP',
          currentPath: '/assets/sponsor1.webp'
        },
        {
          key: 'sponsor2',
          label: 'Sponsor 2 PNG',
          description: 'Second sponsor logo (PNG)',
          recommended: '200x100px, PNG',
          currentPath: '/assets/sponsor2.png'
        },
        {
          key: 'sponsor2WebP',
          label: 'Sponsor 2 WebP',
          description: 'Second sponsor logo (WebP)',
          recommended: '200x100px, WebP',
          currentPath: '/assets/sponsor2.webp'
        },
        {
          key: 'sponsor3',
          label: 'Sponsor 3 PNG',
          description: 'Third sponsor logo (PNG)',
          recommended: '200x100px, PNG',
          currentPath: '/assets/sponsor3.png'
        },
        {
          key: 'sponsor3WebP',
          label: 'Sponsor 3 WebP',
          description: 'Third sponsor logo (WebP)',
          recommended: '200x100px, WebP',
          currentPath: '/assets/sponsor3.webp'
        }
      ]
    }
  ];

  // Initialize refs for all assets
  assetCategories.forEach(category => {
    category.assets.forEach(asset => {
      if (!fileInputRefs[asset.key]) {
        fileInputRefs[asset.key] = useRef(null);
      }
    });
  });

  const handleFileSelect = async (assetKey, file) => {
    if (!file) return;

    setUploading(prev => ({ ...prev, [assetKey]: true }));

    try {
      const dataUrl = await uploadFile(file, 'assets');
      
      // Handle different asset types and update config accordingly
      if (assetKey.startsWith('sponsor')) {
        const sponsors = [...safeConfig.assets.sponsors];
        if (assetKey === 'sponsor1') sponsors[0] = dataUrl;
        else if (assetKey === 'sponsor1WebP') sponsors[1] = dataUrl;
        else if (assetKey === 'sponsor2') sponsors[2] = dataUrl;
        else if (assetKey === 'sponsor2WebP') sponsors[3] = dataUrl;
        else if (assetKey === 'sponsor3') sponsors[4] = dataUrl;
        else if (assetKey === 'sponsor3WebP') sponsors[5] = dataUrl;
        updateConfig('assets', 'sponsors', sponsors);
      } else if (assetKey.startsWith('appStore')) {
        const appStoreImages = [...safeConfig.assets.appStoreImages];
        const index = parseInt(assetKey.replace('appStoreImage', '')) - 1;
        if (assetKey === 'appStoreIcon') appStoreImages[4] = dataUrl;
        else appStoreImages[index] = dataUrl;
        updateConfig('assets', 'appStoreImages', appStoreImages);
      } else if (assetKey.startsWith('playStore')) {
        const playStoreImages = [...safeConfig.assets.playStoreImages];
        if (assetKey === 'playStoreImage1') playStoreImages[0] = dataUrl;
        else if (assetKey === 'playStoreImage2') playStoreImages[1] = dataUrl;
        else if (assetKey === 'playStoreImage3') playStoreImages[2] = dataUrl;
        else if (assetKey === 'playStoreImage4') playStoreImages[3] = dataUrl;
        else if (assetKey === 'playStoreBanner') playStoreImages[4] = dataUrl;
        else if (assetKey === 'googlePlayBadge') playStoreImages[5] = dataUrl;
        else if (assetKey === 'playStoreIcon') playStoreImages[6] = dataUrl;
        updateConfig('assets', 'playStoreImages', playStoreImages);
      } else {
        // Handle individual assets
        updateConfig('assets', assetKey, dataUrl);
      }
    } catch (error) {
      alert('Failed to upload asset: ' + error.message);
    } finally {
      setUploading(prev => ({ ...prev, [assetKey]: false }));
    }
  };

  const handleDrop = (e, assetKey) => {
    e.preventDefault();
    e.stopPropagation();
    setDragStates(prev => ({ ...prev, [assetKey]: false }));
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(assetKey, imageFile);
    }
  };

  const handleDragOver = (e, assetKey) => {
    e.preventDefault();
    e.stopPropagation();
    setDragStates(prev => ({ ...prev, [assetKey]: true }));
  };

  const handleDragLeave = (e, assetKey) => {
    e.preventDefault();
    e.stopPropagation();
    setDragStates(prev => ({ ...prev, [assetKey]: false }));
  };

  const getAssetValue = (assetKey) => {
    // Handle different asset types
    if (assetKey.startsWith('sponsor')) {
      if (assetKey === 'sponsor1') return safeConfig.assets.sponsors[0];
      else if (assetKey === 'sponsor1WebP') return safeConfig.assets.sponsors[1];
      else if (assetKey === 'sponsor2') return safeConfig.assets.sponsors[2];
      else if (assetKey === 'sponsor2WebP') return safeConfig.assets.sponsors[3];
      else if (assetKey === 'sponsor3') return safeConfig.assets.sponsors[4];
      else if (assetKey === 'sponsor3WebP') return safeConfig.assets.sponsors[5];
    } else if (assetKey.startsWith('appStore')) {
      if (assetKey === 'appStoreIcon') return safeConfig.assets.appStoreImages[4];
      const index = parseInt(assetKey.replace('appStoreImage', '')) - 1;
      return safeConfig.assets.appStoreImages[index];
    } else if (assetKey.startsWith('playStore') || assetKey === 'googlePlayBadge') {
      if (assetKey === 'playStoreImage1') return safeConfig.assets.playStoreImages[0];
      else if (assetKey === 'playStoreImage2') return safeConfig.assets.playStoreImages[1];
      else if (assetKey === 'playStoreImage3') return safeConfig.assets.playStoreImages[2];
      else if (assetKey === 'playStoreImage4') return safeConfig.assets.playStoreImages[3];
      else if (assetKey === 'playStoreBanner') return safeConfig.assets.playStoreImages[4];
      else if (assetKey === 'googlePlayBadge') return safeConfig.assets.playStoreImages[5];
      else if (assetKey === 'playStoreIcon') return safeConfig.assets.playStoreImages[6];
    }
    
    return safeConfig.assets[assetKey];
  };

  const removeAsset = (assetKey) => {
    // Handle different asset types
    if (assetKey.startsWith('sponsor')) {
      const sponsors = [...safeConfig.assets.sponsors];
      if (assetKey === 'sponsor1') sponsors[0] = '';
      else if (assetKey === 'sponsor1WebP') sponsors[1] = '';
      else if (assetKey === 'sponsor2') sponsors[2] = '';
      else if (assetKey === 'sponsor2WebP') sponsors[3] = '';
      else if (assetKey === 'sponsor3') sponsors[4] = '';
      else if (assetKey === 'sponsor3WebP') sponsors[5] = '';
      updateConfig('assets', 'sponsors', sponsors);
    } else if (assetKey.startsWith('appStore')) {
      const appStoreImages = [...safeConfig.assets.appStoreImages];
      if (assetKey === 'appStoreIcon') appStoreImages[4] = '';
      else {
        const index = parseInt(assetKey.replace('appStoreImage', '')) - 1;
        appStoreImages[index] = '';
      }
      updateConfig('assets', 'appStoreImages', appStoreImages);
    } else if (assetKey.startsWith('playStore') || assetKey === 'googlePlayBadge') {
      const playStoreImages = [...safeConfig.assets.playStoreImages];
      if (assetKey === 'playStoreImage1') playStoreImages[0] = '';
      else if (assetKey === 'playStoreImage2') playStoreImages[1] = '';
      else if (assetKey === 'playStoreImage3') playStoreImages[2] = '';
      else if (assetKey === 'playStoreImage4') playStoreImages[3] = '';
      else if (assetKey === 'playStoreBanner') playStoreImages[4] = '';
      else if (assetKey === 'googlePlayBadge') playStoreImages[5] = '';
      else if (assetKey === 'playStoreIcon') playStoreImages[6] = '';
      updateConfig('assets', 'playStoreImages', playStoreImages);
    } else {
      updateConfig('assets', assetKey, '');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <span className="text-xl">📁</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Comprehensive Asset Management</h2>
            <p className="text-green-200 text-sm">Manage all assets used throughout your application</p>
          </div>
        </div>
        
        {/* Enhanced Guidelines */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-300 mb-2">📋 Asset Guidelines & Usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-200">
            <ul className="space-y-1">
              <li>• Use high-resolution images for crisp display</li>
              <li>• Optimize file sizes for web performance</li>
              <li>• PNG format for transparency, JPG for photos</li>
              <li>• WebP format for best compression</li>
            </ul>
            <ul className="space-y-1">
              <li>• SVG format ideal for icons and logos</li>
              <li>• Maintain consistent aspect ratios</li>
              <li>• Consider dark/light theme compatibility</li>
              <li>• Test on different screen sizes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Asset Categories */}
      {assetCategories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <span className="mr-2">{category.icon}</span>
              {category.title}
            </h3>
            <p className="text-gray-400 text-sm mt-1">{category.assets.length} assets in this category</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {category.assets.map(asset => {
                const currentAsset = getAssetValue(asset.key);
                const isUploading = uploading[asset.key];
                const isDragging = dragStates[asset.key];

                return (
                  <div key={asset.key} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                    {/* Asset Header */}
                    <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{asset.label}</h4>
                          <p className="text-gray-400 text-xs truncate">{asset.description}</p>
                          <p className="text-gray-500 text-xs mt-1">Current: {asset.currentPath}</p>
                        </div>
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded ml-2 flex-shrink-0">
                          {asset.recommended}
                        </span>
                      </div>
                    </div>

                    {/* Upload/Preview Area */}
                    <div className="p-4">
                      <div
                        className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${
                          isDragging
                            ? 'border-green-500 bg-green-500/10'
                            : currentAsset
                            ? 'border-gray-600 bg-gray-800/50'
                            : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
                        }`}
                        onClick={() => fileInputRefs[asset.key]?.current?.click()}
                        onDrop={(e) => handleDrop(e, asset.key)}
                        onDragOver={(e) => handleDragOver(e, asset.key)}
                        onDragLeave={(e) => handleDragLeave(e, asset.key)}
                      >
                        {currentAsset ? (
                          /* Asset Preview */
                          <div className="p-4">
                            <div className="flex items-center justify-center mb-3">
                              <div className="bg-transparent rounded-lg p-2 shadow-lg">
                                <img
                                  src={currentAsset}
                                  alt={asset.label}
                                  className="max-h-24 max-w-32 object-contain"
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fileInputRefs[asset.key]?.current?.click();
                                }}
                                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
                              >
                                <span>📁</span>
                                <span>Replace</span>
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeAsset(asset.key);
                                }}
                                className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
                              >
                                <span>🗑️</span>
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Upload Zone */
                          <div className="p-6 text-center cursor-pointer">
                            {isUploading ? (
                              <div className="flex flex-col items-center space-y-3">
                                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-400 text-sm">Uploading...</p>
                              </div>
                            ) : (
                              <>
                                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                                  <span className="text-xl text-gray-500">📁</span>
                                </div>
                                <h5 className="text-white font-medium mb-2">Upload {asset.label}</h5>
                                <p className="text-gray-400 text-sm mb-3">Click or drag file here</p>
                                <p className="text-xs text-gray-500">Supports PNG, JPG, SVG, WebP</p>
                              </>
                            )}
                          </div>
                        )}

                        <input
                          ref={fileInputRefs[asset.key]}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileSelect(asset.key, e.target.files[0])}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {/* Asset Usage Preview Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">👁️</span>
            Asset Usage Preview
          </h3>
          <p className="text-gray-400 text-sm mt-1">See how your assets appear in different contexts</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Login Background Preview */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Login Background Usage</h4>
            <div 
              className="h-48 rounded-lg flex items-center justify-center relative overflow-hidden"
              style={{
                backgroundImage: `url(${safeConfig.assets.loginBackground || '/assets/login/login.png'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/50"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center">
                <h5 className="text-gray-900 font-semibold mb-2">Login Form</h5>
                <p className="text-gray-700 text-sm">Your login background appears here</p>
              </div>
            </div>
          </div>

          {/* Sponsors Bar Preview */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Sponsors Display</h4>
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex flex-wrap items-center justify-center gap-6">
                {safeConfig.assets.sponsors.filter(s => s).length > 0 ? (
                  safeConfig.assets.sponsors.filter(s => s).map((sponsor, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 shadow-lg">
                      <img 
                        src={sponsor} 
                        alt={`Sponsor ${index + 1}`} 
                        className="h-8 object-contain"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No sponsors uploaded yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Hero Background Preview */}
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Hero Background Usage</h4>
            <div 
              className="h-48 rounded-lg flex items-center justify-center relative overflow-hidden"
              style={{
                backgroundImage: `url(${safeConfig.assets.heroBackground || '/assets/homepage/background.png'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="relative text-center text-white">
                <h5 className="text-2xl font-bold mb-2">Welcome to {safeConfig.names.siteName || 'KINE'}</h5>
                <p className="text-lg">{safeConfig.names.tagline || 'Your trusted crypto partner'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetManager; 