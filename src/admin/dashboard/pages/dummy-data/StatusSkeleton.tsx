import { __ } from '@wordpress/i18n';

const StatusSkeleton = () => {
    return (
        <div className="p-[24px] animate-pulse">
            <div className="flex flex-row items-center mb-[20px]">
                <div className="bg-[#E7E0FF] h-[20px] w-[20px] rounded-full mr-[12px]" />
                <div className="h-[18px] w-[240px] bg-[#F1F1F1] rounded" />
            </div>

            <div className="mb-[14px] border border-[#E9E9E9] rounded-[6px] flex items-center gap-[12px] p-[12px]">
                <div className="h-[44px] w-[44px] border border-[#E9E9E9] bg-[#F8F9F8] rounded-[5px]" />
                <div className="h-[14px] w-[180px] bg-[#F1F1F1] rounded" />
            </div>

            <div className="mb-[14px] border border-[#E9E9E9] rounded-[6px] flex items-center gap-[12px] p-[12px]">
                <div className="h-[44px] w-[44px] border border-[#E9E9E9] bg-[#F8F9F8] rounded-[5px]" />
                <div className="h-[14px] w-[200px] bg-[#F1F1F1] rounded" />
            </div>

            <div className="h-[28px] w-[100px] border border-[#E9E9E9] bg-[#FFF5F6] rounded flex items-center justify-center">
                <span className="sr-only">
                    { __( 'Loading…', 'dokan-lite' ) }
                </span>
            </div>
        </div>
    );
};

export default StatusSkeleton;
