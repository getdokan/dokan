import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
} from '@headlessui/react';
import {
    ChevronRightIcon,
    SearchIcon,
    SettingsIcon,
    UsersIcon,
} from 'lucide-react';
import { SettingsElement } from '../../../../../stores/adminSettings/types';

function classNames( ...classes ) {
    return classes.filter( Boolean ).join( ' ' );
}

// Search component
const SearchBar = () => (
    <div className="mb-7">
        <div className="relative">
            <div className="bg-white border border-[#e9e9e9] rounded-[5px] h-9 flex items-center px-3 gap-3">
                <SearchIcon className="w-[18px] h-[18px] text-[#828282]" />
                <input
                    type="text"
                    placeholder="Search"
                    className="flex-1 text-[12px] text-[#a5a5aa] bg-transparent border-none outline-none font-normal"
                />
            </div>
        </div>
    </div>
);

// Icon component mapping
const getIcon = ( iconName: string ) => {
    const iconProps = { className: 'w-5 h-5 text-[#828282]' };

    switch ( iconName ) {
        case 'settings':
            return <SettingsIcon { ...iconProps } />;
        case 'users':
            return <UsersIcon { ...iconProps } />;
        default:
            return <SettingsIcon { ...iconProps } />;
    }
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

        // Call the original onMenuClick handler
        onMenuClick( pageId );
    };

    return (
        <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
            <nav className="bg-white  p-7">
                <SearchBar />

                <div className="space-y-[22px]">
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
                                                item.icon || 'settings'
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
                                                        className={ classNames(
                                                            isActive
                                                                ? 'bg-gray-50'
                                                                : 'hover:bg-gray-50',
                                                            'flex w-full items-center justify-between rounded-[3px] px-0 py-2 text-left text-[14px] font-medium text-[#575757] transition-colors'
                                                        ) }
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            { getIcon(
                                                                item.icon ||
                                                                    'users'
                                                            ) }
                                                            <span className="leading-5">
                                                                { item.title }
                                                            </span>
                                                        </div>
                                                        <ChevronRightIcon
                                                            className={ classNames(
                                                                'w-3.5 h-3.5 text-[#828282] transition-transform',
                                                                open
                                                                    ? 'rotate-90'
                                                                    : ''
                                                            ) }
                                                        />
                                                    </DisclosureButton>
                                                    <DisclosurePanel className="mt-5 space-y-0">
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
                                                                                : 'text-[#575757] font-medium hover:bg-gray-50',
                                                                            'block rounded-[3px] px-7 py-2 text-[14px] leading-[1.3] transition-colors'
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
        </aside>
    );
};

export default Menu;
