import { __ } from '@wordpress/i18n';
import getSettings from '../../settings/getSettings';
import RecommendedAddons from './RecommendedAddons';
import MobileApps from './MobileApps';
import Compatibility from './Compatibility';
import Services from './Services';
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@wedevs/plugin-ui';

const ExtensionsPage = () => {
    const extensionsSettings = getSettings( 'extensions' ) || {};
    const { recommended = [], mobile_apps: mobileApps = [] } =
        extensionsSettings?.extensions || {};

    return (
        <div className="dokan-extensions-page">
            <div className="mb-4">
                <h1 className="text-xl font-semibold text-gray-800 m-0">
                    { __( 'Extensions', 'dokan-lite' ) }
                </h1>
                <p className="text-sm text-gray-500 mt-1 mb-0">
                    { __(
                        'Enhance your marketplace with Dokan plugins, apps, themes, and integrations.',
                        'dokan-lite'
                    ) }
                </p>
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
