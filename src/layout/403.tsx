import { __ } from '@wordpress/i18n';
import ForbiddenIcon from '@dokan/layout/Icons/ForbiddenIcon';
import { DokanButton } from '@dokan/components';
import { Slot } from '@wordpress/components';

const Forbidden = ( {
    children,
    navigateButton,
    title = __( 'Permission Denied', 'dokan-lite' ),
    message = __(
        'Sorry, you don’t have permission to access this page',
        'dokan-lite'
    ),
}: {
    children: JSX.Element;
    navigateButton?: JSX.Element;
    title?: string;
    message?: string;
} ) => {
    // @ts-ignore
    const dashBoardUrl = window.dokan?.urls?.dashboardUrl ?? '#';

    return (
        <>
            { children ? (
                children
            ) : (
                <div className="bg-[url('/assets/images/error-page-bg.png')] bg-no-repeat bg-center w-full bg-cover h-[21rem] ">
                    <Slot name="before-dokan-forbidden" />
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <ForbiddenIcon color={ `text-dokan-link` } />
                        <div className="flex flex-col gap-1 justify-center items-center">
                            <h1 className="text-xl font-bold text-center tracking-wide">
                                { title }
                            </h1>
                            <p className="max-w-[24rem] text-center font-normal leading-6 text-[#637381]">
                                { message }
                            </p>
                            { navigateButton ?? (
                                <DokanButton
                                    link={ true }
                                    href={ dashBoardUrl }
                                    variant={ 'primary' }
                                    className="w-[10.5rem] mt-2 py-2"
                                >
                                    { __( 'Back to Dashboard', 'dokan-lite' ) }
                                </DokanButton>
                            ) }
                        </div>
                    </div>
                    <Slot name="after-dokan-forbidden" />
                </div>
            ) }
        </>
    );
};

export default Forbidden;
