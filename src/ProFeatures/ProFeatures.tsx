import React, { useRef } from 'react';
import crownSmallImg from './assets/crown-small.png';
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

function DokanAIBanner() {
    return (
        <div
            className="relative w-full h-[220px] rounded-2xl overflow-hidden"
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
            <h2 className="text-2xl font-semibold mb-8">Why Settle? Get More with Dokan PRO!</h2>
            {/* Modules Banner */}
            <div className="relative rounded-2xl overflow-hidden mb-10 min-h-[180px]">
                <img
                    src={moduleBanner}
                    alt="42+ Modules"
                    className="w-full h-full object-cover absolute inset-0"
                    style={{ minHeight: 100, maxHeight: 200 }}
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
                            <img src={feature.icon} alt={feature.title} className="w-6 h-6 object-contain" />
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
            <h3 className="text-2xl font-semibold mb-8">What Makes Pro Exceptional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {exceptional.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-indigo-50 rounded-lg mr-2 flex-shrink-0">
                            <img src={item.icon} alt={item.title} className="w-6 h-6 object-contain" />
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                            <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                    </div>
                ))}
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
        <div className="p-6 space-y-10 bg-white">
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
                        <button className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded shadow hover:bg-yellow-300 transition flex items-center gap-2 text-base">
                            Upgrade to Pro
                            <img
                                src={crownSmallImg}
                                alt="Crown"
                                className="inline-block w-5 h-5 ml-1"
                                draggable={false}
                            />
                        </button>
                        <span className="text-white/80 font-medium text-base">with 20% off</span>
                    </div>
                </div>
            </div>

            {/* Features Slider */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-semibold mb-8">Curated Features for Your Thriving Marketplace</h3>
                    <div className="space-x-2">
                        <button
                            onClick={() => scroll('left')}
                            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition"
                        >
                            ←
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition"
                        >
                            →
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