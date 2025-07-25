import React, { useRef, useState } from 'react';
import fcmImg from './assets/FCM.png';
import aerImg from './assets/AER.png';
import awdImg from './assets/AWD.png';
import fcsImg from './assets/FCS.png';
import iaImg from './assets/IA.png';
import rrwImg from './assets/RRW.png';
import docIcon from './assets/docsIcon.png';      // Use your provided icon images
import brushIcon from './assets/PaintIcon.png';
import gearIcon from './assets/settingsIcon.png';
import moduleBanner from './assets/modules-banner.png';
import unlockBanner from './assets/unlock-banner.png';
import shippingImg from './assets/shipping.png';
import paymentImg from './assets/payment.png';
import smartImg from './assets/smart.png';
import storeImg from './assets/store.png';
import brandingImg from './assets/branding.png';
import supportImg from './assets/support.png';
import dokanAiBanner from './assets/DokanAi.png';
import iftsyImg from "./assets/iftsy.png";
import bidCuriousImg from './assets/bidCurious.png';
import bootstrapImg from './assets/bootstrap.png';
import designAddictImg from './assets/designAddict.png';
import parsiankalaImg from './assets/parsiankala.png';
import zakartoImg from './assets/zakarto.png';
import { Check, MoveLeft, MoveRight, Crown } from 'lucide-react';
import avatar1 from './assets/Avatar1.png';
import avatar2 from './assets/Avatar2.png';
import avatar3 from './assets/Avatar3.png';
import avatar4 from './assets/Avatar4.png';
import avatar5 from './assets/Avatar5.png';
import avatar6 from './assets/Avatar6.png';
import avatar7 from './assets/Avatar7.png';
import avatar8 from './assets/Avatar8.png';
import avatar9 from './assets/Avatar9.png';
import avatar10 from './assets/Avatar10.png';
import avatar11 from './assets/Avatar11.png';
import g2Logo from './assets/g2Logo.png';
import trustpilotLogo from './assets/trustpilotLogo.png';
import capterraLogo from './assets/capterraLogo.png';
import wordpressLogo from './assets/wordpressLogo.png';
import scaleImg from './assets/scale.png';
import unlockBannerMobile from './assets/unlock-banner-mobile.png';
import unlockBannerTablet from './assets/unlock-banner-tablet.png';


