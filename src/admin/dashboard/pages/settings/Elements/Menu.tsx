import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
} from '@headlessui/react';
import * as LucideIcons from 'lucide-react';
import { SettingsElement } from '../../../../../stores/adminSettings/types';
import { __ } from "@wordpress/i18n";
import { useState } from '@wordpress/element';
import {twMerge} from "tailwind-merge";

function classNames( ...classes ) {
    return classes.filter( Boolean ).join( ' ' );
}

// Search component
const SearchBar = ( { className = '' } ) => (
    <div className={ twMerge( 'mb-6', className ) }>
        <div className="relative">
            <div className="bg-white border border-[#e9e9e9] rounded-[5px] lg:h-9 h-fit flex items-center px-3 gap-3">
                <LucideIcons.Search className="lg:!w-[18px] lg:!h-[18px] w-5 h-5 text-[#828282]" />
                <input
                    type="text"
                    placeholder={ __( 'Search', 'dokan-lite' ) }
                    className="flex-1 lg:!text-[12px] text-base text-[#a5a5aa] bg-transparent border-none outline-none font-normal p-0 focus:ring-0"
                />
            </div>
        </div>
    </div>
);

// Dynamic Icon component
const getIcon = ( iconName: string ) => {
    const iconProps = { className: 'w-5 h-5 text-[#828282]' };

    // Get the icon component by name.
    const IconComponent = ( LucideIcons as any )[ iconName ];

    // If the icon is not found, use a fallback icon.
    if ( ! IconComponent ) {
        console.warn( `Icon "${ iconName }" not found in Lucide React. Using fallback.` );
        return <LucideIcons.Settings { ...iconProps } />;
    }

    return <IconComponent { ...iconProps } />;
};

