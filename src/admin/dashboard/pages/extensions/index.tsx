import { __ } from '@wordpress/i18n';
import getSettings from '../../settings/getSettings';
import RecommendedAddons from './RecommendedAddons';
import MobileApps from './MobileApps';
import Compatibility from './Compatibility';
import Services from './Services';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@wedevs/plugin-ui';

const ExtensionsPage = () => {
    const extensionsSettings = getSettings( 'extensions' ) || {};
    const {
        recommended = [],
        mobile_apps: mobileApps = [],
        banner_icons: bannerIcons = '',
    } = extensionsSettings?.extensions || {};

    const bannerBackground = 'linear-gradient(270deg, #F2EAFF 0%, #FFFFFF 60%)';

    return (
        <div className="dokan-extensions-page">
            <div className="mb-4">
                <h1 className="text-xl font-semibold text-gray-800 m-0">
                    { __( 'Extensions', 'dokan-lite' ) }
                </h1>
            </div>

            <div className="bg-white p-1.5 rounded-md mb-8">
                <div
                    className="flex items-center justify-between p-6"
                    style={ { background: bannerBackground } }
                >
                    <div className="max-w-md">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            { __(
                                'Supercharge Your Marketplace',
                                'dokan-lite'
                            ) }
                        </h2>
                        <p className="text-[15px] text-gray-600 leading-relaxed m-0">
                            { __(
                                'Power up your platform with powerful plugins, themes, and seamless integrations.',
                                'dokan-lite'
                            ) }
                        </p>
                    </div>
                    { bannerIcons && (
                        <img
                            src={ bannerIcons }
                            alt="Banner Icons"
                            className="h-20 w-auto"
                        />
                    ) }
                </div>
            </div>

            <Tabs defaultValue="recommended">
                <TabsList variant="line">
                    <TabsTrigger value="recommended">
                        { __( 'Recommended Addons', 'dokan-lite' ) }
                    </TabsTrigger>
                    <TabsTrigger value="mobile-apps">
                        { __( 'Mobile Apps', 'dokan-lite' ) }
                    </TabsTrigger>
                    <TabsTrigger value="compatibility">
                        { __( 'Compatibility', 'dokan-lite' ) }
                    </TabsTrigger>
                    <TabsTrigger value="services">
                        { __( 'Services', 'dokan-lite' ) }
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="recommended">
                    <RecommendedAddons addons={ recommended } />
                </TabsContent>
                <TabsContent value="mobile-apps">
                    <MobileApps apps={ mobileApps } />
                </TabsContent>
                <TabsContent value="compatibility">
                    <Compatibility />
                </TabsContent>
                <TabsContent value="services">
                    <Services />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ExtensionsPage;
