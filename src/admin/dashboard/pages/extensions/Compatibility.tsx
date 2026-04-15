import { __ } from '@wordpress/i18n';
import { DokanButton } from '@dokan/components';

const Compatibility = () => {
    const assetsUrl = ( window as any ).dokanAdminDashboard.urls.assetsUrl;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            { /* Themes Card */ }
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
                <div
                    className="h-60 flex items-center justify-center relative overflow-hidden"
                    style={ {
                        background:
                            'linear-gradient(180deg, #E8F9F1 0%, #FFFFFF 100%)',
                    } }
                >
                    <img
                        src={ `${ assetsUrl }/images/extensions/compatibility/themes.svg` }
                        alt="Themes"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="p-8 flex flex-col flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        { __( '50+ Compatible Themes', 'dokan-lite' ) }
                    </h2>
                    <p className="text-[15px] text-gray-500 mb-8 leading-relaxed flex-1">
                        { __(
                            'Dokan collaborates flawlessly with a variety of WordPress themes, elevating your marketplace to new heights.',
                            'dokan-lite'
                        ) }
                    </p>
                    <a
                        href="https://dokan.co/wordpress/themes/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline inline-block"
                    >
                        <DokanButton variant="primary" className="w-full py-6">
                            { __( 'Browse Themes', 'dokan-lite' ) }
                        </DokanButton>
                    </a>
                </div>
            </div>

            { /* Plugins Card */ }
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
                <div
                    className="h-[240px] flex items-center justify-center relative overflow-hidden"
                    style={ {
                        background:
                            'linear-gradient(180deg, #F0F5FF 0%, #FFFFFF 100%)',
                    } }
                >
                    <img
                        src={ `${ assetsUrl }/images/extensions/compatibility/plugins.svg` }
                        alt="Plugins"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="p-8 flex flex-col flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        { __( '100+ Integrated Plugins', 'dokan-lite' ) }
                    </h2>
                    <p className="text-[15px] text-gray-500 mb-8 leading-relaxed flex-1">
                        { __(
                            'Dokan integrates effortlessly with a diverse array of WordPress plugins, supercharging your marketplace experience.',
                            'dokan-lite'
                        ) }
                    </p>
                    <a
                        href="https://dokan.co/wordpress/compatible-plugins/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline inline-block"
                    >
                        <DokanButton variant="primary" className="w-full py-6">
                            { __( 'Browse Plugins', 'dokan-lite' ) }
                        </DokanButton>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Compatibility;
