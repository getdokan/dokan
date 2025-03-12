import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import Menu from './Elements/Menu';
import Tab from './Elements/Tab';
import SettingsParser from './Elements/SettingsParser';
import { Step } from './index';
import RadioButton from './Elements/Fields/RadioButton';
import SwitchElement from './Elements/Fields/SwitchElement';
import NextButton from './components/NextButton';
import BackButton from './components/BackButton';
import { Button } from "@getdokan/dokan-ui";

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

const StepSettings = ( { step }: { step: Step } ) => {
    const [ allSettings, setAllSettings ] = useState< SettingsElement[] >( [] );
    const [ loading, setLoading ] = useState< boolean >( true );
    const [ isSaving, setIsSaving ] = useState< boolean >( false );

    const [ pages, setPages ] = useState< SettingsElement[] >( [] );
    const [ selectedPage, setSelectedPage ] = useState< string >( '' );

    const [ tabs, setTabs ] = useState< SettingsElement[] >( [] );
    const [ selectedTab, setSelectedTab ] = useState< string >( '' );
    const [ elements, setElements ] = useState< SettingsElement[] >( [] );

    useEffect( () => {
        if ( ! step ) {
            return;
        }

        setLoading( true );

        apiFetch< SettingsElement[] >( {
            path: '/dokan/v1/admin/setup-guide/' + step.id,
        } )
            .then( ( data ) => {
                setAllSettings( data );
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
    }, [ tabs, loading ] );

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
    };

    return (
        <>
            <div className="h-full px-24 py-12 min-h-[500px]">
                <main className="max-w-7xl mx-auto h-full">
                    <div className="w-full">
                        <RadioButton
                            title=" Contact Form on Store Page"
                            description="Display a contact form on vendor store pages for customer inquiries"
                        />
                        <SwitchElement
                            title={ 'PayPal' }
                            description={
                                'Enable PayPal for your vendor as a withdraw method'
                            }
                            defaultEnabled={ true }
                            onChange={ ( value ) => console.log( value ) }
                        />
                    </div>
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
                                    />
                                );
                            } ) }
                        </div>
                    </div>

                    <div className="sticky flex gap-7 sm:w-auto w-full justify-end flex-wrap top-full pr-0">
                        <BackButton
                            // onBack={ onBack }
                            className={ `mr-auto` }
                            onBack={ () => {} }
                        />
                        <Button
                            // onClick={ handleSkip }
                            onClick={ () => {} }
                            className="text-[#393939] text-base font-medium py-2 px-4 border-0 shadow-none"
                        >
                            { __( 'Skip', 'dokan-lite' ) }
                        </Button>
                        <NextButton disabled={ isSaving } handleNext={ saveSettings } className={ `m-0` }>
                            { isSaving ? __( 'Saving...', 'dokan-lite' ) : __( 'Next', 'dokan-lite' ) }
                        </NextButton>
                    </div>
                </main>
            </div>
        </>
    );
};

export default StepSettings;
