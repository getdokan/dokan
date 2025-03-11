import DokanLogo from '../Logo';
import { __ } from '@wordpress/i18n';
import { Button } from '@getdokan/dokan-ui';
import OnBoardLayout from '@dokan/admin/onboard/OnBoardLayout';

const WelcomeScreen = ( { onNext } ) => {
    return (
        <OnBoardLayout>
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="md:mb-10 mb-5">
                    <DokanLogo />
                </div>
                <div className="welcome-content max-w-[450px]">
                    <h1 className="sm:text-3xl md:text-4xl text-base font-bold mb-4 md:mb-7 md:leading-[1.3]">
                        { __(
                            'Welcome to Your New Multi-Vendor Marketplace!',
                            'dokan'
                        ) }
                    </h1>
                    <p className="mb-16 px-5 text-sm sm:text-base text-[#575757]">
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
        </OnBoardLayout>
    );
};

export default WelcomeScreen;
