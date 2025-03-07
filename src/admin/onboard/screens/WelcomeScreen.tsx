import Logo from '../Logo';
import { __ } from '@wordpress/i18n';
import { Button } from '@getdokan/dokan-ui';
import OnboardingLayout from '@dokan/admin/onboard/OnboardingLayout';

const WelcomeScreen = ( { onNext } ) => {
    return (
        <OnboardingLayout>
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="md:mb-10 mb-5">
                    <Logo />
                </div>
                <div className="welcome-content max-w-[450px]">
                    <h1 className="sm:text-3xl md:text-4xl text-base font-bold mb-4 md:mb-7 md:leading-10">
                        { __(
                            'Welcome to Your New Multi-Vendor Marketplace!',
                            'dokan'
                        ) }
                    </h1>
                    <p className="text-[#575757] max-w-lg mb-16 sm:leading-6 font-medium text-sm sm:text-base px-4">
                        { __(
                            "Ready to revolutionize online selling? We're excited to help you create a marketplace that stands out! Let's start with a few quick questions.",
                            'dokan'
                        ) }
                    </p>
                </div>
                <Button
                    onClick={ onNext }
                    className="bg-[#7047EB]  text-white rounded-md py-3 px-8"
                >
                    { __( 'Start Journey', 'dokan' ) }
                </Button>
            </div>
        </OnboardingLayout>
    );
};

export default WelcomeScreen;
