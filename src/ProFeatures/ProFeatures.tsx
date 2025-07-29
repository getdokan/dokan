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
import moduleBannerMobile from './assets/modules-banner-mobile.png';
import moduleBannerTablet from './assets/modules-banner-tablet.png';
import unlockBanner from './assets/unlock-banner.png';
import unlockBannerMobile from './assets/unlock-banner-mobile.png';
import unlockBannerTablet from './assets/unlock-banner-tablet.png';
import shippingImg from './assets/shipping.png';
import paymentImg from './assets/payment.png';
import smartImg from './assets/smart.png';
import storeImg from './assets/store.png';
import brandingImg from './assets/branding.png';
import supportImg from './assets/support.png';
import dokanAiBanner from './assets/DokanAi.png';
import dokanAiBannerMobile from './assets/DokanAiMobile.png';
import dokanAiBannerTablet from './assets/DokanAiTablet.png';
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
import scaleMobileImg from './assets/scale-mobile.png';
import './FeatureComparison.css';


function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

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
    <div className="w-full bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center pt-8 pb-6 px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            The Packages We Provide
          </h2>
          <p className="text-gray-600 mb-6">
            Get 20% instant off in all packages with coupon code <span className="font-semibold">LITEUPGRADE20</span>
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  isAnnual ? 'bg-[#7047EB] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual
              </button>
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  !isAnnual ? 'bg-[#7047EB] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lifetime
              </button>
            </div>
            {!isAnnual && (
              <span className="ml-4 text-sm text-[#7047EB] bg-[#f3efff] px-3 py-1 rounded-full">
                Save More 20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards - Completely rewritten layout */}
        <div className="pb-12">
          {/* Mobile: 1 column */}
          <div className="block md:hidden px-6">
            <div className="space-y-6">
              {pricingPlans.map((plan, index) => (
                <div key={index} className="max-w-sm mx-auto">
                  <div 
                    className={`${
                      plan.isPopular
                        ? 'border-2 border-[#7047EB] shadow-lg'
                        : 'border border-gray-200'
                    } rounded-xl bg-white`}
                    style={{
                      background: plan.name === 'Starter' || plan.name === 'Business'
                        ? 'linear-gradient(214.33deg, rgba(234, 248, 255, 0.7) 3.79%, #FFFFFF 60.72%)'
                        : 'linear-gradient(214.33deg, rgba(255, 250, 239, 0.7) 3.79%, #FFFFFF 60.72%)'
                    }}
                  >
                    <div className="p-4">
                      {/* Package Header */}
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

                      {/* Features List */}
                      <div className="space-y-3 mb-4">
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[#7047EB] mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-700 leading-tight">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Buy Now Button */}
                      <button className="w-full bg-[#7047EB] text-white hover:bg-[#5d39c4] transition-colors rounded h-[28px] text-xs font-semibold">
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tablet: 2 columns, 2 rows (2x2 grid), 332x313 cards */}
          <div className="hidden md:block lg:hidden">
            <div className="max-w-4xl mx-auto px-4">
              <div className="grid grid-cols-2 gap-4 justify-items-center">
                {pricingPlans.map((plan, index) => (
                  <div key={index} className="w-[320px] h-[313px]">
                    <div 
                      className={`w-full h-full ${
                        plan.isPopular
                          ? 'border-2 border-[#7047EB] shadow-lg'
                          : 'border border-gray-200'
                      } rounded-xl bg-white`}
                      style={{
                        background: plan.name === 'Starter' || plan.name === 'Business'
                          ? 'linear-gradient(214.33deg, rgba(234, 248, 255, 0.7) 3.79%, #FFFFFF 60.72%)'
                          : 'linear-gradient(214.33deg, rgba(255, 250, 239, 0.7) 3.79%, #FFFFFF 60.72%)'
                      }}
                    >
                      <div className="p-4 h-full flex flex-col">
                        {/* Package Header */}
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

                        {/* Features List */}
                        <div className="flex-grow space-y-3">
                          {plan.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[#7047EB] mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-gray-700 leading-tight">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* Buy Now Button */}
                        <button className="w-full mt-4 bg-[#7047EB] text-white hover:bg-[#5d39c4] transition-colors rounded h-[28px] text-xs font-semibold">
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: 4 columns */}
          <div className="hidden lg:block px-8">
            <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <div key={index}>
                  <div 
                    className={`h-full ${
                      plan.isPopular
                        ? 'border-2 border-[#7047EB] shadow-lg'
                        : 'border border-gray-200'
                    } rounded-xl bg-white`}
                    style={{
                      background: plan.name === 'Starter' || plan.name === 'Business'
                        ? 'linear-gradient(214.33deg, rgba(234, 248, 255, 0.7) 3.79%, #FFFFFF 60.72%)'
                        : 'linear-gradient(214.33deg, rgba(255, 250, 239, 0.7) 3.79%, #FFFFFF 60.72%)'
                    }}
                  >
                    <div className="p-4 h-full flex flex-col">
                      {/* Package Header */}
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

                      {/* Features List */}
                      <div className="flex-grow space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[#7047EB] mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-700 leading-tight">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Buy Now Button */}
                      <button className="w-full mt-4 bg-[#7047EB] text-white hover:bg-[#5d39c4] transition-colors rounded h-[28px] text-xs font-semibold">
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


const tabs = ['Marketplace', 'Testimonial'];

// Interface for marketplace items
interface Marketplace {
  name: string;
  country: string;
  flag: string;
  img: string;
  siteLink: string;
}

function MarketplaceCard({ item }: { item: Marketplace }) {
  return (
    <div
      className="relative bg-white overflow-hidden"
      style={{
        width: '274.51px',
        height: '251px',
        borderRadius: '4.2px',
        border: '0.92px solid #E5E7EB',
        opacity: 1,
        transform: 'rotate(0deg)'
      }}
    >
      {/* Image Container */}
      <div
        className="overflow-hidden"
        style={{
          width: '273.94px',
          height: '188.49px',
          marginLeft: '0.06px',
          borderTopLeftRadius: '4.19px',
          borderTopRightRadius: '4.19px',
          border: '0.35px solid #E5E7EB'
        }}
      >
        <img
          src={item.img}
          alt={item.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <a
            href={item.siteLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] font-medium text-gray-900 hover:text-purple-600 transition-colors line-clamp-2"
          >
            {item.name}
          </a>
        </div>

        <div className="absolute bottom-4 right-4">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs"
            style={{
              backgroundColor: 'rgba(124, 58, 237, 0.1)',
              color: '#7047EB'
            }}
          >
            {item.country} {item.flag}
          </span>
        </div>
      </div>
    </div>
  );
}

const marketplaces = [
  {
    name: 'Ifesty',
    country: 'Brazil',
    flag: '🇧🇷',
    img: iftsyImg,
    siteLink: 'https://ifesty.com.br/?v=3cb56c81f4b8'
  },
  {
    name: 'BidCurios',
    country: 'India',
    flag: '🇮🇳',
    img: bidCuriousImg,
    siteLink: 'https://www.bidcurios.com/'
  },
  {
    name: 'Bootstrap',
    country: 'USA',
    flag: '🇺🇸',
    img: bootstrapImg,
    siteLink: 'https://themes.getbootstrap.com/'
  },
  {
    name: 'Parsiankala',
    country: 'USA',
    flag: '🇺🇸',
    img: parsiankalaImg,
    siteLink: 'https://parsiankala.com/'
  },
  {
    name: 'DesignAddict',
    country: 'USA',
    flag: '🇺🇸',
    img: designAddictImg,
    siteLink: 'https://designaddict.com/'
  },
  {
    name: 'Zakarto',
    country: 'USA',
    flag: '🇺🇸',
    img: zakartoImg,
    siteLink: 'https://www.zakarto.com/'
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
      {/* Tabs */}
      <div className="flex justify-center items-center gap-8 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-base md:text-lg font-medium transition relative ${activeTab === tab ? 'text-purple-700' : 'text-gray-500'
              }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute left-0 -bottom-1 h-[2px] w-full bg-purple-700" />
            )}
          </button>
        ))}
      </div>

      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold inline-block">
          {activeTab === 'Marketplace'
            ? 'Dokan Powered Marketplace Across the Globe'
            : 'Great People, Great Minds Choose Dokan'}
        </h2>
      </div>

      {/* Scroll Buttons - Updated positioning */}
      <div className="flex md:justify-end mb-6">
        <div className="flex space-x-2 mx-auto md:mx-0"> {/* Center on mobile, right-aligned on desktop */}
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
            aria-label="Scroll left"
          >
            <MoveLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
            aria-label="Scroll right"
          >
            <MoveRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards Container */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="overflow-x-auto flex gap-6 px-6 pb-2 scroll-smooth snap-x scrollbar-hide"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: '-ms-autohiding-scrollbar'
          }}
        >
          {data.map((item, index) => (
            <div
              key={index}
              className="snap-start shrink-0"
            >
              {activeTab === 'Marketplace' ? (
                <MarketplaceCard item={item} />
              ) : (
                <div
                  className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col justify-between"
                  style={{
                    width: '220px',
                    height: '214px',
                    opacity: 1,
                    transform: 'rotate(0deg)'
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-[14px] font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-[12px] text-gray-500">{item.role}</p>
                      </div>
                    </div>
                    <p className="text-[12px] text-gray-600 leading-[140%]">{item.content}</p>
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-3">
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
  const categoriesRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>('vendor');
  const { features, lite, pro } = featureData[activeCategory];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Dokan Lite vs Dokan Pro
        </h2>
        <a href="https://dokan.co/wordpress/features/" target="_blank" rel="noopener noreferrer">
          <button className="text-sm font-medium text-purple-600 px-4 py-2 rounded-md hover:bg-purple-50 transition border border-purple-200">
            Explore All Features
          </button>
        </a>
      </div>

      <div className="relative">
        <div className="flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
          {/* Categories Section with Touch Sliding */}
          <div className="w-full md:w-auto md:min-w-[300px] bg-white p-2 md:p-4">
            <div
              ref={categoriesRef}
              className="flex md:block overflow-x-auto whitespace-nowrap scrollbar-hide touch-pan-x"
              style={{
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                msOverflowStyle: '-ms-autohiding-scrollbar'
              }}
            >
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={`
                    inline-flex md:flex
                    items-center
                    justify-center md:justify-start
                    px-4 md:px-6
                    py-2 md:py-4
                    mr-2 md:mr-0
                    md:mb-2
                    rounded-lg
                    whitespace-nowrap
                    scroll-snap-align-start
                    transition-all duration-200
                    flex-shrink-0
                    ${category.key === activeCategory
                      ? 'bg-black text-white shadow-md'
                      : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                    }
                  `}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    lineHeight: '130%',
                    letterSpacing: '0%',
                    '@media (min-width: 768px)': {
                      fontSize: '18px',
                      fontWeight: 700,
                      lineHeight: '130%',
                      letterSpacing: '0%'
                    }
                  }}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>

          {/* Features Table */}
          <div className="flex-1">
            <div className="min-w-full">
              {/* Header */}
              <div className="grid grid-cols-3">
                <div className="px-4 py-3 text-xs md:text-base font-medium text-gray-900">
                  Features
                </div>
                <div className="px-4 py-3 text-xs md:text-base font-medium text-gray-900 text-center bg-gray-50">
                  Lite
                </div>
                <div className="px-4 py-3 text-xs md:text-base font-medium text-gray-900 text-center bg-gray-50">
                  Pro
                </div>
              </div>

              {/* Feature Rows */}
              {features.map((feature, index) => (
                <div key={index} className="grid grid-cols-3 border-t border-gray-100">
                  <div
                    className="px-4 py-3 text-gray-700"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fontWeight: 500,
                      lineHeight: '16px',
                      letterSpacing: '0%',
                      '@media (min-width: 768px)': {
                        fontSize: '16px',
                        fontWeight: 400,
                        lineHeight: '140%',
                        letterSpacing: '0%'
                      }
                    }}
                  >
                    {feature}
                  </div>
                  <div className="px-4 py-3 flex justify-center items-center bg-gray-50">
                    {lite[index] ? (
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <Check className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 flex justify-center items-center bg-gray-50">
                    {pro[index] ? (
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <Check className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function DokanAIBanner() {
  return (
    <div className="relative w-[349px] h-[218px] md:w-full md:h-[280px] rounded-2xl overflow-hidden">
      {/* Mobile Background Image - visible on mobile only */}
      <img
        src={dokanAiBannerMobile}
        alt="Dokan AI Banner Mobile"
        className="block md:hidden object-cover"
        style={{ width: '349px', height: '218px' }}
        draggable={false}
      />

      {/* Tablet Background Image - visible on tablet only */}
      <img
        src={dokanAiBannerTablet}
        alt="Dokan AI Banner Tablet"
        className="w-full h-full object-cover hidden md:block lg:hidden"
        draggable={false}
      />

      {/* Desktop Background Image - visible on desktop only */}
      <img
        src={dokanAiBanner}
        alt="Dokan AI Banner"
        className="w-full h-full object-cover hidden lg:block"
        draggable={false}
      />

      {/* Text Overlay */}
      <div className="absolute inset-0 md:flex md:items-center md:pl-10 md:pr-4">
        {/* Mobile Text Layout */}
        <div className="block md:hidden">
          <h2
            className="text-white font-bold absolute"
            style={{
              width: '426px',
              height: '23px',
              top: '20px',
              left: '20px',
              fontSize: '18px',
              fontWeight: '700',
              lineHeight: '130%',
              letterSpacing: '0%',
              opacity: 1
            }}
          >
            Dokan AI
          </h2>
          <p
            className="text-white absolute"
            style={{
              width: '307px',
              height: '48px',
              top: '47px',
              left: '20px',
              fontSize: '12px',
              fontWeight: '400',
              lineHeight: '140%',
              letterSpacing: '0%',
              opacity: 0.9
            }}
          >
            Generate product titles, descriptions, and images instantly with Dokan AI, powered by OpenAI and Gemini. Save time, look sharp, and sell smarter.
          </p>
        </div>

        {/* Tablet and Desktop Text Layout */}
        <div className="hidden md:block max-w-sm text-white">
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
    <div className="mt-8 md:mt-16">
      <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Why Settle? Get More with Dokan PRO!</h2>

      {/* Modules Banner with Responsive Images */}
      <div className="relative rounded-2xl overflow-hidden mb-6 md:mb-10 min-h-[150px] md:min-h-[180px]">
        {/* Mobile Image - visible on mobile only */}
        <img
          src={moduleBannerMobile}
          alt="42+ Modules"
          className="w-full h-full object-cover absolute inset-0 block md:hidden"
          style={{ minHeight: 150, maxHeight: 150 }}
          draggable={false}
        />

        {/* Tablet Image - visible on tablet only */}
        <img
          src={moduleBannerTablet}
          alt="42+ Modules"
          className="w-full h-full object-cover absolute inset-0 hidden md:block lg:hidden"
          style={{ minHeight: 180, maxHeight: 180 }}
          draggable={false}
        />

        {/* Desktop Image - visible on desktop only */}
        <img
          src={moduleBanner}
          alt="42+ Modules"
          className="w-full h-full object-cover absolute inset-0 hidden lg:block"
          style={{ minHeight: 200, maxHeight: 200 }}
          draggable={false}
        />

        <div className="relative z-10 flex flex-col justify-center h-full px-4 py-6 md:px-8 md:py-8">
          {/* Mobile Text Layout */}
          <div className="block md:hidden">
            <h3 className="text-white mb-2 font-bold" style={{
              fontSize: '18px',
              lineHeight: '130%',
              letterSpacing: '0%'
            }}>
              42+ Modules
            </h3>
            <p className="text-white max-w-xs" style={{
              fontSize: '12px',
              lineHeight: '140%',
              letterSpacing: '0%',
              fontWeight: '400'
            }}>
              Access an extensive range of modules designed to enhance both admin and vendor experiences.
            </p>
          </div>

          {/* Tablet Text Layout with Custom Line Breaks */}
          <div className="hidden md:block lg:hidden">
            <h3 className="text-3xl font-bold text-white mb-2">42+ Modules</h3>
            <p className="text-white text-base max-w-xs">
              Access an extensive range of modules<br />
              designed to enhance both admin and<br />
              vendor experiences.
            </p>
          </div>

          {/* Desktop Text Layout - Original Styles */}
          <div className="hidden lg:block">
            <h3 className="text-3xl font-bold text-white mb-2">42+ Modules</h3>
            <p className="text-white text-base max-w-xs">
              Access an extensive range of modules designed to enhance both admin and vendor experiences.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start space-x-4">
            <div className="w-10 h-10 flex items-center justify-center bg-indigo-50 rounded-lg flex-shrink-0">
              <img src={feature.icon} alt={feature.title} className="w-[36px] h-[36px] object-contain" />
            </div>
            <div>
              <h4 className="text-base md:text-lg font-semibold mb-2">{feature.title}</h4>
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
    <div className="w-[349px] md:w-full mx-auto">
      {/* Mobile Banner */}
      <div
        className="md:hidden relative rounded-2xl overflow-hidden"
        style={{
          width: '349px',
          height: '218px',
          backgroundImage: `url(${scaleMobileImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="p-5">
          <div className="flex flex-col">
            <h2
              className="text-white"
              style={{
                width: '298px',
                height: '62px',
                fontSize: '24px',
                fontWeight: 700,
                lineHeight: '130%',
                letterSpacing: '0%',
                opacity: 1,
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                textAlign: 'center'
              }}
            >
              Ready to Scale Your Marketplace?
            </h2>

            <p
              className="text-white/90 mt-3"
              style={{
                width: '298px',
                height: '30px',
                fontSize: '12px',
                fontWeight: 400,
                lineHeight: '130%',
                letterSpacing: '0%',
                opacity: 1,
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                textAlign: 'center'
              }}
            >
              With all the advanced features you get it's hard to resist buying Dokan Pro.
            </p>
          </div>

          <a
            href="https://dokan.co/wordpress/upgrade-to-pro/"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-8"
          >
            <button
              className="bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition flex items-center justify-center"
              style={{
                width: '311px',
                height: '36px',
                borderRadius: '5px',
                padding: '8px 18px',
                gap: '6px',
                opacity: 1
              }}
            >
              <span>Upgrade to Pro</span>
              <Crown className="w-5 h-5" />
            </button>
          </a>
        </div>
      </div>

      {/* Desktop Banner */}
      <div
        className="hidden md:flex relative min-h-[200px] rounded-2xl overflow-hidden items-center justify-between px-8 py-10"
        style={{
          backgroundImage: `url(${scaleImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '100%'
        }}
      >
        <div className="flex flex-col justify-center z-10 max-w-2xl">
          <h2 className="text-4xl font-bold mb-4 leading-tight text-white drop-shadow-lg">
            Ready to Scale Your Marketplace?
          </h2>
          <p className="text-lg text-white/90 drop-shadow">
            With all the advanced features you get it's hard to resist buying Dokan Pro.
          </p>
        </div>

        <div className="z-10">
          <a
            href="https://dokan.co/wordpress/upgrade-to-pro/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded shadow hover:bg-yellow-300 transition flex items-center gap-2 text-base">
              Upgrade to Pro
              <Crown className="inline-block w-5 h-5 ml-1" />
            </button>
          </a>
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
    <div
      className="p-6 space-y-6"
      style={{
        touchAction: 'pan-x pan-y',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        maxWidth: '100vw',
        overflow: 'hidden'
      }}
    >
      {/* Hero Banner */}
      <div className="relative min-h-[150px] md:min-h-[304px] lg:h-[350px] rounded-2xl overflow-hidden flex items-center">
        {/* Mobile Banner */}
        <div 
          className="absolute inset-0 md:hidden"
          style={{
            background: `url(${unlockBannerMobile}) center center / cover no-repeat`,
          }}
        />
        
        {/* Tablet Banner */}
        <div 
          className="absolute inset-0 hidden md:block lg:hidden"
          style={{
            background: `url(${unlockBannerTablet}) center center / cover no-repeat`,
          }}
        />
        
        {/* Desktop Banner */}
        <div 
          className="absolute inset-0 hidden lg:block"
          style={{
            background: `url(${unlockBanner}) center center / cover no-repeat`,
          }}
        />
        <div className="flex flex-col justify-center px-4 py-6 md:px-8 md:py-10 z-10 max-w-xl">
          {/* Mobile: text-2xl, Desktop: text-4xl */}
          <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight text-white drop-shadow">
            Unlock the Full Potential of<br />Your Marketplace!
          </h2>

          {/* Mobile and Desktop Text */}
          <p className="mb-6 text-sm lg:text-base text-white/90 drop-shadow block md:hidden lg:block">
            Upgrade to Dokan PRO for powerful vendor management, advanced admin controls, and built-in AI assistance. Enjoy exclusive features that simplify operations, boost sales, and scale your business effortlessly.
          </p>

          {/* Tablet Text with Custom Line Breaks */}
          <p className="mb-6 text-base text-white/90 drop-shadow hidden md:block lg:hidden">
            Upgrade to Dokan PRO for powerful vendor management,<br />
            advanced admin controls, and built-in AI assistance. Enjoy<br />
            exclusive features that simplify operations, boost sales,<br />
            and scale your business effortlessly.
          </p>

          {/* Button and text remain horizontal on both mobile and desktop */}
          <div className="flex items-center gap-4">
            <a
              href="https://dokan.co/wordpress/upgrade-to-pro/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded shadow hover:bg-yellow-300 transition flex items-center gap-2 text-base">
                Upgrade to Pro
                <Crown className="inline-block w-5 h-5 ml-1" />
              </button>
            </a>
            <span className="text-white/80 font-medium text-base">
              with 20% off
            </span>
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