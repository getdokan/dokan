import { Check, Users, Box, Trash } from 'lucide-react';
import { __ } from '@wordpress/i18n';
import { DokanButton } from '@dokan/components';

function Result( props ) {
    return (
        <div className="p-[24px]">
            <div className="flex flex-row items-center mb-[20px]">
                <div className="bg-[#7047EB] h-[20px] w-[20px] rounded-full flex items-center justify-center mr-[12px]">
                    <svg
                        width="10"
                        height="9"
                        viewBox="0 0 10 9"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M3.9563 8.88889C3.7836 8.88839 3.61721 8.81992 3.48943 8.69659L0.193411 5.46443C-0.0727037 5.16928 -0.0630046 4.70111 0.215069 4.41866C0.468094 4.16159 0.861522 4.1439 1.13413 4.37718L3.86571 7.06202L8.74354 0.29445C8.97641 -0.0323841 9.41466 -0.0969513 9.72259 0.150223C10.0305 0.397398 10.0913 0.862562 9.85847 1.1894L4.54861 8.58564C4.43213 8.75716 4.25199 8.8675 4.05386 8.88889H3.9563Z"
                            fill="white"
                        />
                    </svg>
                </div>
                <h2 className="ont-bold font-[700] text-[18px] text-[#25252D]">
                    { __( 'Dummy Data Import complete!', 'dokan-lite' ) }
                </h2>
            </div>

            <div className="mb-[14px] border border-[#E9E9E9] rounded-[6px] flex items-center gap-[12px] p-[12px]">
                <div className="h-[44px] w-[44px] border border-[#E9E9E9] bg-[#F8F9F8] flex justify-center items-center rounded-[5px]">
                    <Users size="24" color="#828282" />
                </div>
                <p className="text-[14px] font-[600] text-[#25252D]">
                    { __( 'View Dummy 6 Vendors', 'dokan-lite' ) }
                </p>
            </div>

            <div className="mb-[20px] border border-[#E9E9E9] rounded-[6px] flex items-center gap-[12px] p-[12px]">
                <div className="h-[44px] w-[44px] border border-[#E9E9E9] bg-[#F8F9F8] flex justify-center items-center rounded-[5px]">
                    <Box size="24" color="#828282" />
                </div>
                <p className="text-[14px] font-[600] text-[#25252D]">
                    { __( 'View Dummy 5 Products', 'dokan-lite' ) }
                </p>
            </div>

            <DokanButton
                // disabled={ disabled || !! loading }
                // loading={ loading }
                // onClick={ () => onClick( type ) }
                variant="danger"
                label={
                    <div className="flex items-center gap-[6px]">
                        <Trash size="15" />
                        <span>{ __( 'Clear Data', 'dokan-lite' ) }</span>
                    </div>
                }
                className="!h-[28px] !font-[500] !text-[12px] !leading-[16px] !bg-white !text-[#E64B5F]"
            />
        </div>
    );
}

export default Result;