function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true); // Set to true to match your annual image

  const pricingPlans = [
    {
      name: 'Starter',
      annualPrice: '$149',
      lifetimePrice: '$745',
      features: ['Essential Features', '3 Premium Modules', '1 Site License', 'Ticket Based Support'],
      isPopular: false
    },
    {
      name: 'Professional',
      annualPrice: '$249',
      lifetimePrice: '$1245',
      features: ['Everything in Starter', '23 Premium Modules', '3 Sites Licenses', 'Ticket Based Support'],
      isPopular: false
    },
    {
      name: 'Business',
      annualPrice: '$499',
      lifetimePrice: '$2495',
      features: ['Everything in Professional', '39 Premium Modules', '5 Sites Licenses', 'Ticket Based Support'],
      isPopular: true
    },
    {
      name: 'Enterprise',
      annualPrice: '$999',
      lifetimePrice: '$4995',
      features: ['Everything in Business', '39 Premium Modules', '10 Sites Licenses', 'Priority Support', '2 Hours of Theme Compatibility & Installation'],
      isPopular: false
    }
  ];

  return (
    <div className="w-full max-w-none mx-auto px-0 py-0 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm" style={{ width: '1024px', height: '580.56px', margin: '0 auto' }}>
        {/* Header */}
        <div className="text-center pt-8 pb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            The Packages We Provide
          </h2>
          <p className="text-gray-600 mb-6">
            Get 20% instant off in all packages with coupon code <span className="font-semibold">LITEUPGRADE20</span>
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center mb-2 md:mb-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 md:py-3 rounded-md text-sm md:text-base font-medium transition-all ${
                  isAnnual ? 'bg-[#7047EB] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual
              </button>
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 md:py-3 rounded-md text-sm md:text-base font-medium transition-all ${
                  !isAnnual ? 'bg-[#7047EB] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lifetime
              </button>
            </div>
            {!isAnnual && (
              <span className="ml-4 text-sm md:text-base text-[#7047EB] bg-[#f3efff] px-3 py-1 md:py-2 rounded-full">
                Save More 20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="flex justify-center gap-4 px-8 pb-8">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-xl p-4 bg-white flex flex-col ${
                plan.isPopular
                  ? 'border-2 border-[#7047EB] shadow-lg'
                  : 'border border-gray-200 hover:shadow-md'
              }`}
              style={{
                width: '241px',
                height: '313px',
                background: plan.name === 'Starter' || plan.name === 'Business'
                  ? 'linear-gradient(214.33deg, rgba(234, 248, 255, 0.7) 3.79%, #FFFFFF 60.72%)'
                  : 'linear-gradient(214.33deg, rgba(255, 250, 239, 0.7) 3.79%, #FFFFFF 60.72%)'
              }}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  {plan.isPopular && (
                    <span className="bg-[#EFEAFF] text-[#7047EB] px-2 py-1 rounded-full text-xs font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {isAnnual ? plan.annualPrice : plan.lifetimePrice}
                  </span>
                  <span className="text-sm text-gray-500">
                    {isAnnual ? 'Annually' : 'Lifetime'}
                  </span>
                </div>
              </div>

              <div className="mb-4 space-y-2 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#7047EB] mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-700 leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                className="bg-[#7047EB] text-white hover:bg-[#5d39c4] transition-colors flex items-center justify-center"
                style={{
                  width: '201px',
                  height: '28px',
                  borderRadius: '5px',
                  paddingTop: '6px',
                  paddingRight: '15px',
                  paddingBottom: '6px',
                  paddingLeft: '15px',
                  gap: '6px',
                  opacity: 1,
                }}
              >
                <span
                  style={{
                    width: '52px',
                    height: '16px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontStyle: 'normal',
                    fontSize: '12px',
                    lineHeight: '16px',
                    letterSpacing: '0%',
                    textAlign: 'center',
                    opacity: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  Buy Now
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


const tabs = ['Marketplace', 'Testimonial'];

const marketplaces = [
  {
    name: 'Ifesty',
    country: 'Brazil',
    flag: '🇧🇷',
    img: iftsyImg,
  },
  {
    name: 'BidCurios',
    country: 'India',
    flag: '🇮🇳',
    img: bidCuriousImg,
  },
  {
    name: 'Bootstrap',
    country: 'USA',
    flag: '🇺🇸',
    img: bootstrapImg,
  },
  {
    name: 'Parsiankala',
    country: 'USA',
    flag: '🇺🇸',
    img: parsiankalaImg,
  },
  {
    name: 'DesignAddict',
    country: 'USA',
    flag: '🇺🇸',
    img: designAddictImg,
  },
  {
    name: 'Zakarto',
    country: 'USA',
    flag: '🇺🇸',
    img: zakartoImg,
  }
];

const testimonials = [
  {
    name: 'christian d.',
    role: 'SEO, Small business',
    content: "As a Webmaster in Argentina for 25+ years, I’ve tested all the multi-vendor WordPress plugins and this is by far the best.",
    img: avatar1,
    logo: g2Logo
  },
  {
    name: 'upcodestudios',
    role: 'Self-employed',
    content: 'Dokan is the best multivendor solution I’ve seen in 10 years of web development.',
    img: avatar2,
    logo: wordpressLogo
  },
  {
    name: 'Jonathan D.',
    role: 'Sales assistant Retail',
    content: 'Dokan made my dream a reality. For a small yearly cost, it offers features worth thousandsa true game-changer.',
    img: avatar3,
    logo: capterraLogo
  },
  {
    name: 'Neels V.',
    role: 'Founder, Small business',
    content: 'Perfect for adding services offerings to WooCommerce.',
    img: avatar4,
    logo: g2Logo
  },
  {
    name: 'asmaraldn',
    role: 'Self-employed',
    content: 'Dokan Lite has been a game-changer for my marketplace!',
    img: avatar5,
    logo: wordpressLogo
  },
  {
    name: 'Melvin R',
    role: 'Desarrollador web',
    content: 'If you want the ease of WordPress with WooCommerce’s flexibility, this is the best plugin out there.',
    img: avatar6,
    logo: capterraLogo
  },
  {
    name: 'cheazeh',
    role: 'Self-employed',
    content: 'Been using it for over a yearhands down, the best!',
    img: avatar7,
    logo: wordpressLogo
  },
  {
    name: 'Karisa Joshua',
    role: 'Self-employed',
    content: 'Incredible experience with Dokan’s serviceprofessional, kind, and truly went above and beyond.',
    img: avatar8,
    logo: trustpilotLogo
  },
  {
    name: 'Corrado G.',
    role: 'Titolare',
    content: 'Dokan has improved a lot over the years and made it easy for me to build a marketplace.',
    img: avatar9,
    logo: capterraLogo
  },
  {
    name: 'Omar Wyllie',
    role: 'St. Vincent & Grenadines',
    content: 'Just installed a few hours agooff to a good start! Support was fast and helpful via live chat.',
    img: avatar10,
    logo: trustpilotLogo
  },
  {
    name: 'franklinlucas',
    role: 'Self-employed',
    content: 'Amazing plugin. Easy to use and very well-organized team.',
    img: avatar11,
    logo: wordpressLogo
  }
];

function DokanMarketplaceUI() {
  const [activeTab, setActiveTab] = useState('Marketplace');
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const data = activeTab === 'Marketplace' ? marketplaces : testimonials;

  return (
    <section className="w-full px-4 md:px-6 py-8">
      <div className="flex justify-center items-center gap-8 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-base md:text-lg font-medium transition relative ${
              activeTab === tab ? 'text-purple-700' : 'text-gray-500'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute left-0 -bottom-1 h-[2px] w-full bg-purple-700" />
            )}
          </button>
        ))}
      </div>
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold inline-block">
          {activeTab === 'Marketplace'
            ? 'Dokan Powered Marketplace Across the Globe'
            : 'Great People, Great Minds Choose Dokan'}
        </h2>
      </div>

      <div className="flex justify-end mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
          >
            <MoveLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
          >
            <MoveRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="overflow-x-auto flex gap-6 px-6 pb-2 scroll-smooth snap-x scrollbar-hide"
        >
          {data.map((item, index) => (
            <div
              key={index}
              className="relative min-w-[260px] max-w-[280px] bg-white rounded-xl border p-4 snap-start shrink-0"
            >
              {activeTab === 'Marketplace' ? (
                <div className="space-y-4">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="rounded-lg w-full h-40 object-cover"
                  />
                  <h4 className="text-lg font-semibold">{item.name}</h4>
                  {item.country && (
                    <span className="absolute bottom-4 right-4 text-xs text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                      {item.country} {item.flag}
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-3 h-full flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-base font-semibold">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-snug flex-1">{item.content}</p>
                  <div className="flex justify-between items-center">
                    <div className="w-12 h-6">
                      <img src={item.logo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-purple-500">★</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeatureData {
  features: string[];
  lite: boolean[];
  pro: boolean[];
}

interface Category {
  title: string;
  key: string;
}

const categories: Category[] = [
  { title: 'Vendor & Product Management', key: 'vendor' },
  { title: 'Payment & Commission Systems', key: 'payment' },
  { title: 'Sales, Orders & Customer Support', key: 'sales' },
  { title: 'Marketing, SEO & Compliance', key: 'marketing' },
  { title: 'Migration, Integration & Support', key: 'migration' },
];

const featureData: Record<string, FeatureData> = {
  vendor: {
    features: [
      'Frontend Dashboard for Vendors',
      'Frontend Simple Product',
      'Frontend Variable Products',
      'Individual Vendor Stores',
      'Product Bulk Edit',
      'Single Product Multivendor',
      'WC Booking Integration',
      'WC Auction Integration',
      'Wholesale',
    ],
    lite: [true, true, true, true, false, false, false, false, false],
    pro: [true, true, true, true, true, true, true, true, true],
  },
  payment: {
    features: ['Payment Gateway Integration', 'Commission Management', 'Automated Withdrawals'],
    lite: [true, true, false],
    pro: [true, true, true],
  },
  sales: {
    features: ['Order Tracking', 'Customer Support Ticket System', 'Refund Management'],
    lite: [true, true, false],
    pro: [true, true, true],
  },
  marketing: {
    features: ['SEO Tools', 'Marketing Campaigns', 'Compliance Reports'],
    lite: [true, false, false],
    pro: [true, true, true],
  },
  migration: {
    features: ['Data Migration', 'API Integration', 'Technical Support'],
    lite: [true, true, true],
    pro: [true, true, true],
  },
};

const FeatureComparison: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>('vendor');
  const { features, lite, pro } = featureData[activeCategory];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Dokan Lite vs Dokan Pro
        </h2>
        <button className="text-sm font-medium text-purple-600 px-4 py-2 rounded-md hover:bg-purple-50 transition border border-purple-200">
          Explore All Features
        </button>
      </div>

      <div className="relative">
        <div className="flex rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
          {/* Sidebar */}
          <div className="flex flex-col bg-white min-w-[300px] p-4 space-y-2">
            {categories.map((category, index) => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`text-left transition-all duration-200 flex items-center justify-start px-6 py-6 rounded-2xl font-bold text-lg leading-tight ${
                  category.key === activeCategory 
                    ? 'bg-black text-white shadow-md' 
                    : 'bg-gray-50 text-gray-800 hover:bg-gray-100 hover:shadow-sm'
                }`}
              >
                <span className="block max-w-[200px]">
                  {category.title}
                </span>
              </button>
            ))}
          </div>

          {/* Feature Table */}
          <div className="flex-1 overflow-hidden">
            <div ref={scrollRef} className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Header */}
                <div className="grid grid-cols-3 bg-white">
                  <div className="px-8 py-6 text-lg font-bold text-gray-900 border-b-2 border-gray-100">
                    Features
                  </div>
                  <div className="px-8 py-6 text-lg font-bold text-gray-900 text-center bg-gray-50 border-b-2 border-gray-100">
                    Lite
                  </div>
                  <div className="px-8 py-6 text-lg font-bold text-gray-900 text-center bg-gray-50 border-b-2 border-gray-100">
                    Pro
                  </div>
                </div>

                {/* Feature Rows */}
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 bg-white hover:bg-gray-50 transition-colors group"
                  >
                    <div className="px-8 py-5 text-base text-gray-700 border-b border-gray-100 group-hover:text-gray-900">
                      {feature}
                    </div>
                    <div className="px-8 py-5 text-center bg-gray-50 border-b border-gray-100 flex items-center justify-center">
                      {lite[index] ? (
                        <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-600 text-white shadow-sm">
                          <Check size={16} className="stroke-2" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-200">
                          <Check size={16} className="stroke-2 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="px-8 py-5 text-center bg-gray-50 border-b border-gray-100 flex items-center justify-center">
                      {pro[index] ? (
                        <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-600 text-white shadow-sm">
                          <Check size={16} className="stroke-2" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-200">
                          <Check size={16} className="stroke-2 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function DokanAIBanner() {
    return (
        <div
            className="relative w-full h-[280px] rounded-2xl overflow-hidden"
        >
            {/* Background Image */}
            <img
                src={dokanAiBanner}
                alt="Dokan AI Banner"
                className="w-full h-full object-cover"
                draggable={false}
            />

            {/* Text Overlay */}
            <div className="absolute inset-0 flex items-center pl-10 pr-4">
                <div className="max-w-sm text-white">
                    <h2 className="text-white text-3xl font-bold mb-2">Dokan AI</h2>
                    <p className="text-base leading-relaxed opacity-90">
                        Generate product titles, descriptions, and images instantly with Dokan AI, powered by OpenAI and Gemini. Save time, look sharp, and sell smarter.
                    </p>
                </div>
            </div>
        </div>
    );
}

function WhySettle() {
    const features = [
        {
            icon: gearIcon,
            title: 'Extensive Plugin Support',
            description: 'Enhance your marketplace with hundreds of WordPress plugins designed for scalability.',
        },
        {
            icon: brushIcon,
            title: 'Hundreds of Themes Compatibility',
            description: 'Dokan supports all WooCommerce-compatible themes.',
        },
        {
            icon: docIcon,
            title: 'White Label Documentation',
            description: 'Get marketplace-specific docs crafted by the Dokan team to fit your business needs.',
        },
    ];

    return (
        <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Why Settle? Get More with Dokan PRO!</h2>
            {/* Modules Banner */}
            <div className="relative rounded-2xl overflow-hidden mb-10 min-h-[180px]">
                <img
                    src={moduleBanner}
                    alt="42+ Modules"
                    className="w-full h-full object-cover absolute inset-0"
                    style={{ minHeight: 200, maxHeight: 200 }}
                    draggable={false}
                />
                <div className="relative z-10 flex flex-col justify-center h-full px-8 py-8">
                    <h3 className="text-3xl font-bold text-white mb-2">42+ Modules</h3>
                    <p className="text-white text-base max-w-xs">
                        Access an extensive range of modules designed to enhance both admin and vendor experiences.
                    </p>
                </div>
            </div>
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start space-x-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-indigo-50 rounded-lg flex-shrink-0">
                            <img src={feature.icon} alt={feature.title} className="w-[36px] h-[36px] object-contain" />
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                            <p className="text-gray-600 text-sm">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ExceptionalFeatures() {
    const exceptional = [
        {
            icon: fcsImg,
            title: 'Flexible Commission Structure',
            description: 'Set commissions globally or customize them for vendors, categories, or products.',
        },
        {
            icon: aerImg,
            title: 'Admin & Earning Reports',
            description: 'Track daily, yearly, and vendor-specific earnings from a single dashboard.',
        },
        {
            icon: iaImg,
            title: 'Instant Announcements',
            description: "Send important announcements directly to sellers' dashboards for seamless communication.",
        },
        {
            icon: awdImg,
            title: 'Automatic Withdrawal Disbursement',
            description: 'Automate vendor withdrawals by setting a scheduled disbursement time for seamless transactions.',
        },
        {
            icon: rrwImg,
            title: 'Return , Refund & Warranty System',
            description: 'Allow vendors to set up customized refund and warranty policies for their customers.',
        },
        {
            icon: fcmImg,
            title: 'Flexible Coupon Management',
            description: 'Admins and vendors can create product or vendor-specific coupons with ease.',
        },
    ];

    return (
        <div className="mt-12">
            <h3 className="text-2xl font-bold mb-8">What Makes Pro Exceptional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {exceptional.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-indigo-50 rounded-lg mr-2 flex-shrink-0">
                            <img src={item.icon} alt={item.title} className="w-[36px] h-[36px] object-contain" />
                        </div>
                        <div>
                            <h4 className="text-[18px] font-bold text-gray-700 mb-2">{item.title}</h4>
                            <p className="text-gray-600 font-regular text-[14px]">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function GuaranteeSection() {
    return (
        <div className="w-full max-w-7xl mx-auto pt-10 pb-10" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* What Makes Dokan Stand Out */}
            <div>
                <h3 className="text-[24px] font-bold mb-8 text-gray-900">
                    What Makes Dokan Stand Out
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h4 className="text-[14px] font-semibold text-gray-600 mb-2">
                                14 Days Money Back Guarantee
                            </h4>
                            <p className="text-[12px] font-regular text-gray-400">
                                Get a full refund within 14 days if our plugin doesn't meet your needs—no questions asked!
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h4 className="text-[14px] font-semibold text-gray-600 mb-2">
                                Help Is Just a Click Away, Day or Night!
                            </h4>
                            <p className="text-[12px] font-regular text-gray-400">
                                Receive expert support 24/7 to keep your business running smoothly, anytime you need help.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h4 className="text-[14px] font-semibold text-gray-600 mb-2">
                                Regular Releases
                            </h4>
                            <p className="text-[12px] font-regular text-gray-400">
                                Stay ahead with frequent updates, new features, and enhancements to keep your marketplace running at its best.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ScaleMarketplaceBanner() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div 
        className="relative min-h-[200px] rounded-2xl overflow-hidden flex items-center justify-between px-8 py-10"
        style={{
          backgroundImage: `url(${scaleImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        
        {/* Content */}
        <div className="flex flex-col justify-center z-10 max-w-2xl">
          <h2 className="text-4xl font-bold mb-4 leading-tight text-white drop-shadow-lg">
            Ready to Scale Your Marketplace?
          </h2>
          <p className="text-lg text-white/90 drop-shadow">
            With all the advanced features you get it's hard to resist buying Dokan Pro.
          </p>
        </div>
        
        {/* Button */}
        <div className="z-10">
          <button className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded shadow hover:bg-yellow-300 transition flex items-center gap-2 text-base">
            Upgrade to Pro
            <Crown className="inline-block w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProFeatures() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Hero Banner */}
            <div
                className="relative min-h-[304px] rounded-2xl overflow-hidden flex items-center"
                style={{
                    background: `url(${unlockBanner}) center center / cover no-repeat`,
                }}
            >
                <div className="flex flex-col justify-center px-8 py-10 z-10 max-w-xl">
                    <h2 className="text-4xl font-bold mb-4 leading-tight text-white drop-shadow">
                        Unlock the Full Potential of<br />Your Marketplace!
                    </h2>
                    <p className="mb-6 text-base text-white/90 drop-shadow">
                        Upgrade to Dokan PRO for powerful vendor management, advanced admin controls, and built-in AI assistance. Enjoy exclusive features that simplify operations, boost sales, and scale your business effortlessly.
                    </p>
                    <div className="flex items-center gap-4">
                        <button className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded shadow hover:bg-yellow-300 transition flex items-center gap-2 text-base">
                            Upgrade to Pro
                            <Crown className="inline-block w-5 h-5 ml-1" />
                        </button>
                        <span className="text-white/80 font-medium text-base">with 20% off</span>
                    </div>
                </div>
            </div>

            {/* Features Slider */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-semibold mb-8">Curated Features for Your Thriving Marketplace</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => scroll('left')}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                        >
                            <MoveLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
                        >
                            <MoveRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>

            {/* Exceptional Features */}
            <div>
                <ExceptionalFeatures />
            </div>

            {/* Why Settle Section */}
            <div>
                <WhySettle />
            </div>

            {/* Dokan AI Banner */}
            <div>
                <DokanAIBanner />
            </div>

            {/* Dokan lite vs pro */}
            <div>
                <FeatureComparison />
            </div>

            {/* marketplace and testimonial section */}
            <DokanMarketplaceUI />

            {/* Pricing Section */}
            <div>
              <PricingSection />
            </div>

            {/* Guarantee Section */}
            <div>
                <GuaranteeSection />
            </div>

            {/* Scale Marketplace Banner */}
            <div>
                <ScaleMarketplaceBanner />
            </div>
        </div>
    );
}

const features = [
    {
        title: 'Effortless Shipping Management',
        description: 'Let vendors set flexible shipping rates by distance, weight, price, or items.',
        image: shippingImg,
    },
    {
        title: 'Popular Payment Gateways',
        description: 'Accept payments with popular gateways like PayPal, Stripe, Mangopay, Razorpay, and more.',
        image: paymentImg,
    },
    {
        title: 'Smart Product Management',
        description: 'Give vendors bulk edit tools, featured ads, and addons for smarter selling.',
        image: smartImg,
    },
    {
        title: 'Advanced Store Management',
        description: 'Increase engagement with store follows and builtin ticket based support.',
        image: storeImg,
    },
    {
        title: 'Customizable Branding',
        description: 'Customize vendor dashboards with unique colors and seamless theme support.',
        image: brandingImg,
    },
    {
        title: '24/7 Super Fast Premium Support',
        description: 'Enjoy 24/7 premium support from experts to keep your marketplace running smooth.',
        image: supportImg,
    }
];

function FeatureCard({ title, description, image }: { title: string, description: string, image: string }) {
    return (
        <div className="min-w-[258px] max-w-[258px] bg-white rounded-2xl shadow border flex-shrink-0 overflow-hidden flex flex-col">
            <div className="w-full h-[140px] bg-[#f5f6fa] flex items-center justify-center">
                <img
                    src={image}
                    alt={title}
                    className="object-contain w-full h-full"
                    draggable={false}
                />
            </div>
            <div className="p-5 flex flex-col flex-1">
                <h4 className="text-lg font-semibold mb-2">{title}</h4>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </div>
    );
}

export default ProFeatures;