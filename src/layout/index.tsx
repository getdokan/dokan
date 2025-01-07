import { createContext, useContext, useState } from '@wordpress/element';
import Header from './Header';
import Footer from './Footer';
import ContentArea from './ContentArea';
import {
    SlotFillProvider
} from '@wordpress/components';
import { PluginArea } from '@wordpress/plugins';
import { DokanToaster } from "@getdokan/dokan-ui";

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
    id: string;
    title?: string;
    icon?: JSX.Element | React.ReactNode;
    element: JSX.Element | React.ReactNode;
    header?: JSX.Element | React.ReactNode;
    footer?: JSX.Element | React.ReactNode;
    path: string;
    exact?: boolean;
    order?: number;
    parent?: string;
};

interface LayoutProps {
    children: React.ReactNode;
    route: DokanRoute;
    title?: string;
    headerComponent?: JSX.Element|React.ReactNode;
    footerComponent?: JSX.Element|React.ReactNode;
}

// Create a Layout component that uses the ThemeProvider
const Layout = ( {
    children,
    route,
    title = '',
    headerComponent,
    footerComponent,
}: LayoutProps ) => {
    return (
        <ThemeProvider>
            <SlotFillProvider>
            <div className="dokan-layout">
                { headerComponent ? (
                    headerComponent
                ) : (
                    <Header title={ title } />
                ) }
                <ContentArea>{ children }</ContentArea>
                { footerComponent ? footerComponent : <Footer /> }
            </div>
            <PluginArea scope={route.id} />
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
