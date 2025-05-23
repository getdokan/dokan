import { createContext, useContext, useState } from '@wordpress/element';
import Header from './Header';
import Footer from './Footer';
import ContentArea from './ContentArea';
import { SlotFillProvider } from '@wordpress/components';
import { PluginArea } from '@wordpress/plugins';
import { DokanToaster } from '@getdokan/dokan-ui';
import { useLocation } from 'react-router-dom';

// Create a ThemeContext
const ThemeContext = createContext( null );

// Create a ThemeProvider component
const ThemeProvider = ( { children } ) => {
    const [ theme, setTheme ] = useState( 'light' ); // Example theme state

    return (
        <ThemeContext.Provider value={ { theme, setTheme } }>
            { children }
        </ThemeContext.Provider>
    );
};

export type DokanRoute = {
    backUrl?: string;
    id: string;
    title?: string;
    icon?: JSX.Element | React.ReactNode;
    element: JSX.Element | React.ReactNode;
    header?: JSX.Element | React.ReactNode;
    footer?: JSX.Element | React.ReactNode;
    capabilities?: string[];
    path: string;
    exact?: boolean;
    order?: number;
    parent?: string;
};

interface LayoutProps {
    children: React.ReactNode;
    route: DokanRoute;
    title?: string;
    backUrl?: string;
    headerComponent?: JSX.Element | React.ReactNode;
    footerComponent?: JSX.Element | React.ReactNode;
}

const handleMenuActiveStates = ( currentPath ) => {
    const menuRoute = currentPath.replace( /^\//, '' ); // Remove leading slash.
    const menuItem =
        document.querySelector(
            `.dokan-dashboard-menu li[data-react-route='${ menuRoute }']`
        ) || null;

    // Return if menu item not found.
    if ( ! menuItem ) {
        return;
    }

    document
        .querySelectorAll( '.dokan-dashboard-menu li' )
        .forEach( ( item ) => {
            item.classList.remove( 'active' );
            item.querySelectorAll( '.navigation-submenu li' ).forEach(
                ( subItem ) => {
                    subItem.classList.remove( 'current' );
                }
            );
        } );

    // Get parent menu item if this is a submenu item.
    const parentMenuItem = menuItem.closest( '.dokan-dashboard-menu > li' );
    if ( parentMenuItem ) {
        // Add `active` to parent menu.
        parentMenuItem.classList.add( 'active' );
    }

    const subMenuItem = document.querySelector(
        `.navigation-submenu li[data-react-route='${ menuRoute }']`
    );
    if ( subMenuItem ) {
        // Add `current` to submenu item.
        subMenuItem.classList.add( 'current' );
    }
};

// Create a Layout component that uses the ThemeProvider
const Layout = ( {
    children,
    route,
    title = '',
    backUrl = '',
    headerComponent,
    footerComponent,
}: LayoutProps ) => {
    const location = useLocation(); // Use the location hook to get the current path.
    handleMenuActiveStates( location?.pathname );

    return (
        <ThemeProvider>
            <SlotFillProvider>
                <div className="dokan-dashboard-layout">
                    { headerComponent ? (
                        headerComponent
                    ) : (
                        <Header route={ route } />
                    ) }
                    <ContentArea>{ children }</ContentArea>
                    { footerComponent ? footerComponent : <Footer /> }
                </div>
                <PluginArea scope={ route.id } />
                <DokanToaster />
            </SlotFillProvider>
        </ThemeProvider>
    );
};

// Custom hook to use the ThemeContext
export const useTheme = () => {
    return useContext( ThemeContext );
};

export default Layout;
