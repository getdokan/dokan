import { useEffect, useState } from '@wordpress/element';
import * as LucideIcons from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { __ } from '@wordpress/i18n';
import { Popover } from '@src/components';
import WPLogo from '../../icons/WPLogo';
import { decodeEntities } from '@wordpress/html-entities';

const Header = ( { onToggleSidebar }: { onToggleSidebar: () => void } ) => {
    const { user, headerNav } =
        ( window as any )?.vendorDashboardLayoutConfig || {},
        { name: userName, avatar: userAvatar } = user || {};

    const [ isMenuOpen, setIsMenuOpen ] = useState( false );
    const [ popoverAnchor, setPopoverAnchor ] = useState< any >();

    const getMenuIcon = ( iconName?: string ) => {
        const Icon =
            ( LucideIcons as any )[ iconName || '' ] || LucideIcons.User;
        return <Icon size={ 18 } className="text-[#828282]" />;
    };

    return (
        <header
            className={
                'z-10 flex justify-between min-h-20 items-center gap-3 border-solid border-b border-x-0 border-t-0 border-gray-200 bg-white px-12'
            }
        >
            <button
                type="button"
                onClick={ onToggleSidebar }
                aria-label="Toggle sidebar menu"
                className="p-2 rounded hover:bg-gray-100 focus:ring-0 focus:!outline-none"
            >
                <LucideIcons.Menu />
            </button>
            <div
                className={ `dokan-frontend-layout-header flex items-center relative` }
            >
                { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
                <a
                    href={ window.dokan?.urls?.storeUrl || '#' }
                    className="visit-store group skip-color-module flex items-center text-sm gap-2 font-medium text-[#25252D] focus:!outline-none py-4 px-5"
                >
                    <LucideIcons.Globe size={ 16 } className="text-[#828282]" />
                    { __( 'Visit Store', 'dokan-lite' ) }
                </a>
                <div className="border border-[#E9E9E9] border-r-0 h-8"></div>
                <div
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
                    onMouseEnter={ () => setIsMenuOpen( true ) }
                    onMouseLeave={ () => setIsMenuOpen( false ) }
                    className="header-avatar flex items-center gap-2.5 cursor-pointer py-4 px-5"
                    role="button"
                    tabIndex={ 0 }
                    ref={ setPopoverAnchor }
                    aria-haspopup="menu"
                    aria-expanded={ isMenuOpen }
                >
                    { userAvatar && (
                        <img
                            src={ userAvatar }
                            className="h-7 w-7 rounded-full"
                            alt={
                                userName ||
                                __( 'User Profile Image', 'dokan-lite' )
                            }
                        />
                    ) }
                    <LucideIcons.ChevronDown
                        size={ 16 }
                        strokeWidth={ 3 }
                        className={ twMerge(
                            'mt-0.5 text-[#828282]',
                            isMenuOpen && 'rotate-180 active'
                        ) }
                    />
                </div>

                { isMenuOpen && (
                    <div
                        onMouseEnter={ () => setIsMenuOpen( true ) }
                        onMouseLeave={ () => setIsMenuOpen( false ) }
                    >
                        <Popover
                            animate
                            anchor={ popoverAnchor }
                            className="dokan-layout"
                            onClose={ () => setIsMenuOpen( false ) }
                        >
                            <div className="header-popover bg-white rounded-md shadow-md min-w-[240px] transition-all duration-200 ease-in-out py-2">
                                <ul className="flex flex-col">
                                    { headerNav?.map(
                                        ( item: any, idx: number ) => (
                                            <li key={ idx }>
                                                <a
                                                    href={ decodeEntities(
                                                        item?.url || '#'
                                                    ) }
                                                    className="skip-color-module group flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#828282] focus:!outline-none transition-colors duration-150"
                                                    onClick={ () =>
                                                        setIsMenuOpen( false )
                                                    }
                                                    role="menuitem"
                                                >
                                                    { item.isSvg &&
                                                    item?.icon === 'WPLogo' ? (
                                                        <WPLogo className="w-[18px] h-[18px] text-[#828282]" />
                                                    ) : (
                                                        getMenuIcon(
                                                            item?.icon
                                                        )
                                                    ) }
                                                    <span>{ item?.label }</span>
                                                </a>
                                            </li>
                                        )
                                    ) }
                                </ul>
                            </div>
                        </Popover>
                    </div>
                ) }
            </div>
        </header>
    );
};

export default Header;
