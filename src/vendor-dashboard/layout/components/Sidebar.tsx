import { useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import * as LucideIcons from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Tooltip } from '@getdokan/dokan-ui';
import { truncate } from '../../../utilities';

const Sidebar = ( { collapsed }: { collapsed: boolean } ) => {
    const [ adminBar, setAdminBar ] = useState( 0 );

    useEffect( () => {
        const compute = () => {
            const el = document.getElementById( 'wpadminbar' );
            setAdminBar( el ? el.offsetHeight : 0 );
        };
        compute();
        window.addEventListener( 'resize', compute );
        return () => window.removeEventListener( 'resize', compute );
    }, [] );

    const { siteInfo, vendor, subscription, editUrl, sidebarNav } =
        ( window as any )?.vendorDashboardLayoutConfig || {};

    const [ expanded, setExpanded ] = useState< Record< string, boolean > >(
        {}
    );

    // Hover state for collapsed submenu flyouts
    const [ hoveredKey, setHoveredKey ] = useState< string | null >( null );
    const [ hoverFromBottom, setHoverFromBottom ] = useState( false );
    const [ hoverRect, setHoverRect ] = useState< DOMRect | null >( null );
    const hoverTimeoutRef = useRef< any >( null );

    const computePopoverFromBottom = ( rect: DOMRect, count: number ) => {
        // Estimate popover height; cap for safety and allow scroll inside
        const itemHeight = 40; // px per submenu row approx
        const padding = 16; // vertical padding
        const estimated = Math.min( count, 8 ) * itemHeight + padding;
        return rect.bottom + estimated > window.innerHeight;
    };

    // Initialize expansion: default collapsed; expand the one that contains the active submenu
    useEffect( () => {
        const current = window.location?.href || '';
        const initial: Record< string, boolean > = {};
        Object.entries( ( sidebarNav as any ) || {} ).forEach(
            ( [ key, item ]: any ) => {
                let hasActiveChild = false;
                if ( item?.submenu ) {
                    Object.values( item.submenu ).forEach( ( sub: any ) => {
                        if ( sub?.url && current.startsWith( sub.url ) ) {
                            hasActiveChild = true;
                        }
                    } );
                }
                initial[ key ] = hasActiveChild;
            }
        );
        setExpanded( initial );
    }, [ sidebarNav ] );

    const { siteTitle, siteIcon } = siteInfo,
        sideBarTitle = siteTitle || __( 'Dokan', 'dokan-lite' );

    const { name: storeName, avatar: storeAvatar } = vendor || {};
    const { name: subscriptionName, status: subscriptionStatus } =
        subscription || {};

    const getIcon = ( iconName: string ) => {
        const iconProps = {
            className: 'w-5 h-5',
            size: 20,
        };

        // Get the icon component by name.
        const IconComponent = ( LucideIcons as any )[ iconName ];

        // If the icon is not found, use a fallback icon.
        if ( ! IconComponent ) {
            return <LucideIcons.Settings { ...iconProps } />;
        }

        return <IconComponent { ...iconProps } />;
    };

    return (
        <aside
            style={ { top: adminBar } }
            className={ twMerge(
                'dokan-frontend-sidebar text-white fixed left-0 bottom-0 z-20 flex flex-col transition-all duration-200',
                collapsed ? 'w-24 max-w-24' : 'w-[250px] max-w-[250px]'
            ) }
        >
            { /* Top header inforamtion: full width, attached to top, with a bottom border */ }
            <div
                className={ twMerge(
                    'flex items-center gap-3.5 border-solid border-b border-[#DACEFF33] border-t-0 border-x-0 min-h-20',
                    collapsed ? 'px-5 justify-center' : 'px-8'
                ) }
            >
                { siteIcon ? (
                    <img
                        src={ siteIcon }
                        className={ 'h-8 w-8 rounded-md' }
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

            { /* Scrollable menu body */ }
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
                                const currentUrl = window.location?.href || '';
                                const hasSub =
                                    !! item?.submenu &&
                                    Object.keys( item.submenu ).length > 0;
                                const isParentActive =
                                    ! hasSub &&
                                    item?.url &&
                                    currentUrl.startsWith( item.url );
                                const isExpanded = Boolean( expanded?.[ key ] );

                                const onParentClick = ( e: any ) => {
                                    if ( hasSub && ! collapsed ) {
                                        e.preventDefault();
                                        setExpanded( ( prev ) => ( {
                                            ...( prev || {} ),
                                            [ key ]: ! prev?.[ key ],
                                        } ) );
                                    }
                                };

                                const Bubble = ( {
                                    count,
                                    isCollapsed = false,
                                }: {
                                    count: number;
                                    isCollapsed?: boolean;
                                } ) => (
                                    <span
                                        className={ twMerge(
                                            'sidebar-menu-bubble ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 py-0.5 text-[10px] font-semibold leading-none rounded-md text-white',
                                            isCollapsed &&
                                                'absolute -top-1 -right-2'
                                        ) }
                                    >
                                        { count }
                                    </span>
                                );

                                return (
                                    <li
                                        className={ twMerge(
                                            'relative',
                                            collapsed && 'flex justify-center'
                                        ) }
                                        key={ key }
                                        onMouseEnter={ ( e ) => {
                                            if ( collapsed && hasSub ) {
                                                const rect = (
                                                    e.currentTarget as HTMLElement
                                                 ).getBoundingClientRect();
                                                const subCount = Object.keys(
                                                    item.submenu || {}
                                                ).length;
                                                setHoverRect( rect );
                                                setHoverFromBottom(
                                                    computePopoverFromBottom(
                                                        rect,
                                                        subCount
                                                    )
                                                );
                                                setHoveredKey( key );
                                            }
                                        } }
                                        onMouseLeave={ () => {
                                            if ( collapsed ) {
                                                // delay slightly to allow moving into the flyout
                                                if ( hoverTimeoutRef.current ) {
                                                    clearTimeout(
                                                        hoverTimeoutRef.current
                                                    );
                                                }
                                                hoverTimeoutRef.current =
                                                    setTimeout( () => {
                                                        setHoveredKey( null );
                                                    }, 150 );
                                            }
                                        } }
                                    >
                                        <a
                                            href={ item.url }
                                            onClick={ onParentClick }
                                            className={ twMerge(
                                                'group skip-color-module relative flex items-center rounded-md font-medium focus:!outline-none py-2.5',
                                                collapsed
                                                    ? 'w-10 max-w-10 justify-center'
                                                    : 'text-sm px-3',
                                                isParentActive && 'active'
                                            ) }
                                        >
                                            { getIcon( item.icon_name ) }
                                            { ! collapsed && (
                                                <span className="ml-2">
                                                    { item.title }
                                                </span>
                                            ) }
                                            { item.counts > 0 && (
                                                <Bubble
                                                    count={ item.counts }
                                                    isCollapsed={ collapsed }
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

                                        { collapsed &&
                                            hasSub &&
                                            hoveredKey === key &&
                                            hoverRect && (
                                                <div
                                                    onMouseEnter={ () => {
                                                        if (
                                                            hoverTimeoutRef.current
                                                        ) {
                                                            clearTimeout(
                                                                hoverTimeoutRef.current
                                                            );
                                                        }
                                                        setHoveredKey( key );
                                                    } }
                                                    onMouseLeave={ () => {
                                                        if (
                                                            hoverTimeoutRef.current
                                                        ) {
                                                            clearTimeout(
                                                                hoverTimeoutRef.current
                                                            );
                                                        }
                                                        hoverTimeoutRef.current =
                                                            setTimeout( () => {
                                                                setHoveredKey(
                                                                    null
                                                                );
                                                            }, 150 );
                                                    } }
                                                    className="z-30"
                                                    style={ {
                                                        position: 'fixed',
                                                        left:
                                                            ( hoverRect?.right ||
                                                                0 ) + 8,
                                                        top: hoverFromBottom
                                                            ? undefined
                                                            : hoverRect?.top,
                                                        bottom: hoverFromBottom
                                                            ? Math.max(
                                                                  0,
                                                                  window.innerHeight -
                                                                      ( hoverRect?.bottom ||
                                                                          0 )
                                                              )
                                                            : undefined,
                                                    } }
                                                >
                                                    <div className="bg-white rounded-md shadow-md min-w-[220px] max-h-96 overflow-y-auto py-2">
                                                        <ul className="flex flex-col">
                                                            { Object.entries(
                                                                item.submenu ||
                                                                    {}
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
                                                                                className={ twMerge(
                                                                                    'skip-color-module group flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#828282] hover:text-[#7047EB] hover:bg-[#EFEAFF] rounded-md focus:!outline-none',
                                                                                    isSubActive
                                                                                        ? 'active'
                                                                                        : ''
                                                                                ) }
                                                                            >
                                                                                <span className="ml-1">
                                                                                    {
                                                                                        subitem.title
                                                                                    }
                                                                                </span>
                                                                                { subitem.counts >
                                                                                    0 && (
                                                                                    <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 py-0.5 text-[10px] font-semibold leading-none rounded-md text-white sidebar-menu-bubble">
                                                                                        {
                                                                                            subitem.counts
                                                                                        }
                                                                                    </span>
                                                                                ) }
                                                                            </a>
                                                                        </li>
                                                                    );
                                                                }
                                                            ) }
                                                        </ul>
                                                    </div>
                                                </div>
                                            ) }

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
                                                                                <Bubble
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

            { /* Bottom footer: full width, attached to bottom, with a top border */ }
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
                                storeName || __( 'Store Image', 'dokan-lite' )
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
                                            { truncate( subscriptionName, 10 ) }
                                        </span>
                                    </Tooltip>{ ' ' }
                                    { subscriptionStatus &&
                                        // eslint-disable-next-line @wordpress/valid-sprintf
                                        sprintf(
                                            /* translators: 1) Subscription status. E.g. "Active" or "Expired" */
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
    );
};

export default Sidebar;
