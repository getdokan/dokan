import { __ } from '@wordpress/i18n';
import { ExternalLink } from 'lucide-react';
import { DokanButton } from '@dokan/components';
import PlaceholderIcon from './PlaceholderIcon';

const Services = () => {
    const tags = [
        __( 'WordPress', 'dokan-lite' ),
        __( 'WooCommerce', 'dokan-lite' ),
        __( 'Marketplace', 'dokan-lite' ),
        __( 'Custom Development', 'dokan-lite' ),
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            <div className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
                <div className="px-5 pt-5 pb-3">
                    <PlaceholderIcon />
                </div>

                <div className="flex flex-col flex-1 px-5 pb-5">
                    <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
                        { __( 'weLabs', 'dokan-lite' ) }
                    </h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed mb-3">
                        { __(
                            'Building world-class WordPress solutions. Get expert help for your marketplace from the team that built Dokan.',
                            'dokan-lite'
                        ) }
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-5 flex-1">
                        { tags.map( ( tag ) => (
                            <span
                                key={ tag }
                                className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full"
                            >
                                { tag }
                            </span>
                        ) ) }
                    </div>

                    <a
                        href="https://welabs.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block no-underline mt-auto"
                    >
                        <DokanButton variant="primary" className="w-full">
                            { __( 'Visit weLabs', 'dokan-lite' ) }
                            <ExternalLink size={ 14 } />
                        </DokanButton>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Services;
