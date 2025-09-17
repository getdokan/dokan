import { useState } from '@wordpress/element';
import { Check } from 'lucide-react';
import { __ } from '@wordpress/i18n';

function PricingSection() {
    const [ isAnnual, setIsAnnual ] = useState( true );

    const pricingPlans = [
        {
            name: 'Starter',
            annualPrice: '$149',
            lifetimePrice: '$745',
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
                                    <span className="absolute ml-[5px] md:ml-[30px] mt-[-25px]">
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
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                { /* Pricing Cards - Completely rewritten layout */ }
                <div>
                    { /* Mobile: 1 column */ }
                    <div className="block md:hidden px-6">
                        <div className="space-y-6">
                            { pricingPlans.map( ( plan, index ) => (
                                <div key={ index } className="max-w-sm mx-auto">
                                    <div
                                        className={ `${
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
                                        <div className="p-4">
                                            { /* Package Header */ }
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        { plan.name }
                                                    </h3>
                                                    { plan.isPopular && (
                                                        <span className="bg-[#EFEAFF] text-[#7047EB] px-2 py-1 rounded-full text-xs font-medium">
                                                            { __(
                                                                'Popular',
                                                                'dokan-lite'
                                                            ) }
                                                        </span>
                                                    ) }
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-bold text-gray-900">
                                                        { isAnnual
                                                            ? plan.annualPrice
                                                            : plan.lifetimePrice }
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        { isAnnual
                                                            ? 'Annually'
                                                            : 'Lifetime' }
                                                    </span>
                                                </div>
                                            </div>

                                            { /* Features List */ }
                                            <div className="space-y-3 mb-4">
                                                { plan.features.map(
                                                    (
                                                        feature,
                                                        featureIndex
                                                    ) => (
                                                        <div
                                                            key={ featureIndex }
                                                            className="flex items-start gap-2"
                                                        >
                                                            <Check className="w-4 h-4 text-[#7047EB] mt-0.5 flex-shrink-0" />
                                                            <span className="text-xs text-gray-700 leading-tight">
                                                                { feature }
                                                            </span>
                                                        </div>
                                                    )
                                                ) }
                                            </div>

                                            { /* Buy Now Button */ }
                                            <a
                                                href="https://dokan.co/wordpress/pricing/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block mt-8"
                                            >
                                                <button className="w-full bg-[#7047EB] text-white hover:bg-[#5d39c4] transition-colors rounded h-[35px] text-xs font-semibold">
                                                    { __(
                                                        'Buy Now',
                                                        'dokan-lite'
                                                    ) }
                                                </button>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ) ) }
                        </div>
                    </div>

                    { /* Tablet: 2 columns, 2 rows (2x2 grid), 332x313 cards */ }
                    <div className="hidden md:block lg:hidden">
                        <div className="max-w-4xl mx-auto px-4">
                            <div className="grid grid-cols-2 gap-4 justify-items-center">
                                { pricingPlans.map( ( plan, index ) => (
                                    <div
                                        key={ index }
                                        className="w-[320px] h-[313px]"
                                    >
                                        <div
                                            className={ `w-full h-full ${
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
                                            <div className="p-4 h-full flex flex-col">
                                                { /* Package Header */ }
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            { plan.name }
                                                        </h3>
                                                        { plan.isPopular && (
                                                            <span className="bg-[#EFEAFF] text-[#7047EB] px-2 py-1 rounded-full text-xs font-medium">
                                                                { __(
                                                                    'Popular',
                                                                    'dokan-lite'
                                                                ) }
                                                            </span>
                                                        ) }
                                                    </div>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-2xl font-bold text-gray-900">
                                                            { isAnnual
                                                                ? plan.annualPrice
                                                                : plan.lifetimePrice }
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            { isAnnual
                                                                ? 'Annually'
                                                                : 'Lifetime' }
                                                        </span>
                                                    </div>
                                                </div>

                                                { /* Features List */ }
                                                <div className="flex-grow space-y-3">
                                                    { plan.features.map(
                                                        (
                                                            feature,
                                                            featureIndex
                                                        ) => (
                                                            <div
                                                                key={
                                                                    featureIndex
                                                                }
                                                                className="flex items-start gap-2"
                                                            >
                                                                <Check className="w-4 h-4 text-[#7047EB] mt-0.5 flex-shrink-0" />
                                                                <span className="text-xs text-gray-700 leading-tight">
                                                                    { feature }
                                                                </span>
                                                            </div>
                                                        )
                                                    ) }
                                                </div>

                                                { /* Buy Now Button */ }
                                                <a
                                                    href="https://dokan.co/wordpress/pricing/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block mt-8"
                                                >
                                                    <button className="w-full mt-4 bg-[#7047EB] text-white hover:bg-[#5d39c4] transition-colors rounded h-[35px] text-xs font-semibold">
                                                        { __(
                                                            'Buy Now',
                                                            'dokan-lite'
                                                        ) }
                                                    </button>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ) ) }
                            </div>
                        </div>
                    </div>

                    { /* Desktop: 4 columns */ }
                    <div className="hidden lg:block px-8">
                        <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto">
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
                                        <div className="p-4 h-full flex flex-col">
                                            { /* Package Header */ }
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        { plan.name }
                                                    </h3>
                                                    { plan.isPopular && (
                                                        <span className="bg-[#EFEAFF] text-[#7047EB] px-2 py-1 rounded-full text-xs font-medium">
                                                            Popular
                                                        </span>
                                                    ) }
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-bold text-gray-900">
                                                        { isAnnual
                                                            ? plan.annualPrice
                                                            : plan.lifetimePrice }
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        { isAnnual
                                                            ? 'Annually'
                                                            : 'Lifetime' }
                                                    </span>
                                                </div>
                                            </div>

                                            { /* Features List */ }
                                            <div className="flex-grow space-y-3">
                                                { plan.features.map(
                                                    (
                                                        feature,
                                                        featureIndex
                                                    ) => (
                                                        <div
                                                            key={ featureIndex }
                                                            className="flex items-start gap-2"
                                                        >
                                                            <Check className="w-4 h-4 text-[#7047EB] mt-0.5 flex-shrink-0" />
                                                            <span className="text-xs text-gray-700 leading-tight">
                                                                { feature }
                                                            </span>
                                                        </div>
                                                    )
                                                ) }
                                            </div>

                                            { /* Buy Now Button */ }
                                            <a
                                                href="https://dokan.co/wordpress/pricing/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block mt-8"
                                            >
                                                <button className="w-full mt-4 bg-[#7047EB] text-white hover:bg-[#5d39c4] transition-colors rounded h-[35px] text-xs font-semibold">
                                                    { __(
                                                        'Buy Now',
                                                        'dokan-lite'
                                                    ) }
                                                </button>
                                            </a>
                                        </div>
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
