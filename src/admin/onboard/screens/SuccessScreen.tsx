import DokanLogo from '../DokanLogo';
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
                <div className={ `success-heading mb-2` }>
                    <h1 className="text-3xl font-bold mb-4 leading-[48px]">
                        { __( 'Congratulations! 🎉', 'dokan-lite' ) }
                        <br />
                        { __(
                            "You're all set to start selling.",
                            'dokan-lite'
                        ) }
                    </h1>
                </div>
                <Button
                    color={ 'primary' }
                    link={ true }
                    href={ redirectUrl }
                    className="bg-[#7047EB] !text-white rounded-md py-3 px-8 flex items-center"
                >
                    { __( 'Explore Dashboard', 'dokan-lite' ) }
                </Button>
            </div>
        </OnBoardLayout>
    );
};

export default SuccessScreen;
