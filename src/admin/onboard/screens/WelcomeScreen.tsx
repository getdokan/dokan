import Logo from '../Logo';
import { __ } from '@wordpress/i18n';
import { Button } from '@getdokan/dokan-ui';

const WelcomeScreen = ( { onNext } ) => {
    return (
        <div
            className={ `min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center` }
        >
            <div className="drop-shadow-lg rounded-2xl overflow-hidden bg-white w-[65%] mx-auto h-[532px] border border-solid border-[#E9E9E9] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="mb-10">
                        <Logo />
                    </div>
                    <div className="welcome-content max-w-[450px]">
                        <h1 className="text-3xl md:text-4xl font-bold mb-7 leading-10">
                            { __(
                                'Welcome to Your New Multi-Vendor Marketplace!',
                                'dokan'
                            ) }
                        </h1>
                        <p className="text-[#575757] max-w-lg mb-16 leading-6 font-medium text-base px-4">
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
            </div>
        </div>
    );
};

export default WelcomeScreen;
