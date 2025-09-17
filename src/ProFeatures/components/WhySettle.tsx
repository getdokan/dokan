import moduleBanner from '../assets/modules-banner.png';
import moduleBannerMobile from '../assets/modules-banner-mobile.png';
import moduleBannerTablet from '../assets/modules-banner-tablet.png';
import { Settings, PaintbrushVertical, File } from 'lucide-react';
import { __, sprintf } from '@wordpress/i18n';
import { RawHTML } from '@wordpress/element';

function WhySettle() {
    const features = [
        {
            icon: Settings,
            title: __( 'Extensive Plugin Support', 'dokan-lite' ),
            description: __(
                'Enhance your marketplace with hundreds of WordPress plugins designed for scalability.',
                'dokan-lite'
            ),
        },
        {
            icon: PaintbrushVertical,
            title: __( 'Hundreds of Themes Compatibility', 'dokan-lite' ),
            description: __(
                'Dokan supports all WooCommerce-compatible themes.',
                'dokan-lite'
            ),
        },
        {
            icon: File,
            title: __( 'White Label Documentation', 'dokan-lite' ),
            description: __(
                'Get marketplace-specific docs crafted by the Dokan team to fit your business needs.',
                'dokan-lite'
            ),
        },
    ];

    return (
        <div>
            <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">
                { __( 'Why Settle? Get More with Dokan PRO!', 'dokan-lite' ) }
            </h2>

            { /* Modules Banner with Responsive Images */ }
            <div className="relative rounded overflow-hidden mb-8">
                { /* Mobile Image - visible on mobile only */ }
                <img
                    src={ moduleBannerMobile }
                    alt="42+ Modules"
                    className="w-full h-auto object-contain block md:hidden"
                    draggable={ false }
                />

                { /* Tablet Image - visible on tablet only */ }
                <img
                    src={ moduleBannerTablet }
                    alt="42+ Modules"
                    className="w-full h-auto object-contain hidden md:block lg:hidden"
                    draggable={ false }
                />

                { /* Desktop Image - visible on desktop only */ }
                <img
                    src={ moduleBanner }
                    alt="42+ Modules"
                    className="w-full h-auto object-contain hidden lg:block"
                    draggable={ false }
                />

                { /* Mobile Text Overlay - positioned at top */ }
                <div className="absolute top-0 left-0 right-0 px-4 py-4 md:hidden">
                    <h3 className="text-white mb-2 font-bold text-[18px] leading-[130%] tracking-[0%]">
                        { __( '42+ Modules', 'dokan-lite' ) }
                    </h3>
                    <p className="text-white max-w-xs text-[12px] leading-[140%] tracking-[0%] font-normal">
                        { __(
                            'Access an extensive range of modules designed to enhance both admin and vendor experiences.',
                            'dokan-lite'
                        ) }
                    </p>
                </div>

                { /* Tablet and Desktop Text Overlay - centered */ }
                <div className="absolute inset-0 hidden md:flex flex-col justify-center px-8 py-8">
                    { /* Tablet Text Layout with Custom Line Breaks */ }
                    <div className="block lg:hidden">
                        <h3 className="text-3xl font-bold text-white mb-2">
                            { __( '42+ Modules', 'dokan-lite' ) }
                        </h3>
                        <div className="text-white text-base max-w-xs">
                            <RawHTML>
                                { sprintf(
                                    // eslint-disable-next-line @wordpress/i18n-translator-comments
                                    __(
                                        'Access an extensive range of modules %1$s designed to enhance both admin and %2$s vendor experiences.',
                                        'dokan-lite'
                                    ),
                                    '<br />',
                                    '<br />'
                                ) }
                            </RawHTML>
                        </div>
                    </div>

                    { /* Desktop Text Layout - Original Styles */ }
                    <div className="hidden lg:block">
                        <h3 className="text-3xl font-bold text-white mb-2">
                            { __( '42+ Modules', 'dokan-lite' ) }
                        </h3>
                        <div className="text-white text-base max-w-xs">
                            { __(
                                'Access an extensive range of modules designed to enhance both admin and vendor experiences.',
                                'dokan-lite'
                            ) }
                        </div>
                    </div>
                </div>
            </div>

            { /* Feature Cards */ }
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                { features.map( ( feature, idx ) => (
                    <div key={ idx } className="flex items-start space-x-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-[#F7F5FF] rounded border-neutral-200 text-dokan-primary flex-shrink-0">
                            <feature.icon size={ 16 } />
                        </div>
                        <div>
                            <h4 className="mb-2 font-bold text-[18px] leading-[130%] tracking-[0%]">
                                { feature.title }
                            </h4>
                            <p className="text-gray-600 text-sm">
                                { feature.description }
                            </p>
                        </div>
                    </div>
                ) ) }
            </div>
        </div>
    );
}

export default WhySettle;
