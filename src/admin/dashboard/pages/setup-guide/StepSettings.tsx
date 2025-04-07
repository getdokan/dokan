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
    getSetting: ( id: string ) => SettingsElement | undefined;
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
    handleStepsChange: ( steps: Step[] ) => void;
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

    // Step specific skeleton states
    const [ stepSkeletonStates, setStepSkeletonStates ] = useState<
        Record< string, boolean >
    >( {} );

    // Error handling states
    const [ error, setError ] = useState< {
        message: string;
        code?: string;
    } | null >( null );
    const [ showError, setShowError ] = useState< boolean >( false );

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
        try {
            const extractedDependencies = settingsDependencyParser( settings );
            const modifiedSettings = settingsDependencyApplicator(
                [ ...settings ],
                extractedDependencies
            );

            setDependencies( [ ...extractedDependencies ] );
            setAllSettings( [ ...modifiedSettings ] );
        } catch ( err ) {
            console.error( 'Error processing settings:', err );
            handleError( err );
        }
    };

    /**
     * Handle and display errors properly
     *
     * @param {any} err Error object
     */
    const handleError = ( err: any ) => {
        const errorMessage = err?.message || 'Something went wrong';
        const errorCode = err?.code || 'unknown_error';

        setError( { message: errorMessage, code: errorCode } );
        setShowError( true );

        // Auto-hide error after 5 seconds
        setTimeout( () => {
            setShowError( false );
        }, 5000 );
    };

    /**
     * Dismiss the error message
     */
    const dismissError = () => {
        setShowError( false );
    };

    /**
     * Update settings value and apply dependencies.
     *
     * @since DOKAN_SINCE
     *
     * @param {SettingsElement} element Element to update.
     */
    const updateSettingsValue = ( element: SettingsElement ) => {
        try {
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
        } catch ( err ) {
            console.error( 'Error updating settings value:', err );
            handleError( err );
        }
    };

    /**
     * Fetch settings data from the API for the current step.
     */
    const fetchStepData = async () => {
        if ( ! currentStep?.id ) {
            return;
        }

        try {
            // Start loading with skeleton specific to this step
            setLoading( true );
            setStepSkeletonStates( ( prevState ) => ( {
                ...prevState,
                [ currentStep.id ]: true,
            } ) );
            setShowSkeleton( true );

            // Scroll to top smoothly when changing steps
            if ( contentRef.current ) {
                window.scrollTo( {
                    top: contentRef.current.offsetTop - 20,
                    behavior: 'smooth',
                } );
            }

            // Fetch data with timeout handling
            const timeoutPromise = new Promise( ( _, reject ) =>
                setTimeout(
                    () => reject( new Error( 'Request timed out' ) ),
                    30000
                )
            );

            const fetchPromise = apiFetch< SettingsElement[] >( {
                path: '/dokan/v1/admin/setup-guide/' + currentStep.id,
            } );

            // Use Promise.race to implement timeout
            const data = ( await Promise.race( [
                fetchPromise,
                timeoutPromise,
            ] ) ) as SettingsElement[];

            // Process data
            setSettings( data );
            setError( null );

            // Hide skeleton when data is ready
            setStepSkeletonStates( ( prevState ) => ( {
                ...prevState,
                [ currentStep.id ]: false,
            } ) );
            setShowSkeleton( false );
            setLoading( false );
        } catch ( err ) {
            console.error( 'Error fetching step data:', err );
            handleError( err );

            // Hide skeleton on error too
            setStepSkeletonStates( ( prevState ) => ( {
                ...prevState,
                [ currentStep.id ]: false,
            } ) );
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
                    ?.children?.filter( ( child ) => child.type === 'tab' ) ||
                    []
            );
        } else {
            setTabs(
                allSettings?.filter( ( child ) => child.type === 'tab' ) || []
            );
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

        try {
            if ( ! pages?.length && ! tabs?.length ) {
                setElements( allSettings || [] );
            } else if (
                pages?.length &&
                ! tabs?.length &&
                '' !== selectedPage
            ) {
                const page = pages.find(
                    ( child ) => child.id === selectedPage
                );
                setElements( page?.children || [] );
            } else if (
                ! pages?.length &&
                tabs?.length &&
                '' !== selectedTab
            ) {
                const tab = tabs.find( ( child ) => child.id === selectedTab );
                setElements( tab?.children || [] );
            } else if (
                pages?.length &&
                tabs?.length &&
                '' !== selectedPage &&
                '' !== selectedTab
            ) {
                const tab = tabs.find( ( child ) => child.id === selectedTab );
                setElements( tab?.children || [] );
            }
        } catch ( err ) {
            console.error( 'Error setting elements:', err );
            setElements( [] );
        }
    }, [ allSettings, pages, selectedPage, tabs, selectedTab, loading ] );

    useEffect( () => {
        // Set initial step when component mounts
        if ( ! prevStepId && steps.length > 0 ) {
            const initialStep = steps.find( ( step ) => ! step.is_completed );
            if ( initialStep ) {
                setCurrentStep( initialStep );
            }
        }
    }, [ steps ] );

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
     * Get a setting by ID.
     *
     * @since DOKAN_SINCE
     *
     * @param {string} id Setting ID.
     */
    const getSetting = ( id: string ) => {
        return getSettingInChildren( id, allSettings );
    };

    /**
     * Recursively search for a setting in the settings array.
     *
     * @since DOKAN_SINCE
     *
     * @param {string}            id       Setting ID.
     * @param {SettingsElement[]} settings Settings array.
     */
    const getSettingInChildren = (
        id: string,
        settings: SettingsElement[]
    ): SettingsElement | undefined => {
        for ( const setting of settings ) {
            if ( setting.hook_key === id ) {
                return setting;
            }
            if ( setting.children ) {
                const found = getSettingInChildren( id, setting.children );
                if ( found ) {
                    return found;
                }
            }
        }
        return undefined;
    }

    /**
     * Retry loading the current step data.
     */
    const retryLoading = () => {
        fetchStepData();
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
            setError( null );
            handleNext();
        } catch ( err ) {
            handleError( err );
            setIsSaving( false );
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

        const updatedSteps = steps.map( ( step ) => {
            if ( step?.id === currentStep?.id ) {
                return { ...step, is_completed: true };
            }
            return step;
        } );

        updateStep( updatedSteps );
        if ( nextStep ) {
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
        if ( previousStep ) {
            setCurrentStep( previousStep );
        }
    };

    // Check if skeleton should be shown for current step
    const shouldShowSkeleton = () => {
        return currentStep?.id
            ? stepSkeletonStates[ currentStep.id ]
            : showSkeleton;
    };

    return (
        <>
            <div
                className="h-full @4xl/main:px-28 @4xl/main:py-16 p-6"
                ref={ contentRef }
            >
                <main className="max-w-7xl mx-auto h-full relative transition-all duration-500 ease">
                    { /* Show skeleton loader while loading */ }
                    { shouldShowSkeleton() ? (
                        <div className="transition-all duration-300">
                            <SkeletonLoader
                                showTabs={ tabs && tabs.length > 0 }
                                showMenu={ pages && pages.length > 0 }
                            />
                        </div>
                    ) : error && elements.length === 0 ? (
                        /* Error state with retry option */
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="text-red-500 text-xl mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-12 w-12 mx-auto mb-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={ 2 }
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <p className="text-center">
                                    Failed to load settings
                                </p>
                            </div>
                            <p className="text-gray-600 mb-6 text-center">
                                { error.message ||
                                    'There was a problem loading the step data.' }
                            </p>
                            <Button
                                color="primary"
                                onClick={ retryLoading }
                                className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-2"
                            >
                                Retry Loading
                            </Button>
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

                            <div className="lg:col-span-12">
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
                                                getSetting={ getSetting }
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
                        {
                            // Show skip button only if the current step is skippable
                            currentStep?.skippable && (
                                <Button
                                    onClick={ handleSkip }
                                    className="text-[#393939] text-base font-medium py-2 px-4 border-0 shadow-none focus:ring-0"
                                >
                                    { __( 'Skip', 'dokan-lite' ) }
                                </Button>
                            )
                        }
                        <NextButton
                            disabled={
                                isSaving ||
                                loading ||
                                ( showError && error && elements.length === 0 )
                            }
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
