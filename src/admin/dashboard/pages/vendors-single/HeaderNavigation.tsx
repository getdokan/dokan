import { DokanButton } from '@dokan/components';
import { __ } from '@wordpress/i18n';
import { Vendor } from '@dokan/definitions/dokan-vendors';
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Globe, Pen } from "lucide-react";

export interface HeaderNavigationProps {
    vendor: Vendor;
}
const HeaderNavigation = ( { vendor }: HeaderNavigationProps ) => {
    let navigate = useNavigate();
    const handleBackToList = () => {
        window.open(
            // @ts-ignore
            `${ window.dokanAdminDashboard.urls.adminRoot }admin.php?page=dokan-dashboard#/vendors`,
            '_self'
        );
    };

    const visitStore = () => {
        if ( vendor ) {
            // Implement store URL logic here
            window.open( vendor.shop_url, '_blank' );
        }
    };

    return (
        <div className="flex flex-col gap-[25px] w-full">
            <div className="!ml-0 flex items-center">
                <button
                    className="p-0 m-0"
                    onClick={ handleBackToList }
                >
                    <div className="inline-flex items-center gap-1 !text-[#828282] text-[14px] font-[500] hover:underline">
                        <ChevronLeft size={ 19 } />
                        { __( 'Vendors List', 'dokan-lite' ) }
                    </div>
                </button>
            </div>
            <div className="flex flex-col md:!flex-row gap-4 md:!gap-0 justify-between w-full">
                <h2 className="text-2xl leading-3 text-gray-900 font-bold !p-0 !m-0">
                    { __( 'Vendor Profile', 'dokan-lite' ) }
                </h2>
                <div className="flex gap-2">
                    <DokanButton
                        className="flex items-center gap-1 !h-[40px] !border-[#E9E9E9] !rounded-[5px] !bg-white !shadow-none"
                        variant="tertiary"
                        onClick={ visitStore }
                        disabled={ ! vendor }
                    >
                        <Globe size={ 16 } className="text-[#828282]" />
                        <span className="text-[#393939]">
                            { __( 'Visit Store', 'dokan-lite' ) }
                        </span>
                    </DokanButton>
                    <DokanButton
                        className="flex items-center gap-1 !h-[40px] !border-[#E9E9E9] !rounded-[5px] !bg-white !shadow-none"
                        variant="tertiary"
                        onClick={ () =>
                            navigate( `/vendors/edit/${ vendor.id }` )
                        }
                    >
                        <Pen size={ 16 } className="text-[#828282]" />
                    </DokanButton>
                </div>
            </div>
        </div>
    );
};

export default HeaderNavigation;
