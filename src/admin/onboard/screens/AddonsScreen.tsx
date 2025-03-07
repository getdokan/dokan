import Logo from '../Logo';
import { __ } from '@wordpress/i18n';
import { Button } from '@getdokan/dokan-ui';
import { useEffect, useState } from '@wordpress/element';
import BackButton from '@dokan/admin/onboard/components/BackButton';
import NextButton from '@dokan/admin/onboard/components/NextButton';
import React from 'react';
import SinglePlugin from '@dokan/admin/onboard/components/SinglePlugin';

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
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    { __(
                        'Enhance Your Marketplace with these Recommended Add-ons',
                        'dokan'
                    ) }
                </h1>
                <p className="text-sm text-gray-500 mb-5">
                    { __(
                        'We recommend some plugins for the marketplace. You can' +
                            'select from the following suggestions and based on your' +
                            'selection we will install and activate them for you so that' +
                            'your experience remains flawless',
                        'dokan'
                    ) }
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    { displayAddons.map( ( addon ) => (
                        <SinglePlugin
                            addon={ addon }
                            isSelected={ localSelectedAddons.includes(
                                addon.id
                            ) }
                            toggleAddon={ toggleAddon }
                            key={ addon.id }
                        />
                    ) ) }
                </div>

                <div className="flex justify-between flex-wrap">
                    <BackButton onBack={ onBack } />

                    <div className="flex space-x-4 sm:w-auto w-full justify-end">
                        <Button
                            onClick={ onSkip }
                            className="text-gray-600 font-medium py-2 px-4 border-0 shadow-none"
                        >
                            { __( 'Skip', 'dokan' ) }
                        </Button>
                        <NextButton handleNext={ handleNext } />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddonsScreen;
