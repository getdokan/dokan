import NotFoundIcon from '@dokan/layout/Icons/NotFoundIcon';
import { __ } from '@wordpress/i18n';
import { Button } from '@getdokan/dokan-ui';

const NotFound = () => {
    // @ts-ignore
    const dashBoardUrl = window.dokan?.urls?.dashboardUrl ?? '#';
    return (
        <div className="bg-[url('/assets/images/error-page-bg.png')] bg-no-repeat bg-center md:w-[42rem] w-full bg-cover h-[21rem] ">
            <div className="flex flex-col items-center justify-center h-full gap-6">
                <NotFoundIcon />
                <div className="flex flex-col gap-4 justify-center items-center">
                    <h1 className="text-xl font-bold text-center tracking-wide">
                        { __( 'Sorry, the page can’t be found', 'dokan-lite' ) }
                    </h1>
                    <p className="max-w-[23rem] text-center font-normal text-[#637381]">
                        { __(
                            'The page you were looking for appears to have been moved, deleted or does not exist',
                            'dokan-lite'
                        ) }
                    </p>
                    <Button
                        color={ 'primary' }
                        className="w-[11rem] h-9 py-2 px-5 text-[#EFF4FB]"
                        href={ dashBoardUrl }
                    >
                        { __( 'Back to Dashboard', 'dokan-lite' ) }
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
