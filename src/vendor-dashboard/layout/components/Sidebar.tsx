// eslint-disable-next-line import/named
// import { Tooltip } from '@getdokan/dokan-ui';
import { truncate } from '@src/utilities';
// import { Tooltip } from '@wordpress/components';
import { DokanTooltip as Tooltip } from '@src/components';
import {
    RawHTML,
    RefObject,
    useEffect,
    useRef,
    useState,
} from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { __, sprintf } from '@wordpress/i18n';
import * as LucideIcons from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import CountBubble from './CountBubble';
import SubmenuPopover from './SubmenuPopover';

// Pick the submenu whose URL is the longest prefix of currentUrl so nested
// routes (e.g. orders/new) don't also activate their parent list (orders).
export const getActiveSubmenuKey = (
    submenu: any,
    url: string
): string | null => {
    let activeKey: string | null = null;
    let activeLength = 0;
    Object.entries( submenu || {} ).forEach( ( [ subkey, subitem ]: any ) => {
        if (
            subitem?.url &&
            url.startsWith( subitem.url ) &&
            subitem.url.length > activeLength
        ) {
            activeKey = subkey;
            activeLength = subitem.url.length;
        }
    } );
    return activeKey;
};

const Sidebar = ( {
    collapsed,
    windowWidth,
}: {
    collapsed: boolean;
    windowWidth: number;
} ) => {
    const [ currentUrl, setCurrentUrl ] = useState( window.location?.href );
    const [ adminBar, setAdminBar ] = useState( 0 );
    const [ expanded, setExpanded ] = useState< Record< string, boolean > >(
        {}
    );

    // ==========================================
    // POPOVER STATE MANAGEMENT
    // ==========================================
    const [ activePopover, setActivePopover ] = useState< {
        key: string;
        submenu: any;
        anchorRef: RefObject< HTMLElement >;
    } | null >( null );

    const hideTimeoutRef = useRef< NodeJS.Timeout | null >( null );
    const menuItemRefs = useRef< Record< string, RefObject< HTMLLIElement > > >(
        {}
    );

    const getMenuItemRef = ( key: string ) => {
        if ( ! menuItemRefs.current[ key ] ) {
            menuItemRefs.current[ key ] = { current: null };
        }
        return menuItemRefs.current[ key ];
    };

    const clearHideTimeout = () => {
        if ( hideTimeoutRef.current ) {
            clearTimeout( hideTimeoutRef.current );
            hideTimeoutRef.current = null;
        }
    };

    const showPopover = ( key: string, submenu: any ) => {
        if ( ! collapsed ) {
            return;
        }

        clearHideTimeout();
        const anchorRef = getMenuItemRef( key );
        setActivePopover( {
            key,
            submenu,
            anchorRef,
        } );
    };

    const hidePopover = () => {
        if ( ! collapsed ) {
            return;
        }

        clearHideTimeout();
        hideTimeoutRef.current = setTimeout( () => {
            setActivePopover( null );
        }, 200 ); // Delay to allow moving mouse to popover
    };

    const keepPopoverVisible = () => {
        clearHideTimeout();
    };

    const closePopover = () => {
        clearHideTimeout();
        setActivePopover( null );
    };

    // Cleanup on unmounting.
    useEffect( () => {
        return () => clearHideTimeout();
    }, [] );

    // Reset popover when sidebar is expanded.
    useEffect( () => {
        if ( ! collapsed ) {
            setActivePopover( null );
            clearHideTimeout();
        }

        document.documentElement.style.setProperty(
            '--dokan-sidebar-width',
            `${ collapsed ? 96 : 250 }px`
        );
    }, [ collapsed ] );

    // ==========================================
    // ADMIN BAR HEIGHT DETECTION
    // ==========================================
    useEffect( () => {
        const compute = () => {
            const el = document.getElementById( 'wpadminbar' );
            setAdminBar( el ? el.offsetHeight : 0 );
        };
        compute();
        window.addEventListener( 'resize', compute );
        return () => window.removeEventListener( 'resize', compute );
    }, [] );

    // ==========================================
    // ACTIVE MENU DETECTION & AUTO-EXPAND
    // ==========================================
    const { siteInfo, vendor, subscription, sidebarNav } =
        ( window as any )?.vendorDashboardLayoutConfig || {};

    useEffect( () => {
        const currentUrl = window.location?.href || '';
        const initial: Record< string, boolean > = {};

        Object.entries( ( sidebarNav as any ) || {} ).forEach(
            ( [ key, item ]: any ) => {
                initial[ key ] = item?.submenu
                    ? getActiveSubmenuKey( item.submenu, currentUrl ) !== null
                    : false;
            }
        );

        setExpanded( initial );
    }, [ sidebarNav ] );

    // ==========================================
    // RENDER HELPERS
    // ==========================================
    const { siteTitle, siteIcon, siteUrl } = siteInfo || {};
    const sideBarTitle = siteTitle || __( 'Dokan', 'dokan-lite' );

    const { name: storeName, avatar: storeAvatar } = vendor || {};
    const { name: subscriptionName, status: subscriptionStatus } =
        subscription || {};

    const getIcon = ( iconName: string, forceWhite = false ) => {
        const className = twMerge( 'w-5 h-5', forceWhite && 'hovered-item' );
        const iconProps = {
            className,
            size: 20,
        } as const;

        const IconComponent = ( LucideIcons as any )[ iconName ];
        if ( ! IconComponent ) {
            return <LucideIcons.Settings { ...iconProps } />;
        }

        return <IconComponent { ...iconProps } />;
    };

    const toggleSubmenu = ( key: string ) => {
        setExpanded( ( prev ) => ( {
            ...prev,
            [ key ]: ! prev[ key ],
        } ) );
    };

    useEffect( () => {
        // Check if the current URL is supported and has the correct hash path.
        const checkAndUpdate = () => {
            setCurrentUrl( window.location.href );
        };

        // Initial check.
        checkAndUpdate();

        // Listen events for comprehensive URL change detection.
        window.addEventListener( 'hashchange', checkAndUpdate );
        return () => window.removeEventListener( 'hashchange', checkAndUpdate );
    }, [] );

    return (
        <>
            <aside
                style={ { top: windowWidth > 600 ? adminBar : 0 } }
                className={ twMerge(
                    'dokan-frontend-sidebar bg-primary-500 text-white fixed start-0 bottom-0 z-20 flex flex-col transition-all duration-200',
                    collapsed
                        ? windowWidth <= 768
                            ? 'w-0 max-w-0'
                            : 'w-24 max-w-24'
                        : 'w-[250px] max-w-[250px]'
                ) }
            >
                { /* === HEADER === */ }
                <a
                    href={ siteUrl || '/' }
                    className={ twMerge(
                        'flex items-center gap-3.5 min-h-20 no-underline focus:!outline-none rounded-md',
                        collapsed ? 'px-5 justify-center' : 'px-8'
                    ) }
                >
                    { siteIcon ? (
                        <img
                            src={ siteIcon }
                            className="h-8 w-8 rounded-md"
                            alt={ __( 'Vendor Dashboard Logo', 'dokan-lite' ) }
                        />
                    ) : (
                        <span
                            className={ twMerge(
                                'grid h-8 w-8 place-items-center rounded-md site-icon',
                                collapsed && windowWidth <= 768
                                    ? 'hidden'
                                    : 'w-8'
                            ) }
                        >
                            <LucideIcons.Globe size={ 20 } color="#FFF" />
                        </span>
                    ) }

                    { ! collapsed && (
                        <Tooltip
                            content={
                                sideBarTitle ||
                                __( 'Vendor Dashboard', 'dokan-lite' )
                            }
                        >
                            <span className="text-xl font-bold text-white">
                                { truncate( sideBarTitle, 9 ) }
                            </span>
                        </Tooltip>
                    ) }
                </a>

                { /* === MENU === */ }
                <div
                    className={ twMerge(
                        'flex-1 overflow-y-auto dokan-vendor-sidebar-scroll',
                        collapsed && windowWidth <= 768 ? 'p-0' : 'p-5'
                    ) }
                >
                    <nav>
                        <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
                            { Object.entries( sidebarNav || {} ).map(
                                ( [ key, item ]: any ) => {
                                    // If switched off from the menu manager.
                                    if (
                                        'is_switched_on' in item &&
                                        ! item.is_switched_on
                                    ) {
                                        return null;
                                    }

                                    const hasSub =
                                        !! item?.submenu &&
                                        Object.keys( item.submenu ).length > 0;

                                    // Parent is active if it has no submenu and its URL matches current
                                    const isParentActive =
                                        ! hasSub &&
                                        item?.url &&
                                        currentUrl.startsWith( item.url );

                                    // Detect which child submenu item is active (longest-prefix match)
                                    const activeSubkey = hasSub
                                        ? getActiveSubmenuKey(
                                              item.submenu,
                                              currentUrl
                                          )
                                        : null;
                                    const hasActiveChild =
                                        activeSubkey !== null;

                                    // In collapsed state, mark parent as active when a child is active
                                    const isParentActiveCollapsed =
                                        collapsed && hasSub && hasActiveChild;

                                    const isExpanded = Boolean(
                                        expanded[ key ]
                                    );

                                    const menuItemRef = getMenuItemRef( key );
                                    const menuTitle = applyFilters(
                                        'dokan_sidebar_menu_title',
                                        item?.menu_manager_title || item?.title,
                                        item
                                    ) as string;
                                    const isMenuItemActive =
                                        isParentActive ||
                                        isParentActiveCollapsed;

                                    return (
                                        <li
                                            key={ key }
                                            ref={ menuItemRef as any }
                                            className={ twMerge(
                                                'relative',
                                                collapsed &&
                                                    'flex justify-center'
                                            ) }
                                            onMouseEnter={ () => {
                                                if ( hasSub ) {
                                                    showPopover(
                                                        key,
                                                        item.submenu
                                                    );
                                                }
                                            } }
                                            onMouseLeave={ hidePopover }
                                        >
                                            <a
                                                href={ item.url }
                                                onClick={ ( e ) => {
                                                    if (
                                                        hasSub &&
                                                        ! collapsed
                                                    ) {
                                                        e.preventDefault();
                                                        toggleSubmenu( key );
                                                    }
                                                } }
                                                className={ twMerge(
                                                    'group skip-color-module relative flex items-center rounded-md font-medium focus:!outline-none py-2.5 no-underline hover:bg-primary-hover data-[active=true]:bg-primary-hover',
                                                    collapsed
                                                        ? windowWidth <= 768
                                                            ? 'w-0 max-w-0'
                                                            : 'w-10 max-w-10 justify-center'
                                                        : 'text-sm px-3',
                                                    isMenuItemActive && 'active'
                                                ) }
                                                data-active={
                                                    isMenuItemActive
                                                        ? 'true'
                                                        : 'false'
                                                }
                                                target={
                                                    item.target || '_self'
                                                }
                                            >
                                                { /* Icon: turn white when its popover is visible */ }
                                                <span
                                                    className={ twMerge(
                                                        activePopover?.key ===
                                                            key && collapsed
                                                            ? 'text-white'
                                                            : ''
                                                    ) }
                                                >
                                                    { /* Render custom images or icons from the sidebar config */ }
                                                    { item.icon &&
                                                    item.icon.startsWith(
                                                        '<img'
                                                    ) ? (
                                                        <span
                                                            dangerouslySetInnerHTML={ {
                                                                __html: item.icon,
                                                            } }
                                                        />
                                                    ) : (
                                                        getIcon(
                                                            item.icon_name,
                                                            Boolean(
                                                                activePopover?.key ===
                                                                    key &&
                                                                    collapsed
                                                            )
                                                        )
                                                    ) }
                                                </span>
                                                { ! collapsed && (
                                                    <span className="ms-2">
                                                        { menuTitle }
                                                    </span>
                                                ) }
                                                { item.counts > 0 && (
                                                    <CountBubble
                                                        count={ item.counts }
                                                        isCollapsed={
                                                            collapsed
                                                        }
                                                    />
                                                ) }
                                                { hasSub &&
                                                    ! collapsed &&
                                                    ( isExpanded ? (
                                                        <LucideIcons.ChevronUp
                                                            className={ twMerge(
                                                                'ms-2 w-4 h-4 text-white group-hover:text-white transition-transform duration-200',
                                                                item.counts > 0
                                                                    ? 'ms-2'
                                                                    : 'ms-auto'
                                                            ) }
                                                        />
                                                    ) : (
                                                        <LucideIcons.ChevronDown
                                                            className={ twMerge(
                                                                'ms-2 w-4 h-4 text-white group-hover:text-white transition-transform duration-200',
                                                                item.counts > 0
                                                                    ? 'ms-2'
                                                                    : 'ms-auto'
                                                            ) }
                                                        />
                                                    ) ) }
                                            </a>

                                            { /* Expanded submenu (inline) with smooth animation */ }
                                            { ! collapsed && hasSub && (
                                                <div
                                                    className={ twMerge(
                                                        'overflow-hidden',
                                                        isExpanded
                                                            ? 'max-h-full opacity-100'
                                                            : 'max-h-0 opacity-0 pointer-events-none'
                                                    ) }
                                                >
                                                    <ul className="mt-2 mx-0 space-y-1.5 list-none p-0">
                                                        { Object.entries(
                                                            item.submenu
                                                        ).map(
                                                            ( [
                                                                subkey,
                                                                subitem,
                                                            ]: any ) => {
                                                                // If switched off from the menu manager.
                                                                if (
                                                                    'is_switched_on' in
                                                                        subitem &&
                                                                    ! subitem.is_switched_on
                                                                ) {
                                                                    return null;
                                                                }

                                                                const isSubActive =
                                                                    subkey ===
                                                                    activeSubkey;

                                                                const subMenuTitle =
                                                                    applyFilters(
                                                                        'dokan_sidebar_submenu_title',
                                                                        subitem?.menu_manager_title ||
                                                                            subitem?.title,
                                                                        subitem
                                                                    ) as string;

                                                                return (
                                                                    <li
                                                                        key={
                                                                            subkey
                                                                        }
                                                                        className={
                                                                            'my-2'
                                                                        }
                                                                    >
                                                                        <a
                                                                            href={
                                                                                subitem.url
                                                                            }
                                                                            className={ twMerge(
                                                                                'group skip-color-module no-underline flex items-center p-3 text-sm font-medium rounded-md focus:!outline-none',
                                                                                isSubActive &&
                                                                                    'active'
                                                                            ) }
                                                                            target={
                                                                                subitem.target ||
                                                                                '_self'
                                                                            }
                                                                        >
                                                                            <LucideIcons.Settings className="w-5 h-5 !text-transparent" />
                                                                            <span className="ms-2">
                                                                                {
                                                                                    subMenuTitle
                                                                                }
                                                                            </span>
                                                                            { subitem.counts >
                                                                                0 && (
                                                                                <CountBubble
                                                                                    count={
                                                                                        subitem.counts
                                                                                    }
                                                                                />
                                                                            ) }
                                                                        </a>
                                                                    </li>
                                                                );
                                                            }
                                                        ) }
                                                    </ul>
                                                </div>
                                            ) }
                                        </li>
                                    );
                                }
                            ) }
                        </ul>
                    </nav>
                </div>

                <hr className="m-0 w-full h-[1px]" />

                { /* === FOOTER === */ }
                <div
                    className={ twMerge(
                        'py-4',
                        ! collapsed ? 'px-8' : 'px-6 flex justify-center'
                    ) }
                >
                    <div className="flex items-center gap-2.5 focus:!outline-none">
                        { storeAvatar ? (
                            <img
                                src={ storeAvatar }
                                alt={
                                    storeName ||
                                    __( 'Store Image', 'dokan-lite' )
                                }
                                className="h-10 w-10 rounded-full"
                            />
                        ) : (
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600">
                                <span className="h-2.5 w-2.5 rotate-45 rounded-sm bg-white/90" />
                            </div>
                        ) }

                        { ! collapsed && (
                            <div className="sidebar-footer leading-tight space-y-1">
                                <div className="store-name text-sm font-semibold">
                                    { storeName ? (
                                        <Tooltip
                                            content={
                                                <RawHTML>{ storeName }</RawHTML>
                                            }
                                        >
                                            <span>
                                                <RawHTML>
                                                    { truncate(
                                                        storeName,
                                                        16
                                                    ) }
                                                </RawHTML>
                                            </span>
                                        </Tooltip>
                                    ) : (
                                        __( 'Your Store', 'dokan-lite' )
                                    ) }
                                </div>
                                { subscriptionName && (
                                    <div className="subscription-info text-xs flex items-center gap-1">
                                        <Tooltip
                                            content={
                                                <RawHTML>
                                                    { subscriptionName }
                                                </RawHTML>
                                            }
                                        >
                                            <span>
                                                <RawHTML>
                                                    { truncate(
                                                        subscriptionName,
                                                        10
                                                    ) }
                                                </RawHTML>
                                            </span>
                                        </Tooltip>
                                        { subscriptionStatus &&
                                            sprintf(
                                                /* translators: %1$s: Subscription status */
                                                __( '(%1$s)', 'dokan-lite' ),
                                                subscriptionStatus
                                            ) }
                                    </div>
                                ) }
                            </div>
                        ) }
                    </div>
                </div>
            </aside>

            { /* === POPOVER === */ }
            { collapsed && activePopover && (
                <SubmenuPopover
                    submenu={ activePopover.submenu }
                    anchorRef={ activePopover.anchorRef }
                    onMouseEnter={ keepPopoverVisible }
                    onMouseLeave={ hidePopover }
                    onClose={ closePopover }
                />
            ) }
        </>
    );
};

export default Sidebar;
