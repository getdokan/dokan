import { __ } from '@wordpress/i18n';

const CommissionHeader: React.FC = () => {
    return (
        <div className=" h-16 flex items-center px-5">
            <div className="flex items-center">
                <span className="font-semibold text-[14px] text-[#575757]">
                    { __( 'Category', 'dokan-lite' ) }
                </span>
            </div>
            <div className="flex items-center ml-auto gap-3">
                <div className="flex items-center">
                    <div className="w-[142px]">
                        <span className="font-semibold text-[14px] text-[#575757]">
                            { __( 'Percentage (%)', 'dokan-lite' ) }
                        </span>
                    </div>
                    <div className="mx-2 w-4"></div>
                    <div className="w-[120px]">
                        <span className="font-semibold text-[14px] text-[#575757]">
                            { __( 'Fixed Amount', 'dokan-lite' ) }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommissionHeader;
