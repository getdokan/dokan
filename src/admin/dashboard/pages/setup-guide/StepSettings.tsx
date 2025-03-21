import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import Menu from './Elements/Menu';
import Tab from './Elements/Tab';
import SettingsParser from './Elements/SettingsParser';
import { Step } from './index';
import settingsDependencyParser from '../../utils/settingsDependencyParser';
import settingsDependencyApplicator from '../../utils/settingsDependencyApplicator';
import settingsElementFinderReplacer from '../../utils/settingsElementFinderReplacer';
import NextButton from './components/NextButton';
import BackButton from './components/BackButton';
import { Button } from '@getdokan/dokan-ui';
import SkeletonLoader from './components/SkeletonLoader';

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
    value?: string | number | Array< string | number | number[] >;
    default?: string;
    options?: Array< { title: string; value: string | number } >;
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
    prefix?: string;
    suffix?: string;
    enable_state?: {
        label: string;
        value: string | number;
    };
    disable_state?: {
        label: string;
        value: string | number;
    };
};

export interface SettingsProps {
    element: SettingsElement;
    onValueChange: ( element: SettingsElement ) => void;
}

const StepSettings = ( {
    steps,
    updateStep,
    currentStep,
    setCurrentStep,
}: {
    steps: Step[];
    updateStep: ( steps: Step[] ) => void;
    currentStep: Step;
    setCurrentStep: ( step: Step ) => void;
} ) => {
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

    const [ prevStepId, setPrevStepId ] = useState< string | null >( null );
    const [ showSkeleton, setShowSkeleton ] = useState< boolean >( true );

    // Ref for the content container to scroll to top
    const contentRef = useRef< HTMLDivElement >( null );

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

    /**
     * Fetch settings data from the API for the current step.
     */
    const fetchStepData = async () => {
        if ( ! currentStep?.id ) {
            return;
        }

        try {
            // Start loading with skeleton
            setLoading( true );
            setShowSkeleton( true );

            // Scroll to top smoothly when changing steps
            if ( contentRef.current ) {
                window.scrollTo( {
                    top: contentRef.current.offsetTop - 20,
                    behavior: 'smooth',
                } );
            }

            // Fetch data
            const data = await apiFetch< SettingsElement[] >( {
                path: '/dokan/v1/admin/setup-guide/' + currentStep.id,
            } );

            // Process data
            setSettings( data );

            // Hide skeleton when data is ready
            setShowSkeleton( false );
            setLoading( false );
        } catch ( err ) {
            console.error( err );
            setShowSkeleton( false );
            setLoading( false );
        }
    };

    // Load data when currentStep changes
    useEffect( () => {
        fetchStepData();
    }, [ currentStep ] );

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

    useEffect( () => {
        // Set initial step when component mounts
        if ( ! prevStepId ) {
            setCurrentStep( steps.find( ( step ) => ! step.is_completed ) );
        }
    }, [] );

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

    /**
     * Save settings and handle next step navigation.
     */
    const saveSettingsAndHandleNext = async () => {
        setIsSaving( true );

        try {
            const response = await apiFetch< SettingsElement[] >( {
                path: '/dokan/v1/admin/setup-guide/' + currentStep.id,
                method: 'POST',
                data: allSettings,
            } );

            setSettings( response );
            setNeedSaving( false );
            setIsSaving( false );
            handleNext();
        } catch ( err ) {
            console.error( err );
            setIsSaving( false );
            // TODO: show error message in the UI
        }
    };

    const handleNext = () => {
        setPrevStepId( currentStep?.id || null );
        setShowSkeleton( true );

        let nextStep = steps.find(
            ( step ) => step.id === currentStep?.next_step
        );
        if ( ! nextStep ) {
            nextStep = steps.find( ( step ) => ! step?.is_completed );
        }

        if ( nextStep ) {
            const updatedSteps = steps.map( ( step ) => {
                if ( step?.id === currentStep?.id ) {
                    return { ...step, is_completed: true };
                }
                return step;
            } );

            updateStep( updatedSteps );
            setCurrentStep( nextStep );
        }
    };

    const handleSkip = () => {
        setPrevStepId( currentStep?.id || null );
        setShowSkeleton( true );

        let nextStep = steps.find(
            ( step ) => step?.id === currentStep?.next_step
        );
        if ( ! nextStep ) {
            nextStep = steps.find( ( step ) => ! step?.is_completed );
        }

        if ( nextStep ) {
            setCurrentStep( nextStep );
        }
    };

    const handleBack = () => {
        setPrevStepId( currentStep?.id || null );
        setShowSkeleton( true );

        const previousStep = steps.find(
            ( step ) => step?.id === currentStep?.previous_step
        );
        setCurrentStep( previousStep );
    };

    return (
        <>
            <div
                className="h-full @4xl/main:px-28 @4xl/main:py-16 p-6"
                ref={ contentRef }
            >
                <main className="max-w-7xl mx-auto h-full relative transition-all duration-500 ease">
                    { /* Show skeleton loader while loading */ }
                    { showSkeleton ? (
                        <div className="transition-all duration-300">
                            <SkeletonLoader
                                showTabs={ tabs && tabs.length > 0 }
                                showMenu={ pages && pages.length > 0 }
                            />
                        </div>
                    ) : (
                        /* Main content */
                        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5 transition-all duration-300">
                            { pages &&
                                '' !== selectedPage &&
                                pages.length > 0 && (
                                    <Menu
                                        key="admin-settings-menu"
                                        pages={ pages }
                                        loading={ loading }
                                        activePage={ selectedPage }
                                        onMenuClick={ onMenuClick }
                                    />
                                ) }

                            <div className=" lg:col-span-12">
                                { tabs && '' !== selectedTab && (
                                    <Tab
                                        key="admin-settings-tab"
                                        tabs={ tabs }
                                        loading={ loading }
                                        selectedTab={ selectedTab }
                                        onTabClick={ onTabClick }
                                    />
                                ) }

                                { elements.map(
                                    ( element: SettingsElement ) => {
                                        return (
                                            <SettingsParser
                                                key={
                                                    element.hook_key +
                                                    '-settings-parser'
                                                }
                                                element={ element }
                                                onValueChange={
                                                    updateSettingsValue
                                                }
                                            />
                                        );
                                    }
                                ) }
                            </div>
                        </div>
                    ) }

                    { /* Navigation buttons always visible */ }
                    <div className="sticky flex gap-7 sm:w-auto w-full justify-end flex-wrap top-full pr-0 mt-6">
                        { currentStep?.previous_step && (
                            <BackButton
                                onBack={ handleBack }
                                className={ `mr-auto focus:ring-0` }
                            />
                        ) }
                        <Button
                            onClick={ handleSkip }
                            className="text-[#393939] text-base font-medium py-2 px-4 border-0 shadow-none focus:ring-0"
                        >
                            { __( 'Skip', 'dokan-lite' ) }
                        </Button>
                        <NextButton
                            disabled={ isSaving || loading }
                            handleNext={ saveSettingsAndHandleNext }
                            className={ `m-0` }
                        >
                            { isSaving
                                ? __( 'Saving…', 'dokan-lite' )
                                : __( 'Next', 'dokan-lite' ) }
                        </NextButton>
                    </div>
                </main>
            </div>
        </>
    );
};

export default StepSettings;
