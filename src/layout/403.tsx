import { __ } from '@wordpress/i18n';
import ForbiddenIcon from '@dokan/layout/Icons/ForbiddenIcon';
import { DokanButton } from '@dokan/components';
import { Slot } from '@wordpress/components';

const Forbidden = ( {
    navigateButton,
    message = __(
        'Sorry, you don’t have permission to access this page',
        'dokan-lite'
    ),
}: {
    navigateButton?: React.ReactNode;
    message?: string;
} ) => {
    // @ts-ignore
    const dashBoardUrl = window.dokan?.urls?.dashboardUrl ?? '#';

    return (
        <div className="bg-[url('/assets/images/error-page-bg.png')] bg-no-repeat bg-center md:w-[42rem] w-full bg-cover h-[21rem] ">
            <Slot name="before-dokan-forbidden" />
            <div className="flex flex-col items-center justify-center h-full gap-3">
                <ForbiddenIcon />
                <div className="flex flex-col gap-1 justify-center items-center">
                    <h1 className="text-xl font-bold text-center tracking-wide">
                        { __( 'Permission Denied', 'dokan-lite' ) }
                    </h1>
                    <p className="max-w-[24rem] text-center font-normal leading-6 text-[#637381]">
                        { message }
                    </p>
                    { navigateButton ?? (
                        <DokanButton
                            variant={ 'primary' }
                            className="w-[10.5rem] h-10 mt-2 "
                            href={ dashBoardUrl }
                        >
                            { __( 'Back to Dashboard', 'dokan-lite' ) }
                        </DokanButton>
                    ) }
                </div>
            </div>
            <Slot name="after-dokan-forbidden" />
        </div>
    );
};

export default Forbidden;
