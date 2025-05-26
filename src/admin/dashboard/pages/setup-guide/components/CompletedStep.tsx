import HomeIcon from '../../../icons/HomeIcon';
import { __, sprintf } from '@wordpress/i18n';
import { Button } from '@getdokan/dokan-ui';

const CompletedStep = ( { steps, dashBoardUrl } ) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center h-full">
            <div className={ `complete-icon mb-8` }>
                <HomeIcon />
            </div>
            <div className={ `complete-content space-y-3 text-center mb-7` }>
                <h2 className="text-2xl font-bold">
                    { __(
                        'Your Marketplace is  ready to explore',
                        'dokan-lite'
                    ) }
                </h2>
                <p className="text-gray-500 text-lg leading-5">
                    { sprintf(
                        __( '%1$s of %1$s tasks completed', 'dokan-lite' ),
                        steps.length
                    ) }
                </p>
            </div>
            <Button
                link={ true }
                color={ 'primary' }
                href={ dashBoardUrl }
                className={ `bg-[#7047EB] !text-white text-base font-medium py-2.5 px-5 flex items-center rounded-md m-0` }
            >
                { __( 'Visit Dokan Dashboard', 'dokan-lite' ) }
            </Button>
        </div>
    );
};

export default CompletedStep;
