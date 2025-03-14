import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import Menu from './Elements/Menu';
import Tab from './Elements/Tab';
import SettingsParser from './Elements/SettingsParser';
import { Step } from './index';
import settingsDependencyParser from '../../utils/settingsDependencyParser';
import settingsDependencyApplicator from '../../utils/settingsDependencyApplicator';
import settingsElementFinderReplacer from '../../utils/settingsElementFinderReplacer';

export type SettingsElementDependency = {
    key?: string;
    value?: any;
    currentValue?: any;
    to_self?: boolean;
    self?: string;
    attribute?: string;
    effect?: string;
    comparison?: string;
};

export type SettingsElement = {
    id: string;
    type: string;
    variant?: string;
    icon?: string;
    title?: string;
    description?: string;
    value?: string | Array< string | number | number[] >;
    default?: string;
    options?: [];
    readonly?: boolean;
    disabled?: boolean;
    placeholder?: string | number;
    display?: boolean;
    min?: number;
    max?: number;
    increment?: number;
    hook_key?: string;
    dependency_key?: string;
    children?: Array< SettingsElement >;
    dependencies?: Array< SettingsElementDependency >;
};

export interface SettingsProps {
    element: SettingsElement;
    onValueChange: ( element: SettingsElement ) => void;
}

const StepSettings = ( { step }: { step: Step } ) => {
    const [ allSettings, setAllSettings ] = useState< SettingsElement[] >( [] );
    const [ dependencies, setDependencies ] = useState<
        SettingsElementDependency[]
    >( [] );
    const [ loading, setLoading ] = useState< boolean >( true );
    const [ isSaving, setIsSaving ] = useState< boolean >( false );
    const [ needSaving, setNeedSaving ] = useState< boolean >( false );

    const [ pages, setPages ] = useState< SettingsElement[] >( [] );
    const [ selectedPage, setSelectedPage ] = useState< string >( '' );

    const [ tabs, setTabs ] = useState< SettingsElement[] >( [] );
    const [ selectedTab, setSelectedTab ] = useState< string >( '' );
    const [ elements, setElements ] = useState< SettingsElement[] >( [] );

    /**
     * Set settings and dependencies to the state after fetching from the API.
     *
     * @since DOKAN_SINCE
     *
     * @param {SettingsElement[]} settings Settings array.
     */
    const setSettings = ( settings: SettingsElement[] ) => {
        const extractedDependencies = settingsDependencyParser( settings );
        const modifiedSettings = settingsDependencyApplicator(
            [ ...settings ],
            extractedDependencies
        );

        setDependencies( [ ...extractedDependencies ] );
        setAllSettings( [ ...modifiedSettings ] );
    };

    /**
     * Update settings value and apply dependencies.
     *
     * @since DOKAN_SINCE
     *
     * @param {SettingsElement} element Element to update.
     */
    const updateSettingsValue = ( element: SettingsElement ) => {
        const updatedSettings = settingsElementFinderReplacer(
            [ ...allSettings ],
            element
        );
        const updatedDependencies = settingsDependencyParser( [
            ...updatedSettings,
        ] );

        const modifiedSettings = settingsDependencyApplicator(
            [ ...updatedSettings ],
            updatedDependencies
        );

        setDependencies( [ ...updatedDependencies ] );
        setAllSettings( [ ...modifiedSettings ] );
        setNeedSaving( true );
    };

    useEffect( () => {
        if ( ! step ) {
            return;
        }

        setLoading( true );

        apiFetch< SettingsElement[] >( {
            path: '/dokan/v1/admin/setup-guide/' + step.id,
        } )
            .then( ( data ) => {
                setSettings( data );
                setLoading( false );
            } )
            .catch( ( err ) => {
                console.error( err );
            } );
    }, [ step ] );

    useEffect( () => {
        if ( ! loading ) {
            setPages(
                allSettings?.filter( ( child ) => child.type === 'page' )
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

    const saveSettings = () => {
        setIsSaving( true );
        apiFetch< SettingsElement[] >( {
            path: '/dokan/v1/admin/setup-guide/' + step.id,
            method: 'POST',
            data: allSettings,
        } )
            .then( ( response ) => {
                setSettings( response );
                setIsSaving( false );
                setNeedSaving( false );

                // TODO: go to next step if available
            } )
            .catch( ( err ) => {
                console.error( err );
                setIsSaving( false );
                // TODO: show error message in the UI
            } );
    };

    return (
        <>
            <div className="h-full">
                <main className="max-w-7xl mx-auto pb-10 lg:py-5 lg:px-0">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
                        { pages && '' !== selectedPage && pages.length > 0 && (
                            <Menu
                                key="admin-settings-menu"
                                pages={ pages }
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
                                        onValueChange={ updateSettingsValue }
                                    />
                                );
                            } ) }
                        </div>
                    </div>

                    <div className="sticky flex justify-end bottom-0 mt-5 p-5 pr-0">
                        <button
                            type="button"
                            disabled={ isSaving }
                            onClick={ saveSettings }
                            className="inline-flex shadow shadow-gray-800/30 items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            { isSaving
                                ? __( 'Saving..', 'dokan-driver' )
                                : __( 'Next', 'dokan-driver' ) }
                        </button>
                    </div>
                </main>
            </div>
        </>
    );
};

export default StepSettings;
