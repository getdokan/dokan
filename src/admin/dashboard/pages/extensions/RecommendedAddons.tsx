import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Loader2, ExternalLink } from 'lucide-react';
import PlaceholderIcon from './PlaceholderIcon';
import { applyFilters } from '@wordpress/hooks';
import { Button } from '@wedevs/plugin-ui';
import { sortByPosition } from 'admin/dashboard/pages/dashboard/utils/sorting';

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

    const filteredAddons = addons ? sortByPosition( { ...addons } ) : [];

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
                <Button disabled variant="secondary" className="px-5">
                    { __( 'Installed', 'dokan-lite' ) }
                </Button>
            );
        }

        if ( addon.button_type === 'get_plugin' ) {
            return (
                <a
                    href={ addon.url }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block no-underline w-fit"
                >
                    <Button variant="default" className="gap-2.5 px-5">
                        { __( 'Get Addon', 'dokan-lite' ) }
                        <ExternalLink size={ 16 } />
                    </Button>
                </a>
            );
        }

        return (
            <Button
                className="px-5"
                variant="default"
                disabled={ isInstalling }
                onClick={ () => handleInstall( addon ) }
            >
                { isInstalling ? (
                    <>
                        <Loader2 size={ 16 } className="animate-spin" />
                        { __( 'Installing…', 'dokan-lite' ) }
                    </>
                ) : (
                    __( 'Install Free', 'dokan-lite' )
                ) }
            </Button>
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
            <div className="flex items-start gap-3 text-[#7047EB]">
                <img
                    src={ `${
                        ( window as any ).dokanAdminDashboard.urls.assetsUrl
                    }/images/extensions/check.svg` }
                    alt={ __( 'Circle Check Icon', 'dokan-lite' ) }
                />
                <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-[#575757]">
                        { item?.title }
                    </h3>
                    <p className="text-xs text-[#828282] leading-relaxed">
                        { item?.description }
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-3.5 mb-10">
                { filteredAddons.map( ( [ _, addon ] ) => (
                    <div
                        key={ addon.slug }
                        className="flex flex-col bg-white rounded-md shadow relative"
                    >
                        <div className="px-5 pt-5 pb-3 flex justify-between items-start">
                            <ExtensionIcon
                                src={ addon.image }
                                alt={ addon.title }
                            />
                            { addon.button_type === 'get_plugin' ? (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-[#952D00] bg-[#FEFCE8] px-2 py-1 rounded-md border border-[#F6E5BA]">
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
                                <span className="flex items-center gap-1.5 text-xs font-medium text-[#008236] bg-[#DCFCE7] px-2 py-1.5 rounded-md leading-none">
                                    <span className="w-1.5 h-1.5 bg-[#02C951] block rounded-full" />
                                    { __( 'Free', 'dokan-lite' ) }
                                </span>
                            ) }
                        </div>

                        <div className="flex flex-col flex-1 px-5 pb-5 pt-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                { addon.title }
                            </h3>
                            <p className="text-sm text-[#25252D] leading-relaxed mb-9 flex-1">
                                { addon.description }
                            </p>
                            <div className="mt-auto">
                                { renderButton( addon ) }
                            </div>
                        </div>
                    </div>
                ) ) }
            </div>

            <div className="space-y-5">
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
