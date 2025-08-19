import {useState, useCallback, useEffect, useRef, useMemo, memo} from '@wordpress/element';
import {dispatch, useDispatch, useSelect} from '@wordpress/data';
import { twMerge } from "tailwind-merge";
import * as LucideIcons from 'lucide-react';
import { __ } from "@wordpress/i18n";
import settingsStore from '../../../../../stores/adminSettings';
import { SettingsElement } from '../../../../../stores/adminSettings/types';
import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
} from '@headlessui/react';
import SearchBar from "../components/SearchBar";

function classNames( ...classes ) {
    return classes.filter( Boolean ).join( ' ' );
}


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

const Menu = ({
    pages,
    loading,
    activePage,
    onMenuClick,
}: {
    pages: SettingsElement[];
    loading: boolean;
    activePage: string;
    onMenuClick: (page: string) => void;
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Monitor search text from store
    const searchText = useSelect(
        (select) => select(settingsStore).getSearchText(),
        []
    );
    
    // Track search session and manual navigation
    const [hasAutoSelectedForCurrentSearch, setHasAutoSelectedForCurrentSearch] = useState(false);
    const [previousSearchText, setPreviousSearchText] = useState('');
    const [userHasManuallyNavigated, setUserHasManuallyNavigated] = useState(false);
    
    // Reset search session tracking when search is cleared or new search starts
    useEffect(() => {
        const isNewSearch = !previousSearchText.trim() && searchText.trim();
        const isSearchCleared = previousSearchText.trim() && !searchText.trim();
        const isCompletelyNewSearch = searchText.trim() && !searchText.startsWith(previousSearchText);
        
        if (isNewSearch || isSearchCleared || isCompletelyNewSearch) {
            setHasAutoSelectedForCurrentSearch(false);
            setUserHasManuallyNavigated(false);
        }
        
        setPreviousSearchText(searchText);
    }, [searchText, previousSearchText]);
    
    // Find first visible menu and submenu when search is active
    const getFirstVisibleMenuAndSubmenu = useCallback(() => {
        if (!searchText.trim() || loading) {
            return { firstMenu: null, firstSubmenu: null };
        }
        
        const firstVisibleMenu = pages.find(menu => 
            menu.display && 
            menu.children && 
            menu.children.some(child => child.display)
        );
        
        if (!firstVisibleMenu) {
            return { firstMenu: null, firstSubmenu: null };
        }
        
        const firstVisibleSubmenu = firstVisibleMenu.children?.find(child => child.display);
        
        return {
            firstMenu: firstVisibleMenu,
            firstSubmenu: firstVisibleSubmenu || null
        };
    }, [pages, searchText, loading]);
    
    // Auto-select first submenu only on initial search, not on every search text change
    useEffect(() => {
        if (searchText.trim() && !loading && !hasAutoSelectedForCurrentSearch && !userHasManuallyNavigated) {
            const { firstSubmenu } = getFirstVisibleMenuAndSubmenu();
            if (firstSubmenu && firstSubmenu.id !== activePage) {
                // Only trigger if it's different from current active page
                setTimeout(() => {
                    onMenuClick(firstSubmenu.id);
                    setHasAutoSelectedForCurrentSearch(true);
                }, 100); // Small delay to ensure search results are rendered
            }
        }
    }, [searchText, loading, getFirstVisibleMenuAndSubmenu, activePage, onMenuClick, hasAutoSelectedForCurrentSearch, userHasManuallyNavigated]);

    // Memoize the menu click handler to prevent recreation
    const handleMenuClick = useCallback((pageId: string, parentId?: string) => {
        // Track that user has manually navigated during search
        if (searchText.trim()) {
            setUserHasManuallyNavigated(true);
        }
        
        let storageValue = pageId;
        if (parentId) {
            storageValue = `${parentId}.${pageId}`;
        }

        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(
                'dokan_active_settings_tab',
                // @ts-ignore
                wp.hooks.applyFilters(
                    'dokan_admin_settings_active_tab_data',
                    storageValue
                )
            );
        }

        setIsMobileMenuOpen(false);
        onMenuClick(pageId);
    }, [onMenuClick, searchText]);

    // Memoize MenuContent to prevent recreation
    const MenuContent = (
        { children } : { children?: JSX.Element }
    ) => (
        <div className="space-y-6">
            { ! loading &&
                pages.map( ( item ) => {
                    if ( ! item.display ) {
                        return null;
                    }

                    const isActive =
                        item.id === activePage ||
                        item.children?.some(
                            ( child ) => child.id === activePage
                        );

                    // Check if this should be expanded due to search - allow all menus with visible children
                    const shouldExpandForSearch = searchText.trim() &&
                        item.display &&
                        item.children &&
                        item.children.some( child => child.display );

                    return (
                        <div key={ item.id }>
                            { ! item.children ? (
                                <a
                                    href={ item.id }
                                    onClick={ ( e ) => {
                                        e.preventDefault();
                                        handleMenuClick( item.id );
                                    }}
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
                                    defaultOpen={ isActive || shouldExpandForSearch }
                                >
                                    { ( { open }) => (
                                        <>
                                            <DisclosureButton
                                                className={'group flex w-full items-center justify-between rounded-[3px] p-0 text-left text-[14px] font-medium transition-colors'}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {getIcon(
                                                        item.icon ||
                                                        'Settings'
                                                    )}
                                                    <span className="leading-5">
                                                        {item.title}
                                                    </span>
                                                </div>
                                                <LucideIcons.ChevronDown
                                                    className={classNames(
                                                        'w-3.5 h-3.5 transition-transform',
                                                        open
                                                            ? 'rotate-180 text-[#7047EB]'
                                                            : 'text-[#828282] group-hover:text-[#7047EB]'
                                                    )}
                                                />
                                            </DisclosureButton>
                                            <DisclosurePanel className="mt-5 space-y-1.5">
                                                {item?.children?.map(
                                                    (subItem) => {
                                                        if (!subItem.display) {
                                                            return null;
                                                        }

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
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.preventDefault();
                                                                    handleMenuClick(
                                                                        subItem.id,
                                                                        item.id
                                                                    );
                                                                }}
                                                                className={classNames(
                                                                    isSubActive
                                                                        ? 'bg-[#efeaff] text-[#7047eb] font-semibold'
                                                                        : 'text-[#575757] font-medium hover:bg-[#efeaff] hover:text-[#7047eb]',
                                                                    'block rounded-[3px] px-7 py-2 text-[14px] leading-[1.3] transition-colors focus:!outline-transparent focus:shadow-none skip-color-module'
                                                                )}
                                                            >
                                                                {
                                                                    subItem.title
                                                                }
                                                            </a>
                                                        );
                                                    }
                                                )}
                                            </DisclosurePanel>
                                        </>
                                    )}
                                </Disclosure>
                            )}
                        </div>
                    );
                })}
        </div>
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
                <nav className="bg-white p-7 lg:py-12">
                    <SearchBar />
                    <MenuContent />
                </nav>
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
                    <nav className="bg-white p-7 lg:py-12">
                        <MenuContent />
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Menu;