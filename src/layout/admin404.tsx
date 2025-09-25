import { __ } from '@wordpress/i18n';
import { DokanButton } from '../components/Button';
import { Slot } from '@wordpress/components';
import { twMerge } from 'tailwind-merge';
import { FileQuestion } from 'lucide-react';

const AdminNotFound = ( {
    children,
    navigateButton,
    title = __( "Sorry, the page can't be found", 'dokan-lite' ),
    message = __(
        'The page you were looking for appears to have been moved, deleted or does not exist.',
        'dokan-lite'
    ),
    className = '',
    backToDashboardUrl = null,
}: {
    children?: JSX.Element;
    navigateButton?: JSX.Element;
    title?: string;
    message?: string;
    className?: string;
    backToDashboardUrl?: string;
} ) => {
    // @ts-ignore
    const dashBoardUrl = window.dokan?.urls?.dashboardUrl ?? '#';

    return (
        <>
            { children ? (
                children
            ) : (
                <div
                    className={ twMerge(
                        // container full width, min height, padding for small screens
                        'w-full  bg-white flex flex-col items-center justify-center text-center  rounded-sm border border-[#E9E9E9] max-h-[647px] overflow-auto',
                        className
                    ) }
                >
                    <Slot name="before-dokan-not-found" />

                    <div className="flex flex-col items-center justify-center text-center gap-[22px] ">
                        { /* Icon */ }
                        <div className="flex items-center justify-center rounded-full bg-[#EFEAFF] w-[127px] h-[127px]  flex-shrink-0">
                            <FileQuestion className="text-[#7047EB] w-[52px] h-[52px]" />
                        </div>

                        { /* 404 + text */ }
                        <div className="max-w-[270px] ">
                            <div className="text-[64px] font-bold text-[#25252D] leading-[130%]">
                                404
                            </div>
                            <div className="flex flex-col gap-2 justify-center text ">
                                <h3 className="text-lg  font-bold text-[#25252D] leading-[130%]">
                                    { title }
                                </h3>
                                <p className="text-[12px] text-[#828282] leading-[140%]">
                                    { message }
                                </p>
                            </div>
                        </div>
                        { /* Button */ }
                        { navigateButton ?? (
                            <DokanButton
                                link={ true }
                                href={ backToDashboardUrl ?? dashBoardUrl }
                                variant={ 'primary' }
                                className="inline-flex justify-end items-center gap-[10px] py-[10px] px-[24px] sm:py-[8px] sm:px-[16px] rounded-[5px] bg-[#7047EB] text-white"
                            >
                                { __( 'Back to Dashboard', 'dokan-lite' ) }
                            </DokanButton>
                        ) }
                    </div>

                    <Slot name="after-dokan-not-found" />
                </div>
            ) }
        </>
    );
};

export default AdminNotFound;
