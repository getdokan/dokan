import Logo from './Logo';
import { __ } from '@wordpress/i18n';
import { Button } from '@getdokan/dokan-ui';
import { useEffect, useState } from '@wordpress/element';

interface Addon {
    id: string;
    icon?: string;
    title: string;
    description: string;
    info?: {
        name: string;
        slug: string;
        [ key: string ]: any;
    };
}

interface AddonsScreenProps {
    onNext: () => void;
    onBack: () => void;
    onSkip: () => void;
    selectedAddons: string[];
    availableAddons: Array< {
        id: string;
        title: string;
        description: string;
        img_url: string;
        img_alt: string;
        plugins: {
            name: string;
            slug: string;
        }[];
    } >;
    onUpdate: ( addonIds: string[] ) => void;
}

const AddonsScreen = ( {
    onNext,
    onBack,
    onSkip,
    selectedAddons = [],
    availableAddons = [],
    onUpdate,
}: AddonsScreenProps ) => {
    const [ localSelectedAddons, setLocalSelectedAddons ] =
        useState< string[] >( selectedAddons );

    // Map API addons to UI  format if available
    const displayAddons: Addon[] =
        availableAddons.length > 0
            ? availableAddons.map( ( addon ) => ( {
                  id: addon?.plugins[ 0 ]?.slug,
                  icon: addon?.img_url,
                  title: addon?.title || 'Plugin',
                  description:
                      addon?.description ||
                      'Enhance your marketplace with this plugin',
                  info: addon?.plugins[ 0 ],
              } ) )
            : [];

    // Helper function for addon icons
    function getAddonIcon( id: string ): string {
        const icons: { [ key: string ]: string } = {
            analytics: '📊',
            social: '🔔',
            automation: '🛒',
            email: '✉️',
            loyalty: '🏆',
            reports: '📈',
            wemail: '📧',
            'dokan-pro': '🛍️',
        };

        return icons[ id ] || '🔌';
    }

    // Update parent component when selected addons change
    useEffect( () => {
        onUpdate( localSelectedAddons );
    }, [ localSelectedAddons ] );

    const toggleAddon = ( id: string ) => {
        if ( localSelectedAddons.includes( id ) ) {
            setLocalSelectedAddons(
                localSelectedAddons.filter( ( item ) => item !== id )
            );
        } else {
            setLocalSelectedAddons( [ ...localSelectedAddons, id ] );
        }
    };

    const handleNext = () => {
        // Ensure selected addons are updated before proceeding
        onUpdate( localSelectedAddons );
        onNext();
    };

    return (
        <div className={ `min-h-screen flex items-center justify-center` }>
            <div className="p-8 md:p-10 max-w-4xl">
                <div className="mb-8">
                    <Logo />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-6">
                    { __(
                        'Enhance Your Marketplace with these Recommended Add-ons',
                        'dokan'
                    ) }
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    { displayAddons.map( ( addon ) => (
                        <div
                            key={ addon.id }
                            className={ `border rounded-lg p-4 flex items-center cursor-pointer transition-colors ${
                                localSelectedAddons.includes( addon.id )
                                    ? 'border-indigo-600 bg-indigo-50'
                                    : 'border-gray-300'
                            }` }
                            onClick={ () => toggleAddon( addon.id ) }
                        >
                            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center mr-4">
                                <img
                                    src={
                                        addon.icon || getAddonIcon( addon.id )
                                    }
                                    alt={ addon.title }
                                    className="w-6 h-6"
                                />
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-medium">{ addon.title }</h3>
                                <p className="text-sm text-gray-500">
                                    { addon.description }
                                </p>
                            </div>
                            { localSelectedAddons.includes( addon.id ) && (
                                <div className="ml-4 bg-indigo-600 text-white rounded-full p-1">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                            ) }
                        </div>
                    ) ) }
                </div>

                <div className="flex justify-between">
                    <Button
                        onClick={ onBack }
                        className="flex items-center text-gray-600 font-medium border-0 shadow-none"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                        { __( 'Back', 'dokan' ) }
                    </Button>
                    <div className="flex space-x-4">
                        <Button
                            onClick={ onSkip }
                            className="text-gray-600 font-medium py-2 px-4 border-0 shadow-none"
                        >
                            { __( 'Skip', 'dokan' ) }
                        </Button>
                        <Button
                            onClick={ handleNext }
                            className="bg-dokan-btn hover:bg-dokan-btn-hover text-white rounded-md py-3 px-8 flex items-center"
                        >
                            { __( 'Next', 'dokan' ) }
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 ml-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddonsScreen;
