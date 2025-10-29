// eslint-disable-next-line import/named
import { RefObject, useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import * as LucideIcons from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Tooltip } from '@getdokan/dokan-ui';
import { truncate } from '../../../utilities';
import Submenu from './Submenu';
import CountBubble from './CountBubble';

const Sidebar = ( { collapsed }: { collapsed: boolean } ) => {
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
    const { siteInfo, vendor, subscription, editUrl, sidebarNav } =
        ( window as any )?.vendorDashboardLayoutConfig || {};

    useEffect( () => {
        const currentUrl = window.location?.href || '';
        const initial: Record< string, boolean > = {};

        Object.entries( ( sidebarNav as any ) || {} ).forEach(
            ( [ key, item ]: any ) => {
                let hasActiveChild = false;

                if ( item?.submenu ) {
                    Object.values( item.submenu ).forEach( ( sub: any ) => {
                        if ( sub?.url && currentUrl.startsWith( sub.url ) ) {
                            hasActiveChild = true;
                        }
                    } );
                }

                initial[ key ] = hasActiveChild;
            }
        );

        setExpanded( initial );
    }, [ sidebarNav ] );

    // ==========================================
    // RENDER HELPERS
    // ==========================================
    const { siteTitle, siteIcon } = siteInfo || {};
    const sideBarTitle = siteTitle || __( 'Dokan', 'dokan-lite' );

    const { name: storeName, avatar: storeAvatar } = vendor || {};
    const { name: subscriptionName, status: subscriptionStatus } =
        subscription || {};

    const getIcon = ( iconName: string, forceWhite = false ) => {
        const className = twMerge( 'w-5 h-5', forceWhite && '!text-white' );
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

    // ==========================================
    // MAIN RENDER
    // ==========================================
    const currentUrl = window.location?.href || '';

    return (
        <>
            <aside
                style={ { top: adminBar } }
                className={ twMerge(
                    'dokan-frontend-sidebar text-white fixed left-0 bottom-0 z-20 flex flex-col transition-all duration-200',
                    collapsed ? 'w-24 max-w-24' : 'w-[250px] max-w-[250px]'
                ) }
            >
                { /* === HEADER === */ }
                <div
                    className={ twMerge(
                        'flex items-center gap-3.5 border-solid border-b border-[#DACEFF33] border-t-0 border-x-0 min-h-20',
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
                        <span className="grid h-8 w-8 place-items-center rounded-md bg-[#7047EB]">
                            <LucideIcons.Globe size={ 20 } color="#FFF" />
                        </span>
                    ) }

                    { ! collapsed && (
                        <Tooltip content={ sideBarTitle }>
                            <span className="text-2xl font-bold text-white">
                                { truncate( sideBarTitle, 9 ) }
                            </span>
                        </Tooltip>
                    ) }
                </div>

                { /* === MENU === */ }
                <div
                    className={ twMerge(
                        'flex-1 overflow-y-auto dokan-vendor-sidebar-scroll',
                        collapsed ? 'p-2' : 'p-5'
                    ) }
                >
                    <nav>
                        <ul className="flex flex-col gap-1.5">
                            { Object.entries( sidebarNav || {} ).map(
                                ( [ key, item ]: any ) => {
                                    const hasSub =
                                        !! item?.submenu &&
                                        Object.keys( item.submenu ).length > 0;
                                    const isParentActive =
                                        ! hasSub &&
                                        item?.url &&
                                        currentUrl.startsWith( item.url );
                                    const isExpanded = Boolean(
                                        expanded[ key ]
                                    );

                                    const menuItemRef = getMenuItemRef( key );

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
                                                    'group skip-color-module relative flex items-center rounded-md font-medium focus:!outline-none py-2.5',
                                                    collapsed
                                                        ? 'w-10 max-w-10 justify-center'
                                                        : 'text-sm px-3',
                                                    isParentActive && 'active'
                                                ) }
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
                                                    { getIcon(
                                                        item.icon_name,
                                                        Boolean(
                                                            activePopover?.key ===
                                                                key && collapsed
                                                        )
                                                    ) }
                                                </span>
                                                { ! collapsed && (
                                                    <span className="ml-2">
                                                        { item.title }
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
                                                        <LucideIcons.ChevronUp className="ml-auto w-4 h-4 text-[#A5A5A5] group-hover:text-white" />
                                                    ) : (
                                                        <LucideIcons.ChevronDown className="ml-auto w-4 h-4 text-[#A5A5A5] group-hover:text-white" />
                                                    ) ) }
                                            </a>

                                            { /* Expanded submenu (inline) */ }
                                            { ! collapsed &&
                                                hasSub &&
                                                isExpanded && (
                                                    <ul className="mt-2 mx-0 space-y-1.5">
                                                        { Object.entries(
                                                            item.submenu
                                                        ).map(
                                                            ( [
                                                                subkey,
                                                                subitem,
                                                            ]: any ) => {
                                                                const isSubActive =
                                                                    subitem?.url &&
                                                                    currentUrl.startsWith(
                                                                        subitem.url
                                                                    );

                                                                return (
                                                                    <li
                                                                        key={
                                                                            subkey
                                                                        }
                                                                    >
                                                                        <a
                                                                            href={
                                                                                subitem.url
                                                                            }
                                                                            className={ `group skip-color-module flex items-center py-2.5 px-3 pl-8 text-sm font-medium rounded-md focus:!outline-none ${
                                                                                isSubActive &&
                                                                                'active'
                                                                            }` }
                                                                        >
                                                                            <span
                                                                                className={
                                                                                    'ml-4'
                                                                                }
                                                                            >
                                                                                <span className="ml-3">
                                                                                    {
                                                                                        subitem.title
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
                                                                            </span>
                                                                        </a>
                                                                    </li>
                                                                );
                                                            }
                                                        ) }
                                                    </ul>
                                                ) }
                                        </li>
                                    );
                                }
                            ) }
                        </ul>
                    </nav>
                </div>

                { /* === FOOTER === */ }
                <div
                    className={ twMerge(
                        'border-solid border-t border-[#DACEFF33] border-b-0 border-x-0 py-4',
                        ! collapsed ? 'px-8' : 'px-6 flex justify-center'
                    ) }
                >
                    <a
                        href={ editUrl || '#' }
                        className="flex items-center gap-2.5 focus:!outline-none"
                    >
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
                            <div className="leading-tight space-y-1">
                                <div className="text-sm font-semibold text-white">
                                    { storeName ||
                                        __( 'Your Store', 'dokan-lite' ) }
                                </div>
                                { subscriptionName && (
                                    <div className="text-xs text-indigo-200">
                                        <Tooltip content={ subscriptionName }>
                                            <span>
                                                { truncate(
                                                    subscriptionName,
                                                    10
                                                ) }
                                            </span>
                                        </Tooltip>{ ' ' }
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
                    </a>
                </div>
            </aside>

            { /* === POPOVER === */ }
            { collapsed && activePopover && (
                <Submenu
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
