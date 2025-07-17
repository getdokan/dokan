import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { SaveIcon } from 'lucide-react';
import settingsStore from '@dokan/stores/adminSettings';
import { SettingsElement } from '../../../../stores/adminSettings/types';
import Menu from './Elements/Menu';
import Tab from './Elements/Tab';
import SettingsParser from './Elements/SettingsParser';

const SettingsPage = () => {
    const dispatch = useDispatch();
    const allSettings: Array< SettingsElement > = useSelect(
        ( select ) => select( settingsStore ).getSettings(),
        []
    );
    const loading: boolean = useSelect(
        ( select ) => select( settingsStore ).getLoading(),
        []
    );
    const [ isSaving, setIsSaving ] = useState< boolean >( false );
    const needSaving: boolean = useSelect(
        ( select ) => select( settingsStore ).getNeedSaving(),
        []
    );

    const [ parentPages, setParentPages ] = useState< SettingsElement[] >( [] );
    const [ pages, setPages ] = useState< SettingsElement[] >( [] );
    const [ selectedPage, setSelectedPage ] = useState< string >( '' );

    const [ tabs, setTabs ] = useState< SettingsElement[] >( [] );
    const [ selectedTab, setSelectedTab ] = useState< string >( '' );
    const [ elements, setElements ] = useState< SettingsElement[] >( [] );

    useEffect( () => {
        if ( ! loading ) {
            const maybeParentPages: SettingsElement[] = allSettings?.filter(
                ( child ) => child.type === 'page'
            );

            // Get all the subpages from the parent pages children array.
            const maybePages: SettingsElement[] = maybeParentPages
                .map( ( child ) => child.children )
                .flat()
                .filter( ( child ) => child.type === 'subpage' );

            setParentPages( maybeParentPages );
            setPages( maybePages );
        }
    }, [ allSettings, loading ] );

    useEffect( () => {
        if ( ! loading && pages.length > 0 ) {
            setSelectedPage(
                selectedPage === '' ? pages[ 0 ].id : selectedPage
            );
        }
    }, [ pages, loading ] );

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
                pages.find( ( child ) => child.id === selectedPage )
                    ?.children ?? []
            );
        } else if ( ! pages?.length && tabs?.length && '' !== selectedTab ) {
            setElements(
                tabs.find( ( child ) => child.id === selectedTab )?.children ??
                    []
            );
        } else if (
            pages?.length &&
            tabs?.length &&
            '' !== selectedPage &&
            '' !== selectedTab
        ) {
            setElements(
                tabs.find( ( child ) => child.id === selectedTab )?.children ??
                    []
            );
        }
    }, [
        allSettings,
        parentPages,
        pages,
        selectedPage,
        tabs,
        selectedTab,
        loading,
    ] );

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

    const saveSettings = () => {
        setIsSaving( true );
        dispatch( settingsStore )
            .saveSettings( allSettings )
            .then( () => {
                setIsSaving( false );
                // TODO: Say updated.
            } )
            .catch( ( err ) => {
                setIsSaving( false );
                // TODO: Say Error.
            } );
    };

    const onValueChange = ( element: SettingsElement ) => {
        dispatch( settingsStore ).updateSettingsValue( element );
    };
    return (
        <>
            <h3 className="text-3xl font-bold">
                { __( 'Settings', 'dokan-lite' ) }
            </h3>

            <div className="h-screen ">
                <main className="w-full pb-10 lg:py-5 lg:px-0 bg-white h-screen  shadow rounded-lg">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-x-5 divide-x h-screen ">
                        { pages && '' !== selectedPage && pages.length > 0 && (
                            <Menu
                                key="admin-settings-menu"
                                pages={ parentPages }
                                loading={ loading }
                                activePage={ selectedPage }
                                onMenuClick={ onMenuClick }
                            />
                        ) }

                        <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
                            { tabs && '' !== selectedTab && (
                                <Tab
                                    key="admin-settings-tab"
                                    tabs={ tabs }
                                    loading={ loading }
                                    selectedTab={ selectedTab }
                                    onTabClick={ onTabClick }
                                />
                            ) }

                            { elements.map( ( element: SettingsElement ) => {
                                return (
                                    <SettingsParser
                                        key={
                                            element.hook_key +
                                            '-settings-parser'
                                        }
                                        element={ element }
                                        onValueChange={ onValueChange }
                                    />
                                );
                            } ) }
                        </div>
                    </div>
                    { needSaving && (
                        <div className="sticky flex justify-end bottom-0 mt-5 p-5 pr-0">
                            <button
                                type="button"
                                disabled={ isSaving }
                                onClick={ saveSettings }
                                className="inline-flex shadow shadow-lg shadow-gray-800/30 items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                <SaveIcon
                                    className="-ml-1 mr-3 h-5 w-5"
                                    aria-hidden="true"
                                />
                                { isSaving
                                    ? __( 'Saving..', 'dokan-driver' )
                                    : __( 'Save', 'dokan-driver' ) }
                            </button>
                        </div>
                    ) }
                </main>
            </div>
        </>
    );
};

export default SettingsPage;
