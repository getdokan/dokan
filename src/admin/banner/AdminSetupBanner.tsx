import { Button } from '@getdokan/dokan-ui';
import { useEffect, useState } from '@wordpress/element';
import getSettings from '../dashboard/settings/getSettings';
import { Step } from '../dashboard/pages/setup-guide';
import { __ } from '@wordpress/i18n';

const AdminSetupBanner = () => {
    const [ steps, setSteps ] = useState< Step[] >( [] );

    if ( dokanSetupGuideBanner?.is_setup_guide_steps_completed ) {
        return;
    }

    useEffect( () => {
        const allSteps: Step[] = getSettings( 'setup' ).steps;
        setSteps( allSteps );
    }, [] );

    const totalSteps = steps.length;
    const completedSteps = steps.filter( ( step ) => step.is_completed ).length;
    const stepProgress = ( completedSteps / totalSteps ) * 100;
    const isNoStepsCompleted = completedSteps === 0;
    const setupGuideUrl = dokanSetupGuideBanner?.setup_guide_url;
    const dokanAssetUrl = dokanSetupGuideBanner?.asset_url;

    return (
        <div
            data-test-id="admin-setup-guide-button"
            className="bg-white rounded-lg p-5 my-4 mr-[20px]"
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
                        <h2 className="text-lg  font-bold text-gray-900">
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
