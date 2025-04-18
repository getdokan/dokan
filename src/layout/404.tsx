import NotFoundIcon from '@dokan/layout/Icons/NotFoundIcon';
import { __ } from '@wordpress/i18n';
import { DokanButton } from '../components/Button';
import { Slot } from '@wordpress/components';

const NotFound = ( {
    children,
    navigateButton,
    title = __( 'Sorry, the page can’t be found', 'dokan-lite' ),
    message = __(
        'The page you were looking for appears to have been moved, deleted or does not exist',
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
                <div className="bg-[url('/assets/images/error-page-bg.png')] bg-no-repeat bg-center md:w-[42rem] w-full bg-cover h-[21rem] ">
                    { /*slot for 404*/ }
                    <Slot name="before-dokan-not-found" />
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <NotFoundIcon color={ `text-dokan-link` } />
                        <div className="flex flex-col gap-4 justify-center items-center">
                            <h1 className="text-xl font-bold text-center tracking-wide leading-6">
                                { title }
                            </h1>
                            <p className="max-w-[23rem] text-center font-normal leading-5 text-[#637381]">
                                { message }
                            </p>

                            { navigateButton ?? (
                                <DokanButton
                                    variant={ 'primary' }
                                    className="w-[10.5rem] h-10 mt-2"
                                    href={ dashBoardUrl }
                                >
                                    { __( 'Back to Dashboard', 'dokan-lite' ) }
                                </DokanButton>
                            ) }
                        </div>
                    </div>
                    { /*slot for 404*/ }
                    <Slot name="after-dokan-not-found" />
                </div>
            ) }
        </>
    );
};

export default NotFound;
