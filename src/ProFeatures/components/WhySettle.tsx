import { products } from '../Images';
import { Settings, PaintbrushVertical, File } from 'lucide-react';
import { __ } from '@wordpress/i18n';

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
                <div>
                    <div className="w-full h-[150px] md:h-[210px] lg:h-[276px] relative bg-[linear-gradient(90deg,rgba(38,1,138,1)_0%,rgba(0,0,0,1)_100%)]">
                        <span className="w-[500px] h-[500px] left-[-32px] top-[-107px] rounded-full absolute overflow-hidden inline-block bg-white opacity-[.04]"></span>
                        <span className="w-[500px] h-[500px] left-[270px] top-[-375px] rounded-full absolute overflow-hidden inline-block bg-white opacity-[.04]"></span>

                        <div className="flex flex-col md:flex-row w-full h-full overflow-hidden">
                            <div className="md:w-[65%] lg:w-[45%] h-full flex justify-center flex-col">
                                <div className="px-4 pt-4 md:pt-0 md:px-8">
                                    <h3 className="font-bold text-white mb-2 text-xl lg:text-3xl">
                                        { __( '42+ Modules', 'dokan-lite' ) }
                                    </h3>
                                    <div className="text-white max-w-xs text-[12px] leading-[140%] md:text-base font-normal">
                                        { __(
                                            'Access an extensive range of modules designed to enhance both admin and vendor experiences.',
                                            'dokan-lite'
                                        ) }
                                    </div>
                                </div>
                            </div>
                            <div className="md:w-[35%] lg:w-[55%] h-full relative">
                                <span className="md:w-[200px] lg:w-[500px] h-full bg-[linear-gradient(270deg,black_0%,rgba(0,0,0,0)_100%)] absolute right-0 z-10"></span>
                                <img
                                    src={ products }
                                    alt="products"
                                    className="w-full h-auto absolute top-[-42px] md:top-[90px] lg:top-[32px] md:left-[40px] lg:left-0 scale-[.4] md:scale-[2] lg:scale-[1] rotate-[5deg]"
                                    draggable={ false }
                                />
                            </div>
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
