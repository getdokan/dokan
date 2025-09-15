import { useState } from "@wordpress/element";
import { Check } from "lucide-react";

function PricingSection() {
    const [ isAnnual, setIsAnnual ] = useState( true );

    const pricingPlans = [
        {
            name: 'Starter',
            annualPrice: '$149',
            lifetimePrice: '$745',
            features: [
                'Essential Features',
                '3 Premium Modules',
                '1 Site License',
                'Ticket Based Support',
            ],
            isPopular: false,
        },
        {
            name: 'Professional',
            annualPrice: '$249',
            lifetimePrice: '$1245',
            features: [
                'Everything in Starter',
                '23 Premium Modules',
                '3 Sites Licenses',
                'Ticket Based Support',
            ],
            isPopular: false,
        },
        {
            name: 'Business',
            annualPrice: '$499',
            lifetimePrice: '$2495',
            features: [
                'Everything in Professional',
                '39 Premium Modules',
                '5 Sites Licenses',
                'Ticket Based Support',
            ],
            isPopular: true,
        },
        {
            name: 'Enterprise',
            annualPrice: '$999',
            lifetimePrice: '$4995',
            features: [
                'Everything in Business',
                '39 Premium Modules',
                '10 Sites Licenses',
                'Priority Support',
                '2 Hours of Theme Compatibility & Installation',
            ],
            isPopular: false,
        },
    ];

    return (
        <div className="w-full rounded">
            <div className="max-w-7xl mx-auto">
                { /* Header */ }
                <div className="text-center pt-8 pb-6 px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                        The Packages We Provide
                    </h2>
                    <p
                        className="text-gray-600 mb-6"
                        style={ {
                            fontWeight: 400,
                            fontSize: '16px',
                            lineHeight: '140%',
                            letterSpacing: '0%',
                            textAlign: 'center',
                        } }
                    >
                        Get 20% instant off in all packages with coupon code{ ' ' }
                        <span
                            style={ {
                                fontWeight: 600,
                                fontSize: '16px',
                                lineHeight: '140%',
                                letterSpacing: '0%',
                                textAlign: 'center',
                            } }
                        >
                            LITEUPGRADE20
                        </span>
                    </p>

                    { /* Toggle Switch */ }
                    <div className="flex items-center justify-center mb-8">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={ () => setIsAnnual( true ) }
                                className={ `px-6 py-2 rounded text-sm font-medium transition-all ${
                                    isAnnual
                                        ? 'bg-[#7047EB] text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }` }
                            >
                                Annual
                            </button>
                            <button
                                onClick={ () => setIsAnnual( false ) }
                                className={ `px-6 py-2 rounded text-sm font-medium transition-all ${
                                    ! isAnnual
                                        ? 'bg-[#7047EB] text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }` }
                            >
                                Lifetime
                            </button>
                        </div>
                        <span
                            className={ `ml-4 text-sm px-3 py-1 rounded-full transition-all duration-300 ${
                                ! isAnnual
                                    ? 'text-[#7047EB] bg-[#f3efff] opacity-100'
                                    : 'text-[#7047EB] bg-[#f3efff] opacity-60'
                            }` }
                        >
                            Save More 20%
                        </span>
                    </div>
                </div>

                { /* Pricing Cards - Completely rewritten layout */ }
                <div className="pb-12">
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
                                        } rounded bg-white` }
                                        style={ {
                                            background:
                                                plan.name === 'Starter' ||
                                                plan.name === 'Business'
                                                    ? 'linear-gradient(214.33deg, rgba(234, 248, 255, 0.7) 3.79%, #FFFFFF 60.72%)'
                                                    : 'linear-gradient(214.33deg, rgba(255, 250, 239, 0.7) 3.79%, #FFFFFF 60.72%)',
                                        } }
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
                                                    Buy Now
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
                                            } rounded bg-white` }
                                            style={ {
                                                background:
                                                    plan.name === 'Starter' ||
                                                    plan.name === 'Business'
                                                        ? 'linear-gradient(214.33deg, rgba(234, 248, 255, 0.7) 3.79%, #FFFFFF 60.72%)'
                                                        : 'linear-gradient(214.33deg, rgba(255, 250, 239, 0.7) 3.79%, #FFFFFF 60.72%)',
                                            } }
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
                                                        Buy Now
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
                                        } rounded bg-white` }
                                        style={ {
                                            background:
                                                plan.name === 'Starter' ||
                                                plan.name === 'Business'
                                                    ? 'linear-gradient(214.33deg, rgba(234, 248, 255, 0.7) 3.79%, #FFFFFF 60.72%)'
                                                    : 'linear-gradient(214.33deg, rgba(255, 250, 239, 0.7) 3.79%, #FFFFFF 60.72%)',
                                        } }
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
                                                    Buy Now
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
