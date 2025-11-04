import { Button } from '@getdokan/dokan-ui';
import { useEffect, useState } from '@wordpress/element';
import getSettings from '../dashboard/settings/getSettings';
import { Step } from '../dashboard/pages/setup-guide';
import { __ } from '@wordpress/i18n';
import { twMerge } from 'tailwind-merge';

interface Props {
    className?: string;
}

const AdminSetupBanner = ( props: Props ) => {
    const [ steps, setSteps ] = useState< Step[] >( [] );
    const [ currentHash, setCurrentHash ] = useState( window.location.hash );

    // Get setup guide banner settings.
    const isSetupCompleted = dokanSetupGuideBanner?.is_setup_guide_steps_completed;
    const setupGuideUrl = dokanSetupGuideBanner?.setup_guide_url;
    const dokanAssetUrl = dokanSetupGuideBanner?.asset_url;

    // Initialize steps.
    useEffect( () => {
        const allSteps: Step[] = getSettings( 'setup' ).steps;
        setSteps( allSteps );
    }, [] );

    // Track hash changes.
    useEffect( () => {
        // Check if the current URL is supported and has the correct hash path.
        const checkAndUpdate = () => {
            setCurrentHash( window.location.hash );
        };

        // Initial check.
        checkAndUpdate();

        // Listen events for comprehensive URL change detection.
        window.addEventListener( 'hashchange', checkAndUpdate );
        return () => window.removeEventListener( 'hashchange', checkAndUpdate );
    }, [] );

    const totalSteps = steps.length;
    const completedSteps = steps.filter( ( step ) => step.is_completed ).length;
    const stepProgress = ( completedSteps / totalSteps ) * 100;
    const isNoStepsCompleted = completedSteps === 0;

    // Check if we should hide the banner.
    const baseHashUrl = currentHash.replace( '#/', '' );
    const basePageQuery = new URLSearchParams( window.location.search ).get(
        'page'
    );
    const isOnSetupPage =
        baseHashUrl === 'setup' && basePageQuery === 'dokan-dashboard';

    // If we're on the setup page or a setup guide is completed, don't show the banner.
    if ( isOnSetupPage || isSetupCompleted ) {
        return;
    }

    return (
        <div
            data-test-id="admin-setup-guide-button"
            className={ twMerge(
                'bg-white rounded-lg p-5 my-4',
                props?.className ?? ''
            ) }
        >
            <div className="flex items-center flex-wrap gap-y-4 justify-between">
                <div className="flex items-center flex-wrap gap-6">
                    <div className="flex items-center justify-center w-16 h-16 bg-white shadow-[0px_2px_14px_1px_rgba(50,22,56,0.06)] rounded-2xl border-2 border-[#5341C20F]">
                        <img
                            src={ `${ dokanAssetUrl }/images/admin-setup-header.svg` }
                            alt={ __( 'Setup Step Icon', 'dokan-lite' ) }
                        />
                    </div>
                    <div className="flex-col flex gap-3">
                        <h2 className="text-lg font-bold text-gray-900 m-0">
                            { __(
                                'Complete your marketplace setup in minutes',
                                'dokan-lite'
                            ) }
                        </h2>
                        <div className="flex gap-2 items-center">
                            <div className="w-36 bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-primary-600 h-3 rounded-full"
                                    style={ { width: `${ stepProgress }%` } }
                                ></div>
                            </div>
                            <div className="text-xs text-[#393939] ">
                                { `${ completedSteps } / ${ totalSteps } ` }
                            </div>
                        </div>
                    </div>
                </div>
                <Button
                    onClick={ () => {
                        if ( setupGuideUrl ) {
                            window.location.href = setupGuideUrl;
                        }
                    } }
                    color="primary"
                    className="text-white bg-[#6F4CEB] text-base font-medium h-[48px] w-[169px] py-2 px-[25px] rounded-md flex items-center"
                >
                    { isNoStepsCompleted
                        ? __( 'Start Setup', 'dokan-lite' )
                        : __( 'Continue Setup', 'dokan-lite' ) }
                </Button>
            </div>
        </div>
    );
};

export default AdminSetupBanner;
