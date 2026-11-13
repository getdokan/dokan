import DokanLogo from '../DokanLogo';
import { __ } from '@wordpress/i18n';
import { Button } from '@getdokan/dokan-ui';
import { useEffect, useState } from '@wordpress/element';
import BackButton from '@src/admin/onboard/components/BackButton';
import NextButton from '@src/admin/onboard/components/NextButton';
import SinglePlugin from '@src/admin/onboard/components/SinglePlugin';

// Three rows of the two-column grid; the rest sit behind "Show More".
const COLLAPSED_ADDON_COUNT = 6;

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
    const [ showAllAddons, setShowAllAddons ] = useState( false );

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

    const primaryAddons = displayAddons.slice( 0, COLLAPSED_ADDON_COUNT );
    const moreAddons = displayAddons.slice( COLLAPSED_ADDON_COUNT );

    const renderAddon = ( addon ) => (
        <SinglePlugin
            addon={ addon }
            isSelected={ localSelectedAddons.includes( addon.id ) }
            toggleAddon={ toggleAddon }
            key={ addon.id }
        />
    );

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
        <div className="w-full h-full relative">
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

                    <div className="mb-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            { primaryAddons.map( renderAddon ) }
                        </div>

                        { moreAddons.length > 0 && (
                            <>
                                { /* Kept mounted so the rows can slide open and shut; `invisible` takes them out of tab order while closed. */ }
                                <div
                                    id="dokan-onboard-more-addons"
                                    className={ `grid transition-[grid-template-rows,visibility] duration-300 ease-out motion-reduce:transition-none ${
                                        showAllAddons
                                            ? 'grid-rows-[1fr] visible'
                                            : 'grid-rows-[0fr] invisible'
                                    }` }
                                >
                                    <div className="overflow-hidden">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                                            { moreAddons.map( renderAddon ) }
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center mt-3">
                                    <button
                                        type="button"
                                        onClick={ () =>
                                            setShowAllAddons( ! showAllAddons )
                                        }
                                        aria-expanded={ showAllAddons }
                                        aria-controls="dokan-onboard-more-addons"
                                        className="inline-flex items-center gap-1.5 rounded-full border-0 bg-transparent px-3 py-1.5 cursor-pointer text-sm font-medium text-[#7047EB] transition-colors hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7047EB]"
                                    >
                                        { showAllAddons
                                            ? __( 'Show Less', 'dokan-lite' )
                                            : __( 'Show More', 'dokan-lite' ) }
                                        { ! showAllAddons && (
                                            <span
                                                aria-hidden="true"
                                                className="rounded-full bg-indigo-100 px-1.5 text-xs leading-5"
                                            >
                                                +{ moreAddons.length }
                                            </span>
                                        ) }
                                        <svg
                                            aria-hidden="true"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                            className={ `transition-transform duration-300 motion-reduce:transition-none ${
                                                showAllAddons
                                                    ? 'rotate-180'
                                                    : ''
                                            }` }
                                        >
                                            <path
                                                d="M4 6l4 4 4-4"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </>
                        ) }
                    </div>

                    <div className="flex justify-between flex-wrap">
                        <BackButton onBack={ onBack } />

                        <div className="flex space-x-4 sm:w-auto w-full justify-end">
                            <NextButton handleNext={ () => handleNext() } />
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute top-6 right-6   z-10">
                <Button
                    onClick={ handleSkip }
                    className="text-gray-600 font-medium py-2 px-4 border-0 shadow-none text-[#bcbed5]"
                >
                    { __( 'Skip this step', 'dokan-lite' ) }
                </Button>
            </div>
        </div>
    );
};

export default AddonsScreen;
