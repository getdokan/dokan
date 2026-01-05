/**
 * Dokan Admin Settings Page
 *
 * Uses the @wedevs/plugin-settings package for settings framework.
 */
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState, useMemo } from '@wordpress/element';
import { SaveIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

// Import from plugin-settings package
import {
    Menu,
    Tab,
    PageHeading,
    SettingsParser,
    Section,
    SubSection,
    FieldGroup,
    registerField,
} from '@wedevs/plugin-settings';

// Import store and types
import settingsStore from '@dokan/stores/adminSettings';
import type { SettingsElement } from '@wedevs/plugin-settings';

// Import Dokan-specific field components (only truly custom ones)
import CategoryBasedCommission from './Elements/Fields/Commission/CategoryBasedCommission';
import CombineInput from './Elements/Fields/Commission/CombineInput';
import CustomizeRadio from './Elements/Fields/CustomizeRadio';
import DokanColorPicker from './Elements/Fields/DokanColorPicker';
import DokanCopyButtonField from './Elements/Fields/DokanCopyButtonField';
import DokanCurrency from './Elements/Fields/DokanCurrency';
import DokanDoubleInput from './Elements/Fields/DokanDoubleInput';
import DokanFileUploadField from './Elements/Fields/DokanFileUpload';
import DokanRadioCapsule from './Elements/Fields/DokanRadioCapsule';
import DokanRefreshSelectField from './Elements/Fields/DokanRefreshSelectField';
import DokanSingleProductPreview from './Elements/Fields/DokanSingleProductPreview';
import DokanShowHideField from './Elements/Fields/DokanShowHideField';
import DokanVendorInfoPreview from './Elements/Fields/DokanVendorInfoPreview';
import DokanRichText from './Elements/Fields/DokanRichText';
import DokanRepeater from './Elements/Fields/DokanRepeater';
import WithdrawSchedule from './Elements/Fields/WithdrawSchedule';

// Register only Dokan-specific field types
// Generic fields (text, select, switch, etc.) use package defaults
const registerDokanFields = () => {
    // Advanced Dokan-specific fields
    registerField( 'rich_text', DokanRichText );
    registerField( 'radio_capsule', DokanRadioCapsule );
    registerField( 'customize_radio', CustomizeRadio );
    registerField( 'currency', DokanCurrency );
    registerField( 'double_input', DokanDoubleInput );
    registerField( 'repeater', DokanRepeater );

    // Commission fields
    registerField( 'category_based_commission', CategoryBasedCommission );
    registerField( 'combine_input', CombineInput );

    // Special Dokan fields
    registerField( 'refresh_select', DokanRefreshSelectField );
    registerField( 'vendor_info_preview', DokanVendorInfoPreview );
    registerField( 'single_product_preview', DokanSingleProductPreview );
    registerField( 'show_hide', DokanShowHideField );
    registerField( 'select_color_picker', DokanColorPicker );
    registerField( 'copy_field', DokanCopyButtonField );
    registerField( 'file_upload', DokanFileUploadField );
    registerField( 'withdraw_schedule', WithdrawSchedule );
};

// Register fields once
registerDokanFields();

const DashboardSwitchLink = () => {
    const switchUrl = dokanAdminDashboardSettings?.legacy_settings_url || '#';

    return (
        <div className="legacy-dashboard-url text-sm font-medium pt-8 mt-8">
            <div className="flex items-center gap-2 text-gray-600">
                { __(
                    'If you want to go back to old settings panel,',
                    'dokan-lite'
                ) }{ ' ' }
                <a
                    className="skip-color-module underline font-bold text-[#7047EB] hover:text-[#502BBF] transition-colors"
                    href={ switchUrl }
                >
                    { __( 'Click Here', 'dokan-lite' ) }
                </a>
            </div>
        </div>
    );
};

/**
 * Custom SettingsParser that uses Dokan's registered field components
 * @param root0
 * @param root0.element
 * @param root0.onValueChange
 */
const DokanSettingsParser = ( {
    element,
    onValueChange,
}: {
    element: SettingsElement;
    onValueChange: ( element: SettingsElement ) => void;
} ) => {
    return (
        <SettingsParser
            element={ element }
            onValueChange={ onValueChange }
            components={ {
                Section,
                SubSection,
                FieldGroup,
            } }
            filterPrefix="dokan_admin_settings"
        />
    );
};

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
            const selectedSettings =
                    typeof localStorage !== 'undefined'
                        ? localStorage.getItem( 'dokan_active_settings_tab' )
                        : '',
                selectedPageName = selectedSettings
                    ? selectedSettings.split( '.' )[ 1 ]
                    : selectedPage;

            setSelectedPage(
                // @ts-ignore
                wp.hooks.applyFilters(
                    'dokan_admin_settings_active_page_id',
                    selectedPageName ? selectedPageName : pages[ 0 ].id
                )
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

    const onValueChange = ( element: SettingsElement ) => {
        dispatch( settingsStore ).updateSettingsValue( element );
    };

    const saveSettings = () => {
        wp.hooks.doAction(
            'dokan_admin_settings_before_save_settings',
            allSettings
        );

        setIsSaving( true );
        dispatch( settingsStore )
            .saveSettings( allSettings )
            .then( () => {
                setIsSaving( false );
            } )
            .catch( () => {
                setIsSaving( false );
            } );

        wp.hooks.doAction(
            'dokan_admin_settings_after_save_settings',
            allSettings
        );
    };

    const pageInfo = useMemo( () => {
        let currentPage: SettingsElement | undefined;
        let currentTab: SettingsElement | undefined;

        if ( selectedPage && pages?.length > 0 ) {
            currentPage = pages.find( ( page ) => page.id === selectedPage );
        }

        if ( ! currentPage?.display ) {
            return {};
        }

        if ( selectedTab && tabs?.length > 0 ) {
            currentTab = tabs.find( ( tab ) => tab.id === selectedTab );
        }

        if ( currentTab ) {
            return {
                title: currentTab.title || __( 'Settings', 'dokan-lite' ),
                description: currentTab.description || '',
            };
        } else if ( currentPage ) {
            return {
                title: currentPage.title || __( 'Settings', 'dokan-lite' ),
                description: currentPage.description || '',
                documentationLink: currentPage?.doc_link || '',
            };
        }

        return {
            title: __( 'Settings', 'dokan-lite' ),
            description: __( 'Configure your store settings', 'dokan-lite' ),
        };
    }, [ selectedPage, selectedTab, pages, tabs ] );

    const allElementsAreFields = elements.every(
        ( element ) => element.type === 'field'
    );

    return (
        <>
            <div className="min-h-screen h-full">
                <h2
                    className={ `text-2xl text-[#25252D] font-bold my-6 lg:mb-8 lg:mt-10` }
                >
                    { __( 'Settings', 'dokan-lite' ) }
                </h2>
                <main className="w-full lg:px-0 lg:bg-white h-full lg:shadow rounded-lg overflow-hidden">
                    <div className="lg:grid lg:grid-cols-12 lg:divide-x h-full">
                        { pages && '' !== selectedPage && pages.length > 0 && (
                            <Menu
                                pages={ parentPages }
                                loading={ loading }
                                activePage={ selectedPage }
                                onMenuClick={ onMenuClick }
                            />
                        ) }

                        <div className="space-y-6 lg:p-7 lg:py-12 lg:col-span-9 pt-10">
                            { tabs && '' !== selectedTab && (
                                <Tab
                                    tabs={ tabs }
                                    loading={ loading }
                                    selectedTab={ selectedTab }
                                    onTabClick={ onTabClick }
                                />
                            ) }
                            { pageInfo.title && (
                                <PageHeading
                                    title={ pageInfo.title }
                                    description={ pageInfo.description }
                                    documentationLink={
                                        pageInfo.documentationLink
                                    }
                                />
                            ) }
                            <div
                                className={ `flex flex-col bg-white rounded-lg ${ twMerge(
                                    allElementsAreFields &&
                                        ( pageInfo?.title ||
                                            pageInfo?.description )
                                        ? 'divide-gray-200 divide-y border border-[#E9E9E9] rounded'
                                        : 'gap-6'
                                ) }` }
                            >
                                { elements.map(
                                    ( element: SettingsElement ) => {
                                        return (
                                            <DokanSettingsParser
                                                key={
                                                    element.hook_key +
                                                    '-settings-parser'
                                                }
                                                element={ element }
                                                onValueChange={ onValueChange }
                                            />
                                        );
                                    }
                                ) }
                            </div>

                            { needSaving && (
                                <div className="sticky flex justify-end bottom-0 !mt-8 py-5">
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
                                            ? __( 'Saving..', 'dokan-lite' )
                                            : __( 'Save', 'dokan-lite' ) }
                                    </button>
                                </div>
                            ) }
                        </div>
                    </div>
                </main>

                { dokanAdminDashboardSettings?.legacy_settings_url && (
                    <DashboardSwitchLink />
                ) }
            </div>
        </>
    );
};

export default SettingsPage;
