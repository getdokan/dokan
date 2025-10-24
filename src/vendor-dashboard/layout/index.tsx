import { createRoot, useEffect, useState } from '@wordpress/element';
import * as LucideIcons from 'lucide-react';
import domReady from '@wordpress/dom-ready';
import { truncate } from '../../utilities';
import { twMerge } from 'tailwind-merge';
import { __, sprintf } from '@wordpress/i18n';
import './style.scss';
import { Popover } from '@dokan/components';
import { Tooltip } from '@getdokan/dokan-ui';

const Header = () => {
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

    const { user, editUrl } =
            ( window as any )?.vendorDashboardLayoutConfig || {},
        { name: userName, avatar: userAvatar } = user || {};

    return (
        <header
            className={ twMerge(
                `z-10 flex justify-between min-h-20 items-center gap-3 border-solid border-b border-x-0 border-t-0 border-gray-200 bg-white px-12`,
                `top-[${ adminBar }px]`
            ) }
        >
            <LucideIcons.Menu />
            <div className={ `flex items-center` }>
                { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
                <a
                    href={ window.dokan?.urls?.storeUrl || '#' }
                    className="group skip-color-module flex items-center text-sm gap-2 font-medium text-[#393939] hover:text-[#7047EB] focus:!outline-none"
                >
                    <LucideIcons.Globe size={ 16 } className={ 'text-[#828282] group-hover:text-[#7047EB]' } />
                    { __( 'Visit Store', 'dokan-lite' ) }
                </a>
                <div className="border border-[#E9E9E9] border-r-0 h-8 mx-5"></div>
                <div className="flex items-center gap-2.5">
                    { userAvatar ? (
                        <a
                            href={ editUrl || '#' }
                            className={ 'focus:!outline-none' }
                        >
                            <img
                                src={ userAvatar }
                                className="h-7 w-7 rounded-full"
                                alt={
                                    userName ||
                                    __( 'User Profile Image', 'dokan-lite' )
                                }
                            />
                        </a>
                    ) : (
                        <div
                            className="h-7 w-7 rounded-full bg-orange-300"
                            aria-hidden="true"
                        />
                    ) }
                    <LucideIcons.ChevronDown
                        size={ 16 }
                        strokeWidth={ 3 }
                        color="#828282"
                        className={ 'mt-0.5' }
                    />
                </div>
            </div>
        </header>
    );
};

const Sidebar = () => {
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

    const getIcon = ( iconName: string, isParentActive: boolean ) => {
        const iconProps = {
            className: twMerge(
                isParentActive ? 'text-[#FFFFFF]' : 'text-[#DACEFF]',
                'w-5 h-5 group-hover:text-[#FFFFFF]'
            ),
            size: 20,
        };

        // Get the icon component by name.
        const IconComponent = ( LucideIcons as any )[ iconName ];

        // If the icon is not found, use a fallback icon.
        if ( ! IconComponent ) {
            console.warn(
                `Icon "${ iconName }" not found in Lucide React. Using fallback.`
            );
            return <LucideIcons.Settings { ...iconProps } />;
        }

        return <IconComponent { ...iconProps } />;
    };

    return (
        <aside
            style={ { top: adminBar } }
            className="bg-indigo-950/100 text-white fixed left-0 bottom-0 z-20 w-[250px] max-w-[250px] flex flex-col"
        >
            { /* Top header inforamtion: full width, attached to top, with a bottom border */ }
            <div className="flex items-center gap-3.5 border-solid border-b border-[#DACEFF33] border-t-0 border-x-0 px-8 min-h-20">
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

                <Tooltip content={ sideBarTitle }>
                    <span className="text-2xl font-bold text-white">
                        { truncate( sideBarTitle, 9 ) }
                    </span>
                </Tooltip>
            </div>

            { /* Scrollable menu body */ }
            <div className="flex-1 overflow-y-auto p-5 dokan-vendor-sidebar-scroll">
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
                                    if ( hasSub ) {
                                        e.preventDefault();
                                        setExpanded( ( prev ) => ( {
                                            ...( prev || {} ),
                                            [ key ]: ! prev?.[ key ],
                                        } ) );
                                    }
                                };

                                const Bubble = ( {
                                    count,
                                    isActive,
                                }: {
                                    count: number;
                                    isActive: boolean;
                                } ) => (
                                    <span
                                        className={ twMerge(
                                            'ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-semibold leading-none rounded group-hover:text-[#7C4DFF] group-hover:bg-white',
                                            isActive
                                                ? 'text-[#7C4DFF] bg-white'
                                                : 'text-white bg-[#7C4DFF]'
                                        ) }
                                    >
                                        { count }
                                    </span>
                                );

                                return (
                                    <li key={ key }>
                                        <a
                                            href={ item.url }
                                            onClick={ onParentClick }
                                            className={ `group skip-color-module flex items-center py-2.5 px-3 rounded-md text-sm focus:!outline-none ${
                                                isParentActive
                                                    ? 'text-white bg-[#7047EB]'
                                                    : 'text-[#DACEFF] hover:bg-[#7047EB] hover:text-white'
                                            }` }
                                            aria-expanded={
                                                hasSub ? isExpanded : ''
                                            }
                                        >
                                            { getIcon( item.icon_name, isParentActive ) }
                                            <span className="ml-2">
                                                { item.title }
                                            </span>
                                            { item.counts > 0 && (
                                                <Bubble
                                                    count={ item.counts }
                                                    isActive={ isParentActive }
                                                />
                                            ) }
                                            { hasSub &&
                                                ( isExpanded ? (
                                                    <LucideIcons.ChevronUp className="ml-auto w-4 h-4 text-[#A5A5A5] group-hover:text-white" />
                                                ) : (
                                                    <LucideIcons.ChevronDown className="ml-auto w-4 h-4 text-[#A5A5A5] group-hover:text-white" />
                                                ) ) }
                                        </a>

                                        { hasSub && isExpanded && (
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
                                                            <li key={ subkey }>
                                                                <a
                                                                    href={
                                                                        subitem.url
                                                                    }
                                                                    className={ `group skip-color-module flex items-center py-2.5 px-3 pl-8 text-sm rounded-md focus:!outline-none ${
                                                                        isSubActive
                                                                            ? 'bg-[#7C4DFF] text-white'
                                                                            : 'text-[#DACEFF] hover:bg-[#7047EB] hover:text-white'
                                                                    }` }
                                                                    aria-current={
                                                                        isSubActive
                                                                            ? 'page'
                                                                            : ''
                                                                    }
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
                                                                                isActive={
                                                                                    isSubActive
                                                                                }
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
            <div className="border-solid border-t border-[#DACEFF33] border-b-0 border-x-0 px-8 py-4">
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
                    <div className="leading-tight space-y-1">
                        <div className="text-sm font-semibold text-white">
                            { storeName || __( 'Your Store', 'dokan-lite' ) }
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
                </a>
            </div>
        </aside>
    );
};

const Layout = () => {
    useEffect( () => {
        const dashboardWrapEl = document.querySelector(
            '#dokan-dashboard-fullwidth-wrapper .dokan-dashboard-content'
        );

        // Apply styles when the component mounts
        if ( dashboardWrapEl ) {
            dashboardWrapEl.style.visibility = 'visible';
        }
    }, [] );

    return (
        <div className="w-full">
            <Sidebar />
            <main className="ml-60 flex-1 border-l border-gray-200 bg-white">
                <Header />
            </main>
        </div>
    );
};

// Mount when DOM is ready

domReady( () => {
    const rootEl = document.getElementById(
        'dokan-vendor-dashboard-layout-root'
    );

    if ( rootEl ) {
        const wpAdminBarEl = document.getElementById( 'wpadminbar' ),
            root = createRoot( rootEl );

        rootEl.className +=
            ' sticky z-10 ' + ( wpAdminBarEl ? 'top-8' : 'top-0' );
        root.render( <Layout /> );
    }
} );
