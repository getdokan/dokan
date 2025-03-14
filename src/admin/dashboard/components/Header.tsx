import { useState } from "@wordpress/element";
import HelpIcon from "../pages/setup-guide/icons/HelpIcon";
import DokanIcon from "../pages/setup-guide/icons/DokanIcon";
import CrownIcon from "../pages/setup-guide/icons/CrownIcon";

const Header = () => {
    const [ showDropdown, setShowDropdown ] = useState( false );

    return (
        <div className="w-full bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-lg shadow my-6">
            {/* Logo and version tags */}
            <div className="flex items-center gap-4">
                <DokanIcon />

                <div className="flex items-center gap-2 font-medium">
                    <div className="bg-[#FF9B5366] text-[#7B4E2E] text-xs px-3 py-1 rounded-[20px] h-8 flex items-center">
                        Lite: 3.14.10
                    </div>

                    <div className="bg-[#D8D8FE] text-[#7047EB] text-xs pr-2 pl-1 py-1 rounded-[20px] flex items-center gap-1 h-8">
                        <span className="flex items-center bg-[#7047EB] text-white rounded-[20px] gap-1 px-2 py-1">
                            Pro
                            <CrownIcon />
                        </span>
                        <span className="ml-1">Enterprise: 3.16.1</span>
                    </div>
                </div>
            </div>

            {/* Help button */}
            <div className="relative pr-1.5">
                <button
                    onClick={ () => setShowDropdown( ! showDropdown ) }
                    className="relative bg-[#e4e6eb] hover:bg-gray-200 p-2 w-8 h-8 rounded-full transition-colors"
                >
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                    <HelpIcon />
                </button>
            </div>
        </div>
    );
};

export default Header;
