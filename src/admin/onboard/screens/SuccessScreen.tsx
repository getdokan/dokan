import DokanLogo from '../Logo';
import { __ } from '@wordpress/i18n';
import { Button } from '@getdokan/dokan-ui';
import OnBoardLayout from '../OnBoardLayout';

const SuccessScreen = () => {
    const redirectUrl = window?.onboardingData?.dokan_admin_dashboard_url;
    return (
        <OnBoardLayout>
            <div className="flex flex-col items-center h-full justify-center py-16 px-6 text-center">
                <div className="mb-8">
                    <DokanLogo />
                </div>
                <h1 className="text-3xl font-bold mb-4">
                    { __( 'Congratulations! 🎉', 'dokan' ) }
                </h1>
                <p className="text-xl mb-10">
                    { __( "You're all set to start selling.", 'dokan' ) }
                </p>
                <Button
                    link={ true }
                    href={ redirectUrl }
                    className="bg-[#7047EB] text-white rounded-md py-3 px-8 flex items-center"
                >
                    { __( 'Explore Dashboard', 'dokan' ) }
                </Button>
            </div>
        </OnBoardLayout>
    );
};

export default SuccessScreen;
