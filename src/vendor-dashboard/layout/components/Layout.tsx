import { useEffect, useState } from '@wordpress/element';
import { useWindowDimensions } from '@dokan/hooks';
import { twMerge } from 'tailwind-merge';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
    const { width: windowWidth } = useWindowDimensions();
    const STORAGE_KEY = 'dokanVendorSidebarCollapsed';
    const [ collapsed, setCollapsed ] = useState( () => {
        const isSidebarCollapsed =
            windowWidth > 768
                ? window?.localStorage?.getItem( STORAGE_KEY )
                : '1'; // default collapsed on mobile
        return Boolean( parseInt( isSidebarCollapsed || '0' ) );
    } );

    useEffect( () => {
        const dashboardWrapEl = document.querySelector(
            '#dokan-dashboard-fullwidth-wrapper .dokan-dashboard-content'
        );

        if ( dashboardWrapEl ) {
            dashboardWrapEl.style.display = 'block';
        }
    }, [] );

    // Persist collapsed state to localStorage.
    useEffect( () => {
        if ( windowWidth > 768 ) {
            window?.localStorage?.setItem( STORAGE_KEY, collapsed ? '1' : '0' );
        }
    }, [ collapsed, windowWidth ] );

    return (
        <>
            <div className="dokan-frontend-layout w-full">
                <Sidebar collapsed={ collapsed } windowWidth={ windowWidth } />

                <main
                    className={ twMerge(
                        'flex-1 border-s border-gray-200 bg-white transition-all duration-200',
                        collapsed
                            ? windowWidth > 768
                                ? 'ms-16'
                                : 'ms-0'
                            : windowWidth > 768
                            ? 'ms-60'
                            : 'ms-0'
                    ) }
                >
                    <Header
                        onToggleSidebar={ () => setCollapsed( ( v ) => ! v ) }
                    />
                </main>
            </div>

            { /* Mobile backdrop: show only on small screens when sidebar is open */ }
            { windowWidth <= 768 && ! collapsed && (
                <div
                    className="fixed inset-0 backdrop-opacity-10 backdrop-invert z-10"
                    onClick={ () => setCollapsed( true ) }
                    aria-hidden="true"
                />
            ) }
        </>
    );
};

export default Layout;
