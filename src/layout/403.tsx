import { __ } from '@wordpress/i18n';
import ForbiddenIcon from '@dokan/layout/Icons/ForbiddenIcon';
import { Button } from '@getdokan/dokan-ui';

const Forbidden = () => {
    // @ts-ignore
    const dashBoardUrl = window.dokan?.urls?.dashboardUrl ?? '#';

    return (
        <div className="bg-[url('/assets/images/error-page-bg.png')] bg-no-repeat bg-center md:w-[42rem] w-full bg-cover h-[21rem] ">
            <div className="flex flex-col items-center justify-center h-full gap-6">
                <ForbiddenIcon />
                <div className="flex flex-col gap-4 justify-center items-center">
                    <h1 className="text-xl font-bold text-center tracking-wide">
                        { __( 'Permission Denied', 'dokan-lite' ) }
                    </h1>
                    <p className="max-w-[23rem] text-center font-normal text-[#637381]">
                        { __(
                            'Sorry, you don’t have permission to access this page',
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

export default Forbidden;
