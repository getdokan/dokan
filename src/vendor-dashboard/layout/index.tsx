import { createRoot, useEffect, useState } from '@wordpress/element';
import { ChevronDown, Globe, Menu } from 'lucide-react';
import domReady from '@wordpress/dom-ready';
import { truncate } from '../../utilities';
import { twMerge } from 'tailwind-merge';
import { __, sprintf } from '@wordpress/i18n';
import './style.scss';
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

    const { user, editUrl } = ( window as any )?.vendorDashboardLayoutConfig || {},
        { name: userName, avatar: userAvatar } = user || {};

    return (
        <header
            className={ twMerge(
                `z-10 flex justify-between min-h-20 items-center gap-3 border-solid border-b border-x-0 border-t-0 border-gray-200 bg-white px-12`,
                `top-[${ adminBar }px]`
            ) }
        >
            <Menu />
            <div className={ `flex items-center` }>
                { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
                <a
                    href={ window.dokan?.urls?.storeUrl || '#' }
                    className="skip-color-module flex items-center text-sm gap-2 font-medium text-[#7047EB] hover:text-indigo-700"
                >
                    <Globe size={ 16 } color="#7047EB" />
                    { __( 'Visit Store', 'dokan-lite' ) }
                </a>
                <div className="border border-[#E9E9E9] border-r-0 h-8 mx-5"></div>
                <div className="flex items-center gap-2.5">
                    { userAvatar ? (
                        <a href={ editUrl || '#' }>
                            <img
                                src={ userAvatar }
                                className="h-7 w-7 rounded-full"
                                alt={ userName || __( 'User Profile Image', 'dokan-lite' ) }
                            />
                        </a>
                    ) : (
                        <div
                            className="h-7 w-7 rounded-full bg-orange-300"
                            aria-hidden="true"
                        />
                    ) }
                    <ChevronDown
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
    const items = [
        'Overview',
        'Products',
        'Orders',
        'Request Quotes',
        'Withdraw',
        'Reverse Withdrawal',
        'Announcement',
        'Delivery Time',
        'Coupons',
        'Reports',
        'Store Stats',
        'Reviews',
        'Staff',
        'Return Request',
        'Support',
        'Tools',
        'Setting',
        'Overview',
        'Products',
        'Orders',
        'Request Quotes',
        'Withdraw',
        'Reverse Withdrawal',
        'Announcement',
        'Delivery Time',
        'Coupons',
        'Reports',
        'Store Stats',
        'Reviews',
        'Staff',
        'Return Request',
        'Support',
        'Tools',
        'Setting',
    ];

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

    const { siteInfo, vendor, subscription, editUrl } =
        ( window as any )?.vendorDashboardLayoutConfig || {};

    const { siteTitle, siteIcon } = siteInfo,
        sideBarTitle = siteTitle || __( 'Dokan', 'dokan-lite' );

    const { name: storeName, avatar: storeAvatar } = vendor || {};
    const { name: subscriptionName, status: subscriptionStatus } = subscription || {};

    return (
        <aside
            style={ { top: adminBar } }
            className="bg-indigo-950/100 text-white fixed left-0 bottom-0 z-20 w-[250px] max-w-[250px] flex flex-col"
        >
            { /* Top header inforamtion: full width, attached to top, with a bottom border */ }
            <div className="mb-2 flex items-center gap-3.5 border-solid border-b border-[#DACEFF33] border-t-0 border-x-0 px-8 min-h-20">
                { siteIcon ? (
                    <img
                        src={ siteIcon }
                        className={ 'h-8 w-8 rounded-md' }
                        alt={ __( 'Vendor Dashboard Logo', 'dokan-lite' ) }
                    />
                ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-md bg-[#ECE6FF]">
                        <span className="h-4 w-4 rounded bg-gradient-to-br from-[#79A926] to-[#197B84]" />
                    </span>
                ) }

                <Tooltip content={ sideBarTitle }>
                    <span className="text-2xl font-bold text-white">
                        { truncate( sideBarTitle, 9 ) }
                    </span>
                </Tooltip>
            </div>

            { /* Scrollable menu body */ }
            <div className="flex-1 overflow-y-auto px-5 dokan-vendor-sidebar-scroll">
                <nav className="flex flex-col gap-1">
                    { items.map( ( label ) => (
                        // eslint-disable-next-line jsx-a11y/anchor-is-valid
                        <a
                            key={ label }
                            href="#"
                            className={ `skip-color-module rounded-md px-3 py-2 text-[#DACEFF] hover:text-white hover:bg-indigo-600 ${
                                label === 'Products'
                                    ? 'bg-indigo-600 text-white'
                                    : ''
                            }` }
                        >
                            { label }
                        </a>
                    ) ) }
                </nav>
            </div>

            { /* Bottom footer: full width, attached to bottom, with a top border */ }
            <div className="border-solid border-t border-[#DACEFF33] border-b-0 border-x-0 px-8 py-4">
                <a
                    href={ editUrl || '#' }
                    className="flex items-center gap-2.5"
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
