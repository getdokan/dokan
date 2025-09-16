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
            lite: [ true, true, true, true, false, false, false, false, false ],
            pro: [ true, true, true, true, true, true, true, true, true ],
        },
        payment: {
            features: [
                'Payment Gateway Integration',
                'Commission Management',
                'Automated Withdrawals',
            ],
            lite: [ true, true, false ],
            pro: [ true, true, true ],
        },
        sales: {
            features: [
                'Order Tracking',
                'Customer Support Ticket System',
                'Refund Management',
            ],
            lite: [ true, true, false ],
            pro: [ true, true, true ],
        },
        marketing: {
            features: [
                'SEO Tools',
                'Marketing Campaigns',
                'Compliance Reports',
            ],
            lite: [ true, false, false ],
            pro: [ true, true, true ],
        },
        migration: {
            features: [
                'Data Migration',
                'API Integration',
                'Technical Support',
            ],
            lite: [ true, true, true ],
            pro: [ true, true, true ],
        },
    };

    const categories: Category[] = [
        { title: 'Vendor & Product Management', key: 'vendor' },
        { title: 'Payment & Commission Systems', key: 'payment' },
        { title: 'Sales, Orders & Customer Support', key: 'sales' },
        { title: 'Marketing, SEO & Compliance', key: 'marketing' },
        { title: 'Migration, Integration & Support', key: 'migration' },
    ];

    const categoriesRef = useRef< HTMLDivElement >( null );
    const [ activeCategory, setActiveCategory ] =
        useState< string >( 'vendor' );
    const { features, lite, pro } = featureData[ activeCategory ];

    return (
        <section className="w-full mx-auto py-8">
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
                    <div className="w-full md:w-auto md:min-w-[300px] p-2 md:p-4">
                        <div
                            ref={ categoriesRef }
                            className="flex md:block overflow-x-auto whitespace-nowrap scrollbar-hide touch-pan-x"
                            style={ {
                                scrollSnapType: 'x mandatory',
                                WebkitOverflowScrolling: 'touch',
                                msOverflowStyle: '-ms-autohiding-scrollbar',
                            } }
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
                    ${
                        category.key === activeCategory
                            ? 'bg-black text-white shadow-md'
                            : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                    }
                  ` }
                                    style={ {
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: '15px',
                                        fontWeight: 700,
                                        lineHeight: '130%',
                                        letterSpacing: '0%',
                                    } }
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
                                <div
                                    className="px-4 py-3 text-gray-900 w-[70%] text-start"
                                    style={ {
                                        fontWeight: 700,
                                        fontSize: '15px',
                                        lineHeight: '130%',
                                        letterSpacing: '0%',
                                    } }
                                >
                                    <div className="w-20">
                                        {__( 'Features', 'dokan-lite' )}
                                    </div>
                                </div>
                                <div
                                    className="py-3 text-gray-900 text-center w-[30%] flex justify-end gap-2"
                                    style={ {
                                        fontWeight: 700,
                                        fontSize: '15px',
                                        lineHeight: '130%',
                                        letterSpacing: '0%',
                                    } }
                                >
                                    <div className="w-20">
                                        {__( 'Lite', 'dokan-lite' )}
                                    </div>
                                    <div className="w-20">
                                        {__( 'Pro', 'dokan-lite' )}
                                    </div>
                                </div>
                            </div>

                            { /* Feature Rows */ }
                            { features.map( ( feature, index ) => (
                                <div key={ index } className="flex flex-row justify-between">
                                    <div
                                        className="px-4 py-3 text-gray-700 w-[70%]"
                                        style={ {
                                            fontFamily: 'Inter, sans-serif',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            lineHeight: '16px',
                                            letterSpacing: '0%',
                                            '@media (min-width: 768px)': {
                                                fontSize: '16px',
                                                fontWeight: 400,
                                                lineHeight: '140%',
                                                letterSpacing: '0%',
                                            },
                                        } }
                                    >
                                        { feature }
                                    </div>
                                    <div className="flex justify-end items-center w-[30%] gap-2">
                                        { lite[ index ] ? (
                                            <div className={ `flex items-center justify-center bg-[#F0EBFF] h-full w-20 ${ index === 0 ? 'rounded-t-xl' : 'rounded-t-none' } ${ features.length === index + 1 ? 'rounded-b-xl' : 'rounded-b-none' }` }>
                                                <Check
                                                    className="text-white bg-dokan-btn rounded-full"
                                                    size={ 16 }
                                                />
                                            </div>
                                        ) : (
                                            <div className={ `flex items-center justify-center bg-[#F0EBFF] h-full w-20 ${ index === 0 ? 'rounded-t-xl' : 'rounded-t-none' } ${ features.length === index + 1 ? 'rounded-b-xl' : 'rounded-b-none' }` }>
                                                <Check
                                                    className="text-gray-400 bg-gray-200 rounded-full"
                                                    size={ 16 }
                                                />
                                            </div>
                                        ) }
                                        { pro[ index ] ? (
                                            <div className={ `flex items-center justify-center bg-[#F0EBFF] h-full w-20 ${ index === 0 ? 'rounded-t-xl' : 'rounded-t-none' } ${ features.length === index + 1 ? 'rounded-b-xl' : 'rounded-b-none' }` }>
                                                <Check
                                                    className="text-white bg-dokan-btn rounded-full"
                                                    size={ 16 }
                                                />
                                            </div>
                                        ) : (
                                            <div className={ `flex items-center justify-center bg-[#F0EBFF] h-full w-20 ${ index === 0 ? 'rounded-t-xl' : 'rounded-t-none' } ${ features.length === index + 1 ? 'rounded-b-xl' : 'rounded-b-none' }` }>
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
        </section>
    );
};

export default FeatureComparison;
