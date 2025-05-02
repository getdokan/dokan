import InternalErrorIcon from '@dokan/layout/Icons/InternalErrorIcon';
import { __ } from '@wordpress/i18n';
import { DokanButton } from '../components/Button';
import { Slot } from '@wordpress/components';

const InternalError = ( {
    children,
    onRefresh,
    title = __( 'Oh no! Something went wrong…', 'dokan-lite' ),
    message = __(
        'Kindly refresh the page to load data or try again.',
        'dokan-lite'
    ),
}: {
    children?: JSX.Element;
    onRefresh?: () => void;
    title?: string;
    message?: string;
} ) => {
    return (
        <>
            { children ? (
                children
            ) : (
                <>
                    <div className="bg-no-repeat bg-center w-full bg-cover h-[21rem] ">
                        { /*slot for internal error*/ }
                        <Slot name="before-dokan-internal-error" />
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <InternalErrorIcon color={ `text-dokan-link` } />
                            <div className="flex flex-col gap-4 justify-center items-center">
                                <h1 className="text-xl font-bold text-center tracking-wide leading-6">
                                    { title }
                                </h1>
                                <p className="max-w-[23rem] text-center font-normal leading-5 text-[#637381]">
                                    { message }
                                </p>

                                <DokanButton
                                    onClick={ onRefresh }
                                    variant={ 'primary' }
                                    className="w-[10.5rem] mt-2 py-2 px-[18px]"
                                >
                                    { __( 'Try Again', 'dokan-lite' ) }
                                </DokanButton>
                            </div>
                        </div>
                        { /*slot for internal error*/ }
                        <Slot name="after-dokan-internal-error" />
                    </div>
                </>
            ) }
        </>
    );
};

export default InternalError;