const Menu = ( {
    pages,
    loading,
    activePage,
    onMenuClick,
}: {
    pages: SettingsElement[];
    parentPages?: SettingsElement[];
    loading: boolean;
    activePage: string;
    onMenuClick: ( page: string ) => void;
} ): JSX.Element => {
    // Add mobile menu state
    const [ isMobileMenuOpen, setIsMobileMenuOpen ] = useState( false );

    const handleMenuClick = ( pageId: string, parentId?: string ) => {
        let storageValue = pageId;
        if ( parentId ) { // Construct section.page format for localStorage.
            storageValue = `${parentId}.${pageId}`;
        }

        // Store in localStorage with a more descriptive key name
        if ( typeof localStorage !== 'undefined' ) {
            localStorage.setItem(
                'dokan_active_settings_tab',
                // @ts-ignore
                wp.hooks.applyFilters(
                    'dokan_admin_settings_active_tab_data',
                    storageValue
                )
            );
        }

        // Close mobile menu when item is selected
        setIsMobileMenuOpen( false );

        // Call the original onMenuClick handler
        onMenuClick( pageId );
    };

    // Your original menu content
    const MenuContent = ({ isSearch = false }) => (
        <nav className="bg-white p-7 lg:py-12">
            { isSearch && <SearchBar /> }

            <div className="space-y-6">
                { ! loading &&
                    pages.map( ( item ) => {
                        if ( ! item.display ) {
                            return <></>;
                        }

                        const isActive =
                            item.id === activePage ||
                            item.children?.some(
                                ( child ) => child.id === activePage
                            );

                        return (
                            <div key={ item.id }>
                                { ! item.children ? (
                                    <a
                                        href={ item.id }
                                        onClick={ ( e ) => {
                                            e.preventDefault();
                                            handleMenuClick( item.id );
                                        } }
                                        className={ classNames(
                                            isActive
                                                ? 'bg-[#efeaff]'
                                                : 'hover:bg-gray-50',
                                            'flex items-center gap-2 rounded-[3px] px-0 py-2 text-[14px] font-medium transition-colors',
                                            isActive
                                                ? 'text-[#7047eb]'
                                                : 'text-[#575757]'
                                        ) }
                                    >
                                        { getIcon(
                                            item.icon || 'Settings'
                                        ) }
                                        <span className="leading-5">
                                            { item.title }
                                        </span>
                                    </a>
                                ) : (
                                    <Disclosure
                                        as="div"
                                        defaultOpen={ isActive }
                                    >
                                        { ( { open } ) => (
                                            <>
                                                <DisclosureButton
                                                    className={ 'group flex w-full items-center justify-between rounded-[3px] p-0 text-left text-[14px] font-medium transition-colors' }
                                                >
                                                    <div className="flex items-center gap-2">
                                                        { getIcon(
                                                            item.icon ||
                                                            'Settings'
                                                        ) }
                                                        <span className="leading-5">
                                                            { item.title }
                                                        </span>
                                                    </div>
                                                    <LucideIcons.ChevronDown
                                                        className={ classNames(
                                                            'w-3.5 h-3.5 transition-transform',
                                                            open
                                                                ? 'rotate-180 text-[#7047EB]'
                                                                : 'text-[#828282] group-hover:text-[#7047EB]'
                                                        ) }
                                                    />
                                                </DisclosureButton>
                                                <DisclosurePanel className="mt-5 space-y-1.5">
                                                    { item?.children?.map(
                                                        ( subItem ) => {
                                                            const isSubActive =
                                                                subItem.id ===
                                                                activePage;

                                                            return (
                                                                <a
                                                                    key={
                                                                        subItem.id
                                                                    }
                                                                    href={
                                                                        subItem.id
                                                                    }
                                                                    onClick={ (
                                                                        e
                                                                    ) => {
                                                                        e.preventDefault();
                                                                        handleMenuClick(
                                                                            subItem.id,
                                                                            item.id
                                                                        );
                                                                    } }
                                                                    className={ classNames(
                                                                        isSubActive
                                                                            ? 'bg-[#efeaff] text-[#7047eb] font-semibold'
                                                                            : 'text-[#575757] font-medium hover:bg-[#efeaff] hover:text-[#7047eb]',
                                                                        'block rounded-[3px] px-7 py-2 text-[14px] leading-[1.3] transition-colors focus:!outline-transparent focus:shadow-none skip-color-module'
                                                                    ) }
                                                                >
                                                                    {
                                                                        subItem.title
                                                                    }
                                                                </a>
                                                            );
                                                        }
                                                    ) }
                                                </DisclosurePanel>
                                            </>
                                        ) }
                                    </Disclosure>
                                ) }
                            </div>
                        );
                    } ) }
            </div>
        </nav>
    );

    return (
        <>
            { /* Mobile hamburger menu button - only shows on mobile */ }
            <div className="lg:hidden">
                <div className={ `flex gap-3` }>
                    <span
                        className="p-2 rounded-md bg-white border border-gray-200 cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
                        onClick={ () => setIsMobileMenuOpen( true ) }
                    >
                        <LucideIcons.Menu
                            size={ 24 }
                            className="text-[#828282]"
                        />
                    </span>

                    <SearchBar className={ `lg:hidden m-0 w-full` } />
                </div>
            </div>

            { /* Your original desktop sidebar - unchanged */ }
            <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3 hidden lg:!block">
                <MenuContent isSearch={ true } />
            </aside>

            { /* Mobile drawer overlay and sidebar with smooth transitions */ }
            <div className={`lg:hidden fixed inset-0 z-[99999] transition-opacity duration-300 ${
                isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}>
                { /* Backdrop overlay */ }
                <div
                    className="absolute inset-0 bg-[#808080] bg-opacity-50"
                    onClick={ () => setIsMobileMenuOpen( false ) }
                />

                {/* Mobile drawer with sliding animation */}
                <div className={`fixed inset-y-0 left-0 w-80 max-w-sm transform transition-transform duration-300 ease-in-out flex flex-col h-full bg-white shadow-xl ${
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                    <MenuContent />
                </div>
            </div>
        </>
    );
};

export default Menu;