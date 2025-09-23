import { useState } from '@wordpress/element';
import { Check } from 'lucide-react';
import { __ } from '@wordpress/i18n';

function PricingSection() {
    const [ isAnnual, setIsAnnual ] = useState( true );
    const buyNowUrl =
        'https://dokan.co/wordpress/pricing/?utm_campaign=liteupgrade&utm_medium=WPDashboard&utm_source=plugin';

    const pricingPlans = [
        {
            name: 'Starter',
            annualPrice: '$149',
            lifetimePrice: '$745',
            lifetimePriceDiscount: '$594.51',
            features: [
                __( 'Essential Features', 'dokna-lite' ),
                __( '3 Premium Modules', 'dokna-lite' ),
                __( '1 Site License', 'dokna-lite' ),
                __( 'Ticket Based Support', 'dokna-lite' ),
            ],
            isPopular: false,
        },
        {
            name: 'Professional',
            annualPrice: '$249',
            lifetimePrice: '$1245',
            lifetimePriceDiscount: '$986.04',
            features: [
                __( 'Everything in Starter', 'dokan-lite' ),
                __( '23 Premium Modules', 'dokan-lite' ),
                __( '3 Sites Licenses', 'dokan-lite' ),
                __( 'Ticket Based Support', 'dokan-lite' ),
            ],
            isPopular: false,
        },
        {
            name: 'Business',
            annualPrice: '$499',
            lifetimePrice: '$2495',
            lifetimePriceDiscount: '$1,993.50',
            features: [
                __( 'Everything in Professional', 'dokan-lite' ),
                __( '39 Premium Modules', 'dokan-lite' ),
                __( '5 Sites Licenses', 'dokan-lite' ),
                __( 'Ticket Based Support', 'dokan-lite' ),
            ],
            isPopular: true,
        },
        {
            name: 'Enterprise',
            annualPrice: '$999',
            lifetimePrice: '$4995',
            lifetimePriceDiscount: '$3,956.04',
            features: [
                __( 'Everything in Business', 'dokan-lite' ),
                __( '39 Premium Modules', 'dokan-lite' ),
                __( '10 Sites Licenses', 'dokan-lite' ),
                __( 'Priority Support', 'dokan-lite' ),
                __(
                    '2 Hours of Theme Compatibility & Installation',
                    'dokan-lite'
                ),
            ],
            isPopular: false,
        },
    ];

    const BuyNowButton = () => {
        return (
            <a
                href={ buyNowUrl }
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-8"
            >
                <button className="w-full mt-4 bg-[#7047EB] text-white hover:bg-[#5d39c4] transition-colors rounded h-[35px] text-xs font-semibold">
                    { __( 'Buy Now', 'dokan-lite' ) }
                </button>
            </a>
        );
    };

    const Pack = ( plan ) => {
        return (
            <div className="p-4 h-full flex flex-col">
                { /* Package Header */ }
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            { plan.name }
                        </h3>
                        { plan.isPopular && (
                            <span className="bg-[#EFEAFF] text-[#7047EB] px-2 py-1 rounded-full text-xs font-medium">
                                { __( 'Popular', 'dokan-lite' ) }
                            </span>
                        ) }
                    </div>
                    <div>
                        { isAnnual && plan.annualPrice && (
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                    { plan.annualPrice }
                                </span>
                                <span className="text-sm text-gray-500">
                                    { __( 'Annually', 'dokan-lite' ) }
                                </span>
                            </div>
                        ) }

                        { ! isAnnual && plan.lifetimePrice && (
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-gray-500 line-through">
                                    { plan.lifetimePrice }
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-gray-900">
                                        { plan.lifetimePriceDiscount }
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        { __( 'Lifetime', 'dokan-lite' ) }
                                    </span>
                                </div>
                            </div>
                        ) }
                    </div>
                </div>

                { /* Features List */ }
                <div className="flex-grow space-y-3">
                    { plan.features.map( ( feature, featureIndex ) => (
                        <div
                            key={ featureIndex }
                            className="flex items-start gap-2"
                        >
                            <Check className="w-4 h-4 text-[#7047EB] mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-700 leading-tight">
                                { feature }
                            </span>
                        </div>
                    ) ) }
                </div>

                { /* Buy Now Button */ }
                <BuyNowButton />
            </div>
        );
    };

    return (
        <div className="w-full rounded">
            <div className="max-w-7xl mx-auto">
                { /* Header */ }
                <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                        { __( 'The Packages We Provide', 'dokan-lite' ) }
                    </h2>
                    <p className="text-gray-600 mb-6 font-normal text-[16px] leading-[140%] tracking-[0%] text-center">
                        { __(
                            'Get 20% instant off in all packages with coupon code',
                            'dokan-lite'
                        ) }
                        &nbsp;
                        <span className="font-semibold text-[16px] leading-[140%] tracking-[0%] text-center">
                            LITEUPGRADE20
                        </span>
                    </p>

                    { /* Toggle Switch */ }
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex bg-white rounded border">
                            <button
                                onClick={ () => setIsAnnual( true ) }
                                className={ `px-6 py-2 text-sm font-medium transition-all ${
                                    isAnnual
                                        ? 'bg-[#7047EB] text-white rounded-l'
                                        : 'text-gray-600 hover:text-gray-900'
                                }` }
                            >
                                { __( 'Annual', 'dokan-lite' ) }
                            </button>
                            <button
                                onClick={ () => setIsAnnual( false ) }
                                className={ `px-6 py-2 text-sm font-medium transition-all ${
                                    ! isAnnual
                                        ? 'bg-[#7047EB] text-white rounded-r'
                                        : 'text-gray-600 hover:text-gray-900'
                                }` }
                            >
                                { __( 'Lifetime', 'dokan-lite' ) }
                                <span className="transition-all duration-300 relative">
                                    <span className="absolute ml-[5px] md:ml-[30px] mt-[-25px] inline-block md:hidden">
                                        <span>
                                            <svg
                                                width="88"
                                                height="43"
                                                viewBox="0 0 88 43"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M26.6855 1C15.3637 1 6.18553 10.1782 6.18553 21.5C6.18553 23.2901 6.41496 25.0265 6.84602 26.6816L1.30349 33.6406C0.533137 34.6078 1.33094 36.0211 2.55709 35.8614L11.0468 34.7551C14.8071 39.1872 20.4179 42 26.6855 42H66.6855C78.0074 42 87.1855 32.8218 87.1855 21.5C87.1855 10.1782 78.0074 1 66.6855 1H26.6855Z"
                                                    fill={
                                                        isAnnual
                                                            ? '#F8F8F8'
                                                            : '#EFEAFF'
                                                    }
                                                />
                                                <path
                                                    d="M6.84602 26.6816L7.23713 26.9931L7.3929 26.7975L7.32988 26.5556L6.84602 26.6816ZM1.30349 33.6406L1.6946 33.9521L1.30349 33.6406ZM2.55709 35.8614L2.6217 36.3572H2.6217L2.55709 35.8614ZM11.0468 34.7551L11.4281 34.4317L11.2521 34.2242L10.9822 34.2593L11.0468 34.7551ZM6.18553 21.5H6.68553C6.68553 10.4543 15.6398 1.5 26.6855 1.5V1V0.5C15.0876 0.5 5.68553 9.90202 5.68553 21.5H6.18553ZM6.84602 26.6816L7.32988 26.5556C6.90945 24.9413 6.68553 23.2472 6.68553 21.5H6.18553H5.68553C5.68553 23.3329 5.92048 25.1117 6.36217 26.8076L6.84602 26.6816ZM1.30349 33.6406L1.6946 33.9521L7.23713 26.9931L6.84602 26.6816L6.45491 26.3701L0.912383 33.3291L1.30349 33.6406ZM2.55709 35.8614L2.49249 35.3656C1.71207 35.4672 1.20429 34.5677 1.6946 33.9521L1.30349 33.6406L0.912383 33.3291C-0.138014 34.6479 0.949813 36.575 2.6217 36.3572L2.55709 35.8614ZM11.0468 34.7551L10.9822 34.2593L2.49249 35.3656L2.55709 35.8614L2.6217 36.3572L11.1114 35.2509L11.0468 34.7551ZM26.6855 42V41.5C20.5709 41.5 15.0975 38.7566 11.4281 34.4317L11.0468 34.7551L10.6656 35.0786C14.5168 39.6179 20.2649 42.5 26.6855 42.5V42ZM66.6855 42V41.5H26.6855V42V42.5H66.6855V42ZM87.1855 21.5H86.6855C86.6855 32.5457 77.7312 41.5 66.6855 41.5V42V42.5C78.2835 42.5 87.6855 33.098 87.6855 21.5H87.1855ZM66.6855 1V1.5C77.7312 1.5 86.6855 10.4543 86.6855 21.5H87.1855H87.6855C87.6855 9.90202 78.2835 0.5 66.6855 0.5V1ZM26.6855 1V1.5H66.6855V1V0.5H26.6855V1Z"
                                                    fill={
                                                        isAnnual
                                                            ? '#E5E7EB'
                                                            : '#AB92F6'
                                                    }
                                                />
                                            </svg>

                                            <span
                                                className={ `absolute top-[17%] left-[10%] text-[12px] leading-[15px] ${
                                                    isAnnual
                                                        ? 'text-gray-400'
                                                        : 'text-[#7047EB]'
                                                }` }
                                            >
                                                { __(
                                                    'Save More 20%',
                                                    'dokan-lite'
                                                ) }
                                            </span>
                                        </span>
                                    </span>
                                    <span className="absolute ml-[5px] md:ml-[30px] mt-[-25px] hidden md:inline-block">
                                        <svg
                                            width="122"
                                            height="38"
                                            viewBox="0 0 122 38"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M24.1855 1C14.2444 1 6.18555 9.05888 6.18555 19C6.18555 21.3623 6.6406 23.6182 7.46783 25.6851L1.30349 33.4247C0.533137 34.392 1.33094 35.8053 2.55709 35.6455L13.5914 34.2077C13.8425 34.175 14.0895 34.1274 14.3314 34.0655C17.1623 35.921 20.5479 37 24.1855 37H103.186C113.127 37 121.186 28.9411 121.186 19C121.186 9.05888 113.127 1 103.186 1H24.1855Z"
                                                fill={
                                                    isAnnual
                                                        ? '#F8F8F8'
                                                        : '#EFEAFF'
                                                }
                                            />
                                            <path
                                                d="M7.46783 25.6851L7.85893 25.9966L8.04005 25.7692L7.93203 25.4993L7.46783 25.6851ZM1.30349 33.4247L0.912383 33.1132H0.912383L1.30349 33.4247ZM2.55709 35.6455L2.6217 36.1413H2.6217L2.55709 35.6455ZM13.5914 34.2077L13.656 34.7036H13.656L13.5914 34.2077ZM14.3314 34.0655L14.6055 33.6473L14.4211 33.5265L14.2075 33.5811L14.3314 34.0655ZM6.18555 19H6.68555C6.68555 9.33502 14.5206 1.5 24.1855 1.5V1V0.5C13.9683 0.5 5.68555 8.78273 5.68555 19H6.18555ZM7.46783 25.6851L7.93203 25.4993C7.12805 23.4906 6.68555 21.2976 6.68555 19H6.18555H5.68555C5.68555 21.427 6.15314 23.7459 7.00363 25.8709L7.46783 25.6851ZM1.30349 33.4247L1.6946 33.7362L7.85893 25.9966L7.46783 25.6851L7.07672 25.3736L0.912383 33.1132L1.30349 33.4247ZM2.55709 35.6455L2.49249 35.1497C1.71207 35.2514 1.20429 34.3519 1.6946 33.7362L1.30349 33.4247L0.912383 33.1132C-0.138014 34.4321 0.949813 36.3592 2.6217 36.1413L2.55709 35.6455ZM13.5914 34.2077L13.5268 33.7119L2.49249 35.1497L2.55709 35.6455L2.6217 36.1413L13.656 34.7036L13.5914 34.2077ZM14.3314 34.0655L14.2075 33.5811C13.985 33.638 13.7578 33.6818 13.5268 33.7119L13.5914 34.2077L13.656 34.7036C13.9271 34.6682 14.1939 34.6167 14.4553 34.5499L14.3314 34.0655ZM24.1855 37V36.5C20.6482 36.5 17.3575 35.451 14.6055 33.6473L14.3314 34.0655L14.0573 34.4837C16.9672 36.3909 20.4476 37.5 24.1855 37.5V37ZM103.186 37V36.5H24.1855V37V37.5H103.186V37ZM121.186 19H120.686C120.686 28.665 112.851 36.5 103.186 36.5V37V37.5C113.403 37.5 121.686 29.2173 121.686 19H121.186ZM103.186 1V1.5C112.851 1.5 120.686 9.33502 120.686 19H121.186H121.686C121.686 8.78273 113.403 0.5 103.186 0.5V1ZM24.1855 1V1.5H103.186V1V0.5H24.1855V1Z"
                                                fill={
                                                    isAnnual
                                                        ? '#E5E7EB'
                                                        : '#AB92F6'
                                                }
                                            />
                                        </svg>

                                        <span
                                            className={ `absolute top-[27%] left-[15%] text-[12px] leading-[15px] ${
                                                isAnnual
                                                    ? 'text-gray-400'
                                                    : 'text-[#7047EB]'
                                            }` }
                                        >
                                            { __(
                                                'Save More 20%',
                                                'dokan-lite'
                                            ) }
                                        </span>
                                    </span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="px-0 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                            { pricingPlans.map( ( plan, index ) => (
                                <div key={ index }>
                                    <div
                                        className={ `h-full ${
                                            plan.isPopular
                                                ? 'border-2 border-[#7047EB] shadow-lg'
                                                : 'border border-gray-200'
                                        } rounded bg-white
                                        ${
                                            index === 0
                                                ? 'bg-[linear-gradient(214.33deg,rgba(239,241,255,0.7)_3.79%,#FFFFFF_60.72%)]'
                                                : ''
                                        }
                                        ${
                                            index === 1
                                                ? 'bg-[linear-gradient(214.33deg,rgba(255,250,239,0.7)_3.79%,#FFFFFF_60.72%)]'
                                                : ''
                                        }
                                        ${
                                            index === 2
                                                ? 'bg-[linear-gradient(214.33deg,rgba(234,248,255,0.7)_3.79%,#FFFFFF_60.72%)]'
                                                : ''
                                        }
                                        ${
                                            index === 3
                                                ? 'bg-[linear-gradient(214.33deg,rgba(255,238,249,0.7)_3.79%,#FFFFFF_60.72%)]'
                                                : ''
                                        }
                                        ` }
                                    >
                                        { Pack( plan ) }
                                    </div>
                                </div>
                            ) ) }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PricingSection;
