import { useEffect, useState } from '@wordpress/element';
import Menu from './Menu';
import Tab from './Tab';
import SettingsParser from './SettingsParser';
import apiFetch from '@wordpress/api-fetch';

export type StatusElement = {
    headers?: Array< string >;
    payload?: Object;
    request?: string;
    endpoint?: string;
    url?: string;
    title_text?: string;
    id: string;
    type: string;
    title?: string;
    description?: string;
    icon?: string;
    data?: string;
    hook_key?: string;
    children?: Array< StatusElement >;
};

const Status = () => {
    const [ allSettings, setAllSettings ] = useState< Array< StatusElement > >(
        []
    );
    const [ loading, setLoading ] = useState< boolean >( true );
    const [ pages, setPages ] = useState< StatusElement[] >( [] );
    const [ selectedPage, setSelectedPage ] = useState< string >( '' );

    const [ tabs, setTabs ] = useState< StatusElement[] >( [] );
    const [ selectedTab, setSelectedTab ] = useState< string >( '' );
    const [ elements, setElements ] = useState< StatusElement[] >( [] );

    useEffect( () => {
        apiFetch< Array< StatusElement > >( {
            path: 'dokan/v1/admin/dashboard/status',
        } )
            .then( ( data ) => {
                console.log( data );
                setAllSettings( data );
                setLoading( false );
            } )
            .catch( ( error ) => {
                console.log( error );
                setLoading( false );
            } );
    }, [] );

    useEffect( () => {
        if ( ! loading ) {
            setPages(
                allSettings.filter( ( child ) => child.type === 'page' )
            );
        }
    }, [ allSettings, loading ] );

    useEffect( () => {
        if ( ! loading && pages.length > 0 ) {
            setSelectedPage(
                selectedPage === '' ? pages[ 0 ].id : selectedPage
            );
        }
    }, [ pages, loading, selectedPage ] );

    useEffect( () => {
        if ( loading ) {
            return;
        }
        if ( pages?.length > 0 ) {
            setTabs(
                pages
                    ?.find( ( child ) => child.id === selectedPage )
                    ?.children.filter( ( child ) => child.type === 'tab' )
            );
        } else {
            setTabs( allSettings?.filter( ( child ) => child.type === 'tab' ) );
        }
    }, [ allSettings, pages, selectedPage, loading ] );

    useEffect( () => {
        if ( loading ) {
            return;
        }
        if ( tabs?.length > 0 ) {
            setSelectedTab( selectedTab === '' ? tabs[ 0 ].id : selectedTab );
        }
    }, [ tabs, loading, selectedTab ] );

    useEffect( () => {
        if ( loading ) {
            return;
        }

        if ( ! pages?.length && ! tabs?.length ) {
            setElements( allSettings );
        } else if ( pages?.length && ! tabs?.length && '' !== selectedPage ) {
            setElements(
                pages.find( ( child ) => child.id === selectedPage ).children
            );
        } else if ( ! pages?.length && tabs?.length && '' !== selectedTab ) {
            setElements(
                tabs.find( ( child ) => child.id === selectedTab ).children
            );
        } else if (
            pages?.length &&
            tabs?.length &&
            '' !== selectedPage &&
            '' !== selectedTab
        ) {
            setElements(
                tabs.find( ( child ) => child.id === selectedTab ).children
            );
        }
    }, [ allSettings, pages, selectedPage, tabs, selectedTab, loading ] );

    const onMenuClick = ( page: string ) => {
        if ( ! page ) {
            return;
        }

        setSelectedPage( page );
    };

    const onTabClick = ( tab: string ) => {
        if ( ! tab ) {
            return;
        }

        setSelectedTab( tab );
    };

    return (
        <div className="h-full">
            <main className="max-w-7xl mx-auto pb-10 lg:py-5 lg:px-0">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
                    { pages && '' !== selectedPage && pages.length > 0 && (
                        <Menu
                            key="admin-status-menu"
                            pages={ pages }
                            loading={ loading }
                            activePage={ selectedPage }
                            onMenuClick={ onMenuClick }
                        />
                    ) }

                    <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
                        { tabs && '' !== selectedTab && (
                            <Tab
                                key="admin-status-tab"
                                tabs={ tabs }
                                loading={ loading }
                                selectedTab={ selectedTab }
                                onTabClick={ onTabClick }
                            />
                        ) }

                        { elements.map( ( element: StatusElement ) => {
                            return (
                                <SettingsParser
                                    key={
                                        element.hook_key + 'admin-status-parser'
                                    }
                                    element={ element }
                                />
                            );
                        } ) }
                    </div>
                </div>
            </main>
        </div>
    );
};
export default Status;
