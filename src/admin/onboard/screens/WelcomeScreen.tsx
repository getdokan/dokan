import DokanLogo from '../DokanLogo';
import { __ } from '@wordpress/i18n';
import { Button } from '@getdokan/dokan-ui';
import OnBoardLayout from '@dokan/admin/onboard/OnBoardLayout';

const WelcomeScreen = ( { onNext } ) => {
    return (
        <OnBoardLayout>
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center h-full">
                <div className="md:mb-8 mb-5">
                    <DokanLogo />
                </div>
                <div className="welcome-content max-w-[450px]">
                    <h1 className="sm:text-2xl md:text-3xl text-base font-bold mb-4 md:mb-6 md:leading-[1.3] px-8">
                        { __(
                            'Welcome to Your New Multi-Vendor Marketplace!',
                            'dokan-lite'
                        ) }
                    </h1>
                    <p className="mb-14 px-5 text-sm sm:text-base text-[#575757]">
                        { __(
                            "Ready to revolutionize online selling? We're excited to help you create a marketplace that stands out! Let's start with a few quick questions.",
                            'dokan-lite'
                        ) }
                    </p>
                </div>
                <Button
                    onClick={ onNext }
                    className="bg-[#7047EB]  text-white rounded-md py-3 px-8 hover:bg-indigo-600 flex items-center"
                >
                    { __( 'Start Journey', 'dokan-lite' ) }
                </Button>
            </div>
        </OnBoardLayout>
    );
};

export default WelcomeScreen;
