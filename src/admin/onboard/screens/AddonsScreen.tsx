import DokanLogo from '../DokanLogo';
import { __ } from '@wordpress/i18n';
import { Button } from '@getdokan/dokan-ui';
import { useEffect, useState } from '@wordpress/element';
import BackButton from '@dokan/admin/onboard/components/BackButton';
import NextButton from '@dokan/admin/onboard/components/NextButton';
import SinglePlugin from '@dokan/admin/onboard/components/SinglePlugin';

const AddonsScreen = ( {
    onNext,
    onBack,
    onSkip,
    availableAddons = [],
    selectedPlugins,
    onUpdate,
} ) => {
    const [ localSelectedAddons, setLocalSelectedAddons ] =
        useState( selectedPlugins );

    // Map API addons to UI format if available
    const displayAddons =
        availableAddons.length > 0
            ? availableAddons.map( ( addon ) => ( {
                  id: addon?.slug,
                  icon: addon?.img_url,
                  title: addon?.title || __( 'Plugin', 'dokan-lite' ),
                  description:
                      addon?.description ||
                      __(
                          'Enhance your marketplace with this plugin',
                          'dokan-lite'
                      ),
                  info: addon,
              } ) )
            : [];

    // Update parent component when selected addons change
    useEffect( () => {
        onUpdate( localSelectedAddons );
    }, [ localSelectedAddons ] );

    const toggleAddon = ( id ) => {
        if ( localSelectedAddons?.includes( id ) ) {
            setLocalSelectedAddons(
                localSelectedAddons?.filter( ( item ) => item !== id )
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

    const handleSkip = () => {
        // Skip without updating the selected addons
        onSkip();
    };

    return (
        <div className={ `min-h-screen flex items-center justify-center` }>
            <div className="p-8 md:p-10 max-w-3xl">
                <div className="mb-12">
                    <DokanLogo />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    { __(
                        'Enhance Your Marketplace with these Recommended Add-ons',
                        'dokan-lite'
                    ) }
                </h1>
                <p className="text-sm text-gray-500 mb-8">
                    { __(
                        'We recommend some plugins for the marketplace. You can select from the following suggestions and based on your selection we will install and activate them for you so that your experience remains flawless',
                        'dokan-lite'
                    ) }
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-10">
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
                            onClick={ handleSkip }
                            className="text-gray-600 font-medium py-2 px-4 border-0 shadow-none"
                        >
                            { __( 'Skip', 'dokan-lite' ) }
                        </Button>
                        <NextButton handleNext={ () => handleNext() } />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddonsScreen;
