import { useRef, useState } from '@wordpress/element';
import { Check } from 'lucide-react';
import { __ } from '@wordpress/i18n';

interface FeatureData {
    features: string[];
    lite: boolean[];
    pro: boolean[];
}

interface Category {
    title: string;
    key: string;
}

const FeatureComparison = () => {
    const featureData: Record< string, FeatureData > = {
        vendor: {
            features: [
                __( 'Frontend Dashboard for Vendors', 'dokan-lite' ),
                __( 'Frontend Simple Product', 'dokan-lite' ),
                __( 'Individual Vendor Stores', 'dokan-lite' ),
                __( 'Frontend Variable Products', 'dokan-lite' ),
                __( 'Product Bulk Edit', 'dokan-lite' ),
                __( 'Single Product Multivendor', 'dokan-lite' ),
                __( 'WC Booking Integration', 'dokan-lite' ),
                __( 'WC Auction Integration', 'dokan-lite' ),
                __( 'Wholesale', 'dokan-lite' ),
            ],
            lite: [
                true,
                true,
                true,
                false,
                false,
                false,
                false,
                false,
                false,
            ],
            pro: [ true, true, true, true, true, true, true, true, true ],
        },
        payment: {
            features: [
                __( 'Reverse Withdrawal', 'dokan-lite' ),
                __( 'Multiple Commission Types', 'dokan-lite' ),
                __( 'Dokan Stripe Express', 'dokan-lite' ),
                __( 'Dokan PayPal Marketplace', 'dokan-lite' ),
                __( 'MANGOPAY Integration', 'dokan-lite' ),
                __( 'Razorpay Integration', 'dokan-lite' ),
                __( 'Dokan Stripe Connect', 'dokan-lite' ),
                __( 'Subscriptions', 'dokan-lite' ),
                __( 'Minimum Maximum Order', 'dokan-lite' ),
            ],
            lite: [
                true,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
            ],
            pro: [ true, true, true, true, true, true, true, true, true ],
        },
        sales: {
            features: [
                __( 'Order Email Notifications', 'dokan-lite' ),
                __( 'Earning Reports', 'dokan-lite' ),
                __( 'Admin Reports', 'dokan-lite' ),
                __( 'Vendor Statements', 'dokan-lite' ),
                __( 'Return and Warranty Request', 'dokan-lite' ),
                __( 'Shipping Management', 'dokan-lite' ),
                __( 'Coupon Creation', 'dokan-lite' ),
                __( 'Follow Store', 'dokan-lite' ),
                __( 'Live Chat', 'dokan-lite' ),
                __( 'Live Chat Support for Ent Users', 'dokan-lite' ),
            ],
            lite: [
                true,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
            ],
            pro: [ true, true, true, true, true, true, true, true, true, true ],
        },
        marketing: {
            features: [
                __( 'Product Advertising', 'dokan-lite' ),
                __( 'Rank Math SEO', 'dokan-lite' ),
                __( 'Geolocation', 'dokan-lite' ),
                __( 'EU Compliance Fields', 'dokan-lite' ),
            ],
            lite: [ false, false, false, false ],
            pro: [ true, true, true, true ],
        },
        migration: {
            features: [
                __( 'Dummy Data', 'dokan-lite' ),
                __( 'Dokan Migrator', 'dokan-lite' ),
                __( 'WPML Integration', 'dokan-lite' ),
                __( 'wp.org Support', 'dokan-lite' ),
                __( 'Printful Integration', 'dokan-lite' ),
                __( 'Export Import', 'dokan-lite' ),
                __( 'Priority Support', 'dokan-lite' ),
            ],
            lite: [ true, true, true, true, false, false, false ],
            pro: [ true, true, true, true, true, true, true ],
        },
    };

    const categories: Category[] = [
        {
            title: __( 'Vendor & Product Management', 'dokan-lite' ),
            key: 'vendor',
        },
        {
            title: __( 'Payment & Commission Systems', 'dokan-lite' ),
            key: 'payment',
        },
        {
            title: __( 'Sales, Orders & Customer Support', 'dokan-lite' ),
            key: 'sales',
        },
        {
            title: __( 'Marketing, SEO & Compliance', 'dokan-lite' ),
            key: 'marketing',
        },
        {
            title: __( 'Migration, Integration & Support', 'dokan-lite' ),
            key: 'migration',
        },
    ];

    const categoriesRef = useRef< HTMLDivElement >( null );
    const [ activeCategory, setActiveCategory ] =
        useState< string >( 'vendor' );
    const { features, lite, pro } = featureData[ activeCategory ];

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    { __( 'Dokan Lite vs Dokan Pro', 'dokan-lite' ) }
                </h2>
                <a
                    href="https://dokan.co/wordpress/features/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-dokan-primary px-4 py-2 rounded-md transition border hover:text-dokan-primary border-dokan-primary text-center"
                >
                    { __( 'Explore All Features', 'dokan-lite' ) }
                </a>
            </div>

            <div className="relative">
                <div className="flex flex-col md:flex-row rounded overflow-hidden">
                    { /* Categories Section with Touch Sliding */ }
                    <div className="w-full md:w-auto md:min-w-[300px]">
                        <div
                            ref={ categoriesRef }
                            className="flex md:block overflow-x-auto whitespace-nowrap scrollbar-hide touch-pan-x mb-8 md:mb-0 scroll-snap-x scroll-snap-mandatory"
                        >
                            { categories.map( ( category ) => (
                                <button
                                    key={ category.key }
                                    onClick={ () =>
                                        setActiveCategory( category.key )
                                    }
                                    className={ `
                    inline-flex md:flex
                    w-auto md:w-full
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
                    font-bold text-[15px] leading-[130%] tracking-[0%]
                    ${
                        category.key === activeCategory
                            ? 'bg-black text-white shadow-md'
                            : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                    }
                  ` }
                                >
                                    { category.title }
                                </button>
                            ) ) }
                        </div>
                    </div>

                    { /* Features Table */ }
                    <div className="flex-1">
                        <div className="min-w-full">
                            { /* Header */ }
                            <div className="flex flex-row">
                                <div className="pl-0 md:pl-4 px-4 py-3 pt-0 text-gray-900 w-[70%] text-start font-bold text-[15px] leading-[130%] tracking-[0%]">
                                    <div className="w-20">
                                        { __( 'Features', 'dokan-lite' ) }
                                    </div>
                                </div>
                                <div className="py-3 pt-0 text-gray-900 text-center w-[30%] flex justify-end gap-2 font-bold text-[15px] leading-[130%] tracking-[0%]">
                                    <div className="w-20">
                                        { __( 'Lite', 'dokan-lite' ) }
                                    </div>
                                    <div className="w-20">
                                        { __( 'Pro', 'dokan-lite' ) }
                                    </div>
                                </div>
                            </div>

                            { /* Feature Rows */ }
                            { features.map( ( feature, index ) => (
                                <div
                                    key={ index }
                                    className="flex flex-row justify-between"
                                >
                                    <div className="pl-0 md:pl-4 px-4 py-3 text-gray-700 w-[70%] text-[12px] font-medium leading-4 tracking-[0%] md:text-[16px] md:font-normal md:leading-[140%]">
                                        { feature }
                                    </div>
                                    <div className="flex justify-end items-center w-[30%] gap-2">
                                        { lite[ index ] ? (
                                            <div
                                                className={ `flex items-center justify-center bg-[#F0EBFF] h-full w-20 ${
                                                    index === 0
                                                        ? 'rounded-t-xl'
                                                        : 'rounded-t-none'
                                                } ${
                                                    features.length ===
                                                    index + 1
                                                        ? 'rounded-b-xl'
                                                        : 'rounded-b-none'
                                                }` }
                                            >
                                                <Check
                                                    className="text-white bg-dokan-btn rounded-full"
                                                    size={ 16 }
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className={ `flex items-center justify-center bg-[#F0EBFF] h-full w-20 ${
                                                    index === 0
                                                        ? 'rounded-t-xl'
                                                        : 'rounded-t-none'
                                                } ${
                                                    features.length ===
                                                    index + 1
                                                        ? 'rounded-b-xl'
                                                        : 'rounded-b-none'
                                                }` }
                                            >
                                                <Check
                                                    className="text-gray-400 bg-gray-200 rounded-full"
                                                    size={ 16 }
                                                />
                                            </div>
                                        ) }
                                        { pro[ index ] ? (
                                            <div
                                                className={ `flex items-center justify-center bg-[#F0EBFF] h-full w-20 ${
                                                    index === 0
                                                        ? 'rounded-t-xl'
                                                        : 'rounded-t-none'
                                                } ${
                                                    features.length ===
                                                    index + 1
                                                        ? 'rounded-b-xl'
                                                        : 'rounded-b-none'
                                                }` }
                                            >
                                                <Check
                                                    className="text-white bg-dokan-btn rounded-full"
                                                    size={ 16 }
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className={ `flex items-center justify-center bg-[#F0EBFF] h-full w-20 ${
                                                    index === 0
                                                        ? 'rounded-t-xl'
                                                        : 'rounded-t-none'
                                                } ${
                                                    features.length ===
                                                    index + 1
                                                        ? 'rounded-b-xl'
                                                        : 'rounded-b-none'
                                                }` }
                                            >
                                                <Check
                                                    className="text-gray-400 bg-gray-200 rounded-full"
                                                    size={ 16 }
                                                />
                                            </div>
                                        ) }
                                    </div>
                                </div>
                            ) ) }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeatureComparison;
