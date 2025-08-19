import { __ } from '@wordpress/i18n';

const CommissionHeader = () => {
    return (
        <div className=" h-16 flex items-center px-5">
            <div className="flex items-center">
                <span className=" text-xs uppercase text-[#575757]">
                    { __( 'Category', 'dokan-lite' ) }
                </span>
            </div>
            <div className="flex items-center ml-auto gap-3">
                <div className="flex items-center">
                    <div className="w-[142px]">
                        <span className=" uppercase text-xs text-[#828282]">
                            { __( 'Percentage', 'dokan-lite' ) }
                        </span>
                    </div>
                    <div className="w-[120px]">
                        <span className=" text-xs uppercase text-[#828282]">
                            { __( 'Flat', 'dokan-lite' ) }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommissionHeader;
