import { useEffect, useState } from '@wordpress/element';
import { twMerge } from 'tailwind-merge';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
    const STORAGE_KEY = 'dokanVendorSidebarCollapsed';
    const [ collapsed, setCollapsed ] = useState( () => {
        const isSidebarCollapsed = window?.localStorage?.getItem( STORAGE_KEY );
        return Boolean( parseInt( isSidebarCollapsed || '0' ) );
    } );

    useEffect( () => {
        const dashboardWrapEl = document.querySelector(
            '#dokan-dashboard-fullwidth-wrapper .dokan-dashboard-content'
        );

        // Apply styles when the component mounts
        if ( dashboardWrapEl ) {
            dashboardWrapEl.style.visibility = 'visible';
        }
    }, [] );

    // Persist collapsed state to localStorage
    useEffect( () => {
        window?.localStorage?.setItem( STORAGE_KEY, collapsed ? '1' : '0' );
    }, [ collapsed ] );

    return (
        <div className="dokan-frontend-layout w-full">
            <Sidebar collapsed={ collapsed } />
            <main
                className={ twMerge(
                    'flex-1 border-l border-gray-200 bg-white transition-all duration-200',
                    collapsed ? 'ml-16' : 'ml-60'
                ) }
            >
                <Header
                    onToggleSidebar={ () => setCollapsed( ( v ) => ! v ) }
                />
            </main>
        </div>
    );
};

export default Layout;
