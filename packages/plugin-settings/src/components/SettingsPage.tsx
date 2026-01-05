import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState, useCallback } from '@wordpress/element';
import { applyFilters, doAction } from '@wordpress/hooks';
import type { SettingsElement, SettingsPageConfig } from '../types';
import Menu from './Menu';
import Tab from './Tab';
import SettingsParser from './SettingsParser';
import PageHeading from './PageHeading';

/**
 * Settings Page Component
 *
 * Main component for rendering the settings page with menu, tabs, and content.
 */
const SettingsPage = ( {
    storeName,
    textDomain = 'plugin-settings',
    legacySettingsUrl,
    filterPrefix = 'plugin_settings',
    showLegacyLink = false,
}: SettingsPageConfig ) => {
    const dispatch = useDispatch();

    // Select data from store
    const allSettings: SettingsElement[] = useSelect(
        ( select ) => select( storeName ).getSettings(),
        [ storeName ]
    );

    const loading: boolean = useSelect(
        ( select ) => select( storeName ).getLoading(),
        [ storeName ]
    );

    const saving: boolean = useSelect(
        ( select ) => select( storeName ).getSaving(),
        [ storeName ]
    );

    const needSaving: boolean = useSelect(
        ( select ) => select( storeName ).getNeedSaving(),
        [ storeName ]
    );

    // Local state
    const [ parentPages, setParentPages ] = useState< SettingsElement[] >( [] );
    const [ pages, setPages ] = useState< SettingsElement[] >( [] );
    const [ selectedPage, setSelectedPage ] = useState< string >( '' );
    const [ tabs, setTabs ] = useState< SettingsElement[] >( [] );
    const [ selectedTab, setSelectedTab ] = useState< string >( '' );
    const [ elements, setElements ] = useState< SettingsElement[] >( [] );

    // Parse pages from settings
    useEffect( () => {
        if ( ! loading && allSettings?.length > 0 ) {
            const maybeParentPages = allSettings.filter(
                ( child ) => child.type === 'page'
            );

            const maybePages = maybeParentPages
                .flatMap( ( child ) => child.children || [] )
                .filter( ( child ) => child.type === 'subpage' );

            setParentPages( maybeParentPages );
            setPages( maybePages );
        }
    }, [ allSettings, loading ] );

    // Set initial selected page
    useEffect( () => {
        if ( ! loading && pages.length > 0 && ! selectedPage ) {
            const storedTab = typeof localStorage !== 'undefined'
                ? localStorage.getItem( `${ filterPrefix }_active_settings_tab` )
                : '';
            const storedPageName = storedTab ? storedTab.split( '.' )[ 1 ] : '';

            const initialPage = applyFilters(
                `${ filterPrefix }_active_page_id`,
                storedPageName || pages[ 0 ].id
            ) as string;

            setSelectedPage( initialPage );
        }
    }, [ pages, loading, selectedPage, filterPrefix ] );

    // Parse tabs from selected page
    useEffect( () => {
        if ( loading ) return;

        if ( pages.length > 0 ) {
            const currentPage = pages.find( ( p ) => p.id === selectedPage );
            const pageTabs = currentPage?.children?.filter( ( c ) => c.type === 'tab' ) || [];
            setTabs( pageTabs );
        } else {
            const allTabs = allSettings.filter( ( c ) => c.type === 'tab' );
            setTabs( allTabs );
        }
    }, [ allSettings, pages, selectedPage, loading ] );

    // Set initial selected tab
    useEffect( () => {
        if ( loading ) return;

        if ( tabs.length > 0 && ! selectedTab ) {
            setSelectedTab( tabs[ 0 ].id );
        }
    }, [ tabs, loading, selectedTab ] );

    // Parse elements to render
    useEffect( () => {
        if ( loading ) return;

        if ( ! pages.length && ! tabs.length ) {
            setElements( allSettings );
        } else if ( pages.length && ! tabs.length && selectedPage ) {
            const currentPage = pages.find( ( p ) => p.id === selectedPage );
            setElements( currentPage?.children || [] );
        } else if ( ! pages.length && tabs.length && selectedTab ) {
            const currentTab = tabs.find( ( t ) => t.id === selectedTab );
            setElements( currentTab?.children || [] );
        } else if ( pages.length && tabs.length && selectedPage && selectedTab ) {
            const currentTab = tabs.find( ( t ) => t.id === selectedTab );
            setElements( currentTab?.children || [] );
        }
    }, [ allSettings, pages, selectedPage, tabs, selectedTab, loading ] );

    // Handlers
    const handleMenuClick = useCallback( ( page: string ) => {
        if ( page ) {
            setSelectedPage( page );
            setSelectedTab( '' ); // Reset tab when page changes
        }
    }, [] );

    const handleTabClick = useCallback( ( tab: string ) => {
        if ( tab ) {
            setSelectedTab( tab );
        }
    }, [] );

    const handleValueChange = useCallback( ( element: SettingsElement ) => {
        dispatch( storeName ).updateSettingsValue( element );
    }, [ dispatch, storeName ] );

    const handleSave = useCallback( async () => {
        doAction( `${ filterPrefix }_before_save`, allSettings );

        try {
            await dispatch( storeName ).saveSettings( allSettings );
            doAction( `${ filterPrefix }_after_save`, allSettings );
        } catch ( error ) {
            console.error( 'Failed to save settings:', error );
        }
    }, [ dispatch, storeName, allSettings, filterPrefix ] );

    // Get current page/tab info for heading
    const getCurrentPageInfo = () => {
        let currentPage: SettingsElement | undefined;
        let currentTab: SettingsElement | undefined;

        if ( selectedPage && pages.length > 0 ) {
            currentPage = pages.find( ( p ) => p.id === selectedPage );
        }

        if ( ! currentPage?.display ) {
            return {};
        }

        if ( selectedTab && tabs.length > 0 ) {
            currentTab = tabs.find( ( t ) => t.id === selectedTab );
        }

        if ( currentTab ) {
            return {
                title: currentTab.title || __( 'Settings', textDomain ),
                description: currentTab.description || '',
            };
        }

        if ( currentPage ) {
            return {
                title: currentPage.title || __( 'Settings', textDomain ),
                description: currentPage.description || '',
                documentationLink: currentPage.doc_link || '',
            };
        }

        return {
            title: __( 'Settings', textDomain ),
            description: __( 'Configure your settings', textDomain ),
        };
    };

    const pageInfo = getCurrentPageInfo();
    const allElementsAreFields = elements.every( ( el ) => el.type === 'field' );

    // Loading state
    if ( loading ) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen h-full">
            <h2 className="text-2xl text-gray-900 font-bold my-6 lg:mb-8 lg:mt-10">
                { __( 'Settings', textDomain ) }
            </h2>

            <main className="w-full lg:px-0 lg:bg-white h-full lg:shadow rounded-lg overflow-hidden">
                <div className="lg:grid lg:grid-cols-12 lg:divide-x h-full">
                    { pages.length > 0 && selectedPage && (
                        <Menu
                            pages={ parentPages }
                            loading={ loading }
                            activePage={ selectedPage }
                            onMenuClick={ handleMenuClick }
                        />
                    ) }

                    <div className="space-y-6 lg:p-7 lg:py-12 lg:col-span-9 pt-10">
                        { tabs.length > 0 && selectedTab && (
                            <Tab
                                tabs={ tabs }
                                loading={ loading }
                                selectedTab={ selectedTab }
                                onTabClick={ handleTabClick }
                            />
                        ) }

                        { pageInfo.title && (
                            <PageHeading
                                title={ pageInfo.title }
                                description={ pageInfo.description }
                                documentationLink={ pageInfo.documentationLink }
                            />
                        ) }

                        <div
                            className={ `flex flex-col bg-white rounded-lg ${
                                allElementsAreFields && ( pageInfo.title || pageInfo.description )
                                    ? 'divide-gray-200 divide-y border border-gray-200 rounded'
                                    : 'gap-6'
                            }` }
                        >
                            { elements.map( ( element ) => (
                                <SettingsParser
                                    key={ element.hook_key || element.id }
                                    element={ element }
                                    onValueChange={ handleValueChange }
                                />
                            ) ) }
                        </div>

                        { needSaving && (
                            <div className="sticky flex justify-end bottom-0 mt-8 py-5">
                                <button
                                    type="button"
                                    disabled={ saving }
                                    onClick={ handleSave }
                                    className="inline-flex shadow-lg shadow-gray-800/30 items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                >
                                    { saving
                                        ? __( 'Saving...', textDomain )
                                        : __( 'Save', textDomain )
                                    }
                                </button>
                            </div>
                        ) }
                    </div>
                </div>
            </main>

            { showLegacyLink && legacySettingsUrl && (
                <div className="text-sm font-medium pt-8 mt-8">
                    <div className="flex items-center gap-2 text-gray-600">
                        { __( 'Want to use the old settings panel?', textDomain ) }{ ' ' }
                        <a
                            className="underline font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                            href={ legacySettingsUrl }
                        >
                            { __( 'Click Here', textDomain ) }
                        </a>
                    </div>
                </div>
            ) }
        </div>
    );
};

export default SettingsPage;

