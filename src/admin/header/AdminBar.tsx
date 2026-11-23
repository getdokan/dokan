import { __, sprintf } from '@wordpress/i18n';
import { RawHTML, useState } from '@wordpress/element';
import HelpIcon from '../dashboard/icons/HelpIcon';
import CrownIcon from '../dashboard/icons/CrownIcon';
import { twMerge } from 'tailwind-merge';

// Import Lucide Icons
import {
    RefreshCw,
    Headphones,
    Facebook,
    FileText,
    HelpCircle,
    Settings,
    Lightbulb,
    Wand2,
    Box,
    Circle,
} from 'lucide-react';
import { Slot } from '@wordpress/components';

// Define the mapping internally
const lucideIconMapping = {
    'whats-new': RefreshCw,
    support: Headphones,
    facebook: Facebook,
    documentation: FileText,
    faq: HelpCircle,
    settings: Settings,
    'feature-request': Lightbulb,
    'setup-wizard': Wand2,
    'import-data': Box,
    'custom-icon': Circle,
};

const AdminBar = () => {
    const [ showDropdown, setShowDropdown ] = useState( false );
    const { is_pro_exists, lite_version, help_menu_items, has_new_version } =
        dokanAdminPanelHeaderSettings?.header_info;

    return (
        <div
            data-test-id="dokan-dashboard-header"
            className="w-full bg-white shadow-sm border-b border-gray-200 py-4 px-6 flex justify-between items-center gap-6 box-border"
        >
            { /* Logo and version tags */ }
            <div className="w-full flex flex-wrap items-center justify-between">
                <div className="flex flex-wrap items-center gap-3">
                    <img
                        className={ `h-8 mr-auto` }
                        src={ dokanAdminPanelHeaderSettings?.logo_url || '' }
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
                                        dokanAdminPanelHeaderSettings
                                            ?.header_info?.license_plan || '',
                                        dokanAdminPanelHeaderSettings
                                            ?.header_info?.pro_version || ''
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
                        className="bg-[#7047EB] !text-white py-2.5 px-5 rounded-md flex items-center gap-2 hover:bg-primary-700 hover:!text-white focus:!text-white transition-colors duration-200 font-medium no-underline text-[13px]"
                    >
                        { __( 'Upgrade', 'dokan-lite' ) }
                        <CrownIcon className={ 'w-5 h-5' } />
                    </a>
                ) }
            </div>

            { /* Get Support button slot — filled via registerPlugin */ }
            <Slot
                name="dokan-admin-header-before-info-section"
                fillProps={ {
                    header_info: dokanAdminPanelHeaderSettings?.header_info,
                } }
            />

            { /* Help button */ }
            <div
                data-test-id="dokan-dashboard-header-help-menu-container"
                className="relative"
            >
                <div
                    onMouseEnter={ () => setShowDropdown( true ) }
                    onMouseLeave={ () => setShowDropdown( false ) }
                    className={ twMerge(
                        'relative flex items-center justify-center w-8 h-8 rounded-full border border-solid border-[#E9E9E9] transition-all duration-200 ease-in-out cursor-pointer',
                        showDropdown
                            ? 'bg-[#7047EB] border-[#7047EB]'
                            : 'bg-white'
                    ) }
                >
                    { has_new_version && (
                        <span className="whats-new-pointer absolute w-1.5 h-1.5 top-0 right-0 rounded-full border-2 border-[#fff] border-solid box-content bg-[#7047EB]"></span>
                    ) }

                    <HelpIcon
                        className={ twMerge(
                            'w-2.5 h-3.5 transition-colors',
                            showDropdown ? 'fill-white' : 'fill-[#828282]'
                        ) }
                    />

                    { /* Dropdown */ }
                    <div
                        className={ twMerge(
                            "absolute top-full right-0 mt-2 z-50 bg-white rounded border border-solid border-gray-200 shadow-xl w-[240px] py-3 transition-opacity transition-transform duration-300 before:bottom-full before:left-0 before:content-[''] before:absolute before:w-full before:h-6",
                            showDropdown
                                ? 'opacity-100 visible transition-opacity duration-200'
                                : 'opacity-0 invisible'
                        ) }
                    >
                        <div className="flex flex-col">
                            { help_menu_items?.map( ( item ) => {
                                // Get the Lucide Component based on the key
                                const IconComponent =
                                    lucideIconMapping[ item?.icon ] || Circle;

                                return (
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
                                        className={
                                            'skip-color-module flex items-center text-[15px] text-[#828282] font-normal no-underline transition-all duration-150 py-2.5 px-4 group hover:bg-[#EFEAFF] hover:!text-[#7047EB]'
                                        }
                                    >
                                        <div className="w-6 h-6 flex items-center justify-center mr-2.5 transition-all">
                                            <IconComponent
                                                size={ 18 }
                                                className={
                                                    'transition-colors text-[#828282] group-hover:text-[#7047EB]'
                                                }
                                            />
                                        </div>
                                        <span className="flex-1 flex items-center gap-2.5">
                                            <RawHTML>{ item?.title }</RawHTML>
                                            { item.active && (
                                                <span className="whats-new-pointer w-1.5 h-1.5 top-0 right-0 rounded-full bg-[#7047EB]"></span>
                                            ) }
                                        </span>
                                    </a>
                                );
                            } ) }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBar;
