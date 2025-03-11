import Logo from '../Logo';
import { __ } from '@wordpress/i18n';
import { Button } from '@getdokan/dokan-ui';
import OnboardingLayout from '../OnboardingLayout';

const SuccessScreen = () => {
    const redirectUrl = window?.onboardingData?.dokan_admin_dashboard_url;
    return (
        <OnboardingLayout>
            <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                <div className="mb-8">
                    <Logo />
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
        </OnboardingLayout>
    );
};

export default SuccessScreen;
