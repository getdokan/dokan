import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Check, Loader2, Download } from 'lucide-react';
import { DokanButton } from '@dokan/components';
import PlaceholderIcon from './PlaceholderIcon';

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

export const ExtensionIcon = ( {
    src,
    alt,
}: {
    src: string;
    alt: string;
} ) => {
    const [ failed, setFailed ] = useState( false );

    if ( failed || ! src ) {
        return <PlaceholderIcon />;
    }

    return (
        <img
            src={ src }
            alt={ alt }
            className="w-[60px] h-[60px] rounded-lg object-contain"
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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            { addons.map( ( addon ) => (
                <div
                    key={ addon.slug }
                    className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md"
                >
                    <div className="px-5 pt-5 pb-3">
                        <ExtensionIcon
                            src={ addon.image }
                            alt={ addon.title }
                        />
                    </div>

                    <div className="flex flex-col flex-1 px-5 pb-5">
                        <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
                            { addon.title }
                        </h3>
                        <p className="text-[13px] text-gray-500 leading-relaxed mb-5 flex-1">
                            { addon.description }
                        </p>
                        <div className="mt-auto">{ renderButton( addon ) }</div>
                    </div>
                </div>
            ) ) }
        </div>
    );
};

export default RecommendedAddons;
