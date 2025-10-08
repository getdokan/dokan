import { __, sprintf } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import HelpIcon from '../dashboard/icons/HelpIcon';
import CrownIcon from '../dashboard/icons/CrownIcon';
import IconMapping from '../dashboard/components/IconMapping';
import { twMerge } from 'tailwind-merge';

const Header = () => {
    const [ showDropdown, setShowDropdown ] = useState( false );
    const { is_pro_exists, lite_version, help_menu_items, has_new_version } =
        dokanAdminPanelHeaderSettings?.header_info;

    return (
        <div
            data-test-id="dokan-dahboard-header"
            className="w-full bg-white shadow-sm border-b border-gray-200 sm:px-6 sm:py-4 py-2.5 px-3 flex justify-between items-center gap-6 box-border"
        >
            { /* Logo and version tags */ }
            <div className="w-full flex flex-wrap items-center justify-between">
                <div className="flex flex-wrap items-center gap-3">
                    <img
                        className={ `h-8 mr-auto` }
                        src={ dokanAdminPanelHeaderSettings?.logo_url }
                        alt={ __( 'Dokan Logo', 'dokan-lite' ) }
                    />

                    <div className="flex items-center flex-wrap gap-3 font-medium">
                        <div className="bg-[#FF9B5366] text-[#7B4E2E] text-xs px-3 rounded-[20px] h-[30px] flex items-center">
                            { sprintf(
                                /* translators: %1$s: lite version info */
                                __( 'Lite: %s', 'dokan-lite' ),
                                lite_version
                            ) }
                        </div>

                        { is_pro_exists && (
                            <div className="bg-[#D8D8FE] text-[#7047EB] text-xs pr-2 pl-1 rounded-[20px] flex items-center gap-1 h-[30px]">
                                <span className="flex items-center bg-[#7047EB] text-white rounded-[20px] gap-1 px-2 py-[3px]">
                                    { __( 'Pro', 'dokan-lite' ) } <CrownIcon />
                                </span>
                                <span className="ml-1 capitalize">
                                    { sprintf(
                                        /* translators: %1$s: license plan %2$s: pro version info */
                                        __( '%1$s: %2$s', 'dokan-lite' ),
                                        dokanAdminPanelHeaderSettings.header_info
                                            .license_plan,
                                        dokanAdminPanelHeaderSettings.header_info
                                            .pro_version
                                    ) }
                                </span>
                            </div>
                        ) }
                    </div>
                </div>

                { ! is_pro_exists && (
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://dokan.co/wordpress/upgrade-to-pro/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite"
                        className="bg-[#7047EB] text-white py-2.5 px-5 rounded-md flex items-center gap-2 hover:bg-[#A244FF] hover:text-white focus:text-white transition-colors duration-200 font-medium no-underline text-[13px]"
                    >
                        { __( 'Upgrade', 'dokan-lite' ) }
                        <CrownIcon className={ 'w-5 h-5' } />
                    </a>
                ) }
            </div>

            { /* Help button */ }
            <div
                data-test-id="dokan-dashboard-header-help-menu-container"
                className="relative"
            >
                <div
                    onMouseEnter={ () => setShowDropdown( true ) }
                    onMouseLeave={ () => setShowDropdown( false ) }
                    className="relative flex items-center justify-center w-[30px] h-[30px] bg-[#e4e6eb] hover:bg-[#0C5F9A] rounded-full cursor-pointer transition-all duration-200 ease-in-out"
                >
                    { has_new_version && (
                        <span className="whats-new-pointer absolute w-1.5 h-1.5 top-0 right-0 rounded-full border-2 border-[#fff] border-solid box-content bg-[#7047EB]"></span>
                    ) }
                    <HelpIcon
                        className={ twMerge( showDropdown && 'fill-white' ) }
                    />

                    { /* Dropdown */ }
                    <div
                        className={ `min-w-64 absolute top-full -right-2.5 mt-5 z-50 bg-white rounded border border-gray-200 shadow-lg w-64 py-4 px-5 transition-opacity transition-transform duration-300 before:bottom-full before:left-0 before:content-[''] before:absolute before:w-full before:h-12 ${
                            showDropdown
                                ? 'opacity-100 visible'
                                : 'opacity-0 invisible'
                        }` }
                    >
                        { /* Arrow indicator */ }
                        <div className="absolute -top-2 right-4 w-4 h-4 bg-white transform rotate-45 border-t border-l border-solid border-b-0 border-r-0 border-gray-200"></div>

                        <h3 className="text-lg font-bold m-0">
                            { __( 'Get Help', 'dokan-lite' ) }
                        </h3>

                        <div className="mt-[13px]">
                            { help_menu_items?.map( ( item ) => (
                                <a
                                    key={ item?.id }
                                    href={ item?.url }
                                    target={
                                        item?.external ? '_blank' : '_self'
                                    }
                                    rel={
                                        item?.external
                                            ? 'noopener noreferrer'
                                            : ''
                                    }
                                    className={ twMerge(
                                        'flex items-center text-black text-[15px] font-semibold no-underline transition-all duration-200 ease-in-out mb-3 last:mb-0 group hover:!text-[#7047EB]',
                                        item.active && 'text-[#7047EB]'
                                    ) }
                                >
                                    <div className="w-[38px] h-[38px] flex items-center justify-center rounded-full mr-2.5 transition-all duration-200 ease-in-out bg-[#E4E6EB] group-hover:bg-[#EFEAFF]">
                                        <IconMapping
                                            iconKey={ item?.icon }
                                            className={ twMerge(
                                                'w-5 h-5 transition-all duration-200 ease-in-out group-hover:fill-[#7047EB]',
                                                item.active && '!fill-[#7047EB]'
                                            ) }
                                        />
                                    </div>
                                    <span
                                        dangerouslySetInnerHTML={ {
                                            __html: item?.title,
                                        } }
                                    ></span>
                                    { item?.active && (
                                        <span className="w-1.5 h-1.5 bg-[#7047EB] rounded-full ml-2.5"></span>
                                    ) }
                                </a>
                            ) ) }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
