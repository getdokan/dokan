import { __ } from '@wordpress/i18n';
import { ExternalLink } from 'lucide-react';
import { DokanButton } from '@dokan/components';

const Compatibility = () => {
    return (
        <div className="flex items-center justify-center mt-10">
            <div className="max-w-2xl w-full bg-white rounded-2xl border border-dashed border-gray-300 py-14 px-10 text-center">
                <h2
                    className="text-7xl font-extrabold mb-3 italic"
                    style={ { color: '#7047EB' } }
                >
                    100+
                </h2>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                    { __( 'Compatible Themes & Plugins', 'dokan-lite' ) }
                </h3>
                <p className="text-sm text-gray-500 mb-8 max-w-lg mx-auto leading-relaxed">
                    { __(
                        'Dokan works seamlessly with a wide range of WordPress themes and plugins. Browse our curated lists to find the perfect combination for your marketplace.',
                        'dokan-lite'
                    ) }
                </p>

                <div className="flex items-center justify-center gap-3">
                    <a
                        href="https://dokan.co/wordpress/themes/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline"
                    >
                        <DokanButton variant="secondary">
                            { __( 'Browse Themes', 'dokan-lite' ) }
                            <ExternalLink size={ 14 } />
                        </DokanButton>
                    </a>
                    <a
                        href="https://dokan.co/wordpress/compatible-plugins/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline"
                    >
                        <DokanButton variant="primary">
                            { __( 'Browse Plugins', 'dokan-lite' ) }
                            <ExternalLink size={ 14 } />
                        </DokanButton>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Compatibility;
