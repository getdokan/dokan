import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Check, Loader2, Download, CircleCheck } from 'lucide-react';
import { DokanButton } from '@dokan/components';
import PlaceholderIcon from './PlaceholderIcon';
import { applyFilters } from '@wordpress/hooks';

export type Addon = {
    slug: string;
    title: string;
    description: string;
    image: string;
    button_type: 'install' | 'get_plugin';
    wp_org_slug?: string;
    url?: string;
    basename?: string;
    installed: boolean;
};

export type EcosystemItem = {
    title: string;
    description: string;
};

export const ExtensionIcon = ( {
    src,
    alt,
    className = 'rounded-lg object-contain',
}: {
    src: string;
    alt: string;
    className?: string;
} ) => {
    const [ failed, setFailed ] = useState( false );

    if ( failed || ! src ) {
        return <PlaceholderIcon />;
    }

    return (
        <img
            src={ src }
            alt={ alt }
            className={ className }
            onError={ () => setFailed( true ) }
        />
    );
};

const RecommendedAddons = ( { addons }: { addons: Addon[] } ) => {
    const [ installingSlugs, setInstallingSlugs ] = useState< string[] >( [] );
    const [ installedSlugs, setInstalledSlugs ] = useState< string[] >(
        addons.filter( ( a ) => a.installed ).map( ( a ) => a.slug )
    );

    const handleInstall = async ( addon: Addon ) => {
        if ( ! addon.wp_org_slug || installingSlugs.includes( addon.slug ) ) {
            return;
        }

        setInstallingSlugs( ( prev ) => [ ...prev, addon.slug ] );

        try {
            await apiFetch( {
                path: '/dokan/v1/admin/extensions/install',
                method: 'POST',
                data: { slug: addon.wp_org_slug },
            } );

            setInstalledSlugs( ( prev ) => [ ...prev, addon.slug ] );
        } catch ( error ) {
            // eslint-disable-next-line no-console
            console.error( 'Plugin install failed:', error );
        } finally {
            setInstallingSlugs( ( prev ) =>
                prev.filter( ( s ) => s !== addon.slug )
            );
        }
    };

    const renderButton = ( addon: Addon ) => {
        const isInstalled = installedSlugs.includes( addon.slug );
        const isInstalling = installingSlugs.includes( addon.slug );

        if ( isInstalled ) {
            return (
                <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md cursor-not-allowed"
                >
                    <Check size={ 16 } />
                    { __( 'Installed', 'dokan-lite' ) }
                </button>
            );
        }

        if ( addon.button_type === 'get_plugin' ) {
            return (
                <a
                    href={ addon.url }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block no-underline"
                >
                    <DokanButton variant="primary" className="w-full">
                        { __( 'Get Plugin', 'dokan-lite' ) }
                    </DokanButton>
                </a>
            );
        }

        return (
            <DokanButton
                variant="primary"
                className="w-full"
                onClick={ () => handleInstall( addon ) }
                disabled={ isInstalling }
            >
                { isInstalling ? (
                    <>
                        <Loader2 size={ 16 } className="animate-spin" />
                        { __( 'Installing…', 'dokan-lite' ) }
                    </>
                ) : (
                    <>
                        <Download size={ 16 } />
                        { __( 'Install', 'dokan-lite' ) }
                    </>
                ) }
            </DokanButton>
        );
    };

    const ecosystemItems = applyFilters( 'dokan_extensions_ecosystem_items', [
        {
            title: __( '14 Days Money Back Guarantee', 'dokan-lite' ),
            description: __(
                "Get a full refund within 14 days if our plugin doesn't meet your needs—no questions asked!",
                'dokan-lite'
            ),
        },
        {
            title: __(
                'Help Is Just a Click Away, Day or Night!',
                'dokan-lite'
            ),
            description: __(
                'Receive expert support 24/7 to keep your business running smoothly, anytime you need help.',
                'dokan-lite'
            ),
        },
        {
            title: __( 'Regular Releases', 'dokan-lite' ),
            description: __(
                'Stay ahead with frequent updates, new features, and enhancements to keep your marketplace running at its best.',
                'dokan-lite'
            ),
        },
    ] );

    const renderItem = ( item: EcosystemItem ): JSX.Element => (
        <div key={ item.title } className="flex flex-col">
            <div className="flex items-center gap-3 mb-3 text-[#7047EB]">
                <CircleCheck size={ 20 } />
                <h3 className="text-sm font-semibold text-[#575757]">
                    { item?.title }
                </h3>
            </div>
            <p className="text-xs text-[#828282] leading-relaxed">
                { item?.description }
            </p>
        </div>
    );

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
                { addons.map( ( addon ) => (
                    <div
                        key={ addon.slug }
                        className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md relative"
                    >
                        <div className="px-5 pt-5 pb-3 flex justify-between items-start">
                            <ExtensionIcon
                                src={ addon.image }
                                alt={ addon.title }
                            />
                            { addon.button_type === 'get_plugin' ? (
                                <span className="flex items-center gap-1 text-xs font-medium text-[#D3941E] bg-[#FFF9E9] px-2 py-0.5 rounded-full border border-[#FFE7A5]">
                                    <img
                                        src={ `${
                                            ( window as any )
                                                .dokanAdminDashboard.urls
                                                .assetsUrl
                                        }/images/extensions/crown.svg` }
                                        alt="Pro"
                                        className="w-3 h-3"
                                    />
                                    { __( 'Pro', 'dokan-lite' ) }
                                </span>
                            ) : (
                                <span className="text-xs font-medium text-[#039855] bg-[#ECFDF3] px-2 py-0.5 rounded-full border border-[#D1FADF]">
                                    • { __( 'Free', 'dokan-lite' ) }
                                </span>
                            ) }
                        </div>

                        <div className="flex flex-col flex-1 px-5 pb-5 pt-2">
                            <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
                                { addon.title }
                            </h3>
                            <p className="text-[13px] text-gray-500 leading-relaxed mb-5 flex-1">
                                { addon.description }
                            </p>
                            <div className="mt-auto">
                                { renderButton( addon ) }
                            </div>
                        </div>
                    </div>
                ) ) }
            </div>

            <div className="mt-12 space-y-5">
                <h2 className="text-2xl font-bold text-[#25252D]">
                    { __( 'Your complete business ecosystem', 'dokan-lite' ) }
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-20 p-7 bg-white rounded-md shadow">
                    { ecosystemItems?.map( renderItem ) }
                </div>
            </div>
        </>
    );
};

export default RecommendedAddons;
