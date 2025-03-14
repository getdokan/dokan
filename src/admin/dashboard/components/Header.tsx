import { __, sprintf } from '@wordpress/i18n';
import { useState } from "@wordpress/element";
import HelpIcon from "../icons/HelpIcon";
import DokanIcon from "../icons/DokanIcon";
import CrownIcon from "../icons/CrownIcon";
import IconMapping from "./IconMapping";

const Header = () => {
    const [ showDropdown, setShowDropdown ] = useState( false );
    const { is_pro_exists, lite_version, help_menu_items } = dokanAdminDashboardSettings?.header_info;

    return (
        <div className="w-full bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-lg shadow my-6">
            {/* Logo and version tags */}
            <div className="flex items-center gap-4">
                <DokanIcon />

                <div className="flex items-center gap-3 font-medium">
                    <div className="bg-[#FF9B5366] text-[#7B4E2E] text-xs px-3 py-1 rounded-[20px] h-8 flex items-center">
                        { sprintf(
                            __( 'Lite: %s', 'dokan-lite' ),
                            lite_version
                        ) }
                    </div>

                    { is_pro_exists && (
                        <div className="bg-[#D8D8FE] text-[#7047EB] text-xs pr-2 pl-1 py-1 rounded-[20px] flex items-center gap-1 h-8">
                            <span className="flex items-center bg-[#7047EB] text-white rounded-[20px] gap-1 px-2 py-1">
                                { __( 'Pro', 'dokan-lite' ) } <CrownIcon />
                            </span>
                            <span className="ml-1 capitalize">
                                { sprintf(
                                    __( '%1$s: %2$s', 'dokan-lite' ),
                                    dokanAdminDashboardSettings.header_info.license_plan,
                                    dokanAdminDashboardSettings.header_info.pro_version
                                ) }
                            </span>
                        </div>
                    ) }
                </div>
            </div>

            {/* Help button */}
            <div className="relative pr-1.5">
                <button
                    onPointerEnter={ () => setShowDropdown( true ) }
                    onPointerLeave={ () => setShowDropdown( false ) }
                    className={ `relative bg-[#e4e6eb] p-2 w-8 h-8 rounded-full transition-colors duration-300 ${ showDropdown ? 'hover:bg-[#0C5F9A]' : '' }` }
                >
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                    <HelpIcon className={ `${ showDropdown ? 'hover:fill-white' : '' }` }/>
                </button>

                {/*<div className="hidden group-hover:block absolute top-full right-0 mt-3 z-50 bg-white rounded-md border border-gray-200 shadow-lg w-64 py-4 px-5 transition-all">*/}
                { showDropdown && (
                    <div className="absolute top-full right-0 mt-3 z-50 bg-white rounded-md border border-gray-200 shadow-lg w-64 py-4 px-5 transition-all">
                        {/* Arrow indicator */}
                        <div className="absolute -top-2 right-3 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200"></div>

                        <h3 className="text-lg font-bold mb-3">{ __( 'Get Help', 'dokan-lite' ) }</h3>

                        <div className="space-y-2.5">
                            { help_menu_items?.map( item => (
                                <a
                                    key={ item?.id }
                                    href={ item?.url }
                                    target={ item?.external ? "_blank" : "_self" }
                                    rel={ item?.external ? "noopener noreferrer" : "" }
                                    className="flex items-center text-gray-700 hover:text-[#7047EB] font-medium gap-2.5 group transition"
                                >
                                    <div className={ `w-9 h-9 flex items-center justify-center rounded-full hover:text-[#7047EB] transition ${ item?.active ? 'bg-[#EFEAFF]' : 'bg-[#E4E6EB]' } hover:bg-[#EFEAFF]` }>
                                        <IconMapping iconKey={ item?.icon } className={ `w-5 h-5 ${ item?.active ? 'fill-[#7047EB]' : 'group-hover:fill-[#7047EB]' }` } />
                                    </div>
                                    <span className={ `text-sm ${ item?.active ? 'text-[#7047EB]' : '' }` } dangerouslySetInnerHTML={{ __html: item?.title }}></span>
                                    { item?.active && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#7047EB]"></span>
                                    ) }
                                </a>
                            ) ) }
                        </div>
                    </div>
                ) }
            </div>
        </div>
    );
};

export default Header;
