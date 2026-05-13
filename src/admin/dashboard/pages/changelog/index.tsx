import SearchBar from './SearchBar';
import { __ } from '@wordpress/i18n';
import VersionRow from './VersionRow';
import apiFetch from '@wordpress/api-fetch';
import PackageToggle from './PackageToggle';
import { useState, useEffect, useCallback, useRef } from '@wordpress/element';

// Loading Spinner
const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
);

// Main Changelog Page Component
const ChangelogPage = () => {
    const [ activePackage, setActivePackage ] = useState< 'lite' | 'pro' >(
        'lite'
    );
    const [ liteVersions, setLiteVersions ] = useState< Version[] | null >(
        null
    );
    const [ proVersions, setProVersions ] = useState< Version[] | null >(
        null
    );
    const [ loading, setLoading ] = useState( false );
    const [ expandedVersions, setExpandedVersions ] = useState< string[] >(
        []
    );
    const [ highlightedVersion, setHighlightedVersion ] = useState<
        string | null
    >( null );
    const versionRefs = useRef< { [ key: string ]: HTMLDivElement | null } >(
        {}
    );

    // Check if Pro is available
    const hasPro =
        dokanAdminDashboardSettings?.header_info?.is_pro_exists || false;

    const dismissWhatsNewNotice = useCallback(
        async ( pkg: 'lite' | 'pro' ) => {
            const action =
                pkg === 'pro'
                    ? 'dokan-pro-whats-new-notice'
                    : 'dokan-whats-new-notice';

            try {
                await apiFetch( {
                    url: ajaxurl,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams( {
                        action,
                        nonce: dokanAdminDashboard?.nonce || '',
                        dokan_promotion_dismissed: 'true',
                    } ),
                } );
            } catch ( error ) {
                // eslint-disable-next-line no-console
                console.error( 'Request failed:', error );
            }
        },
        []
    );

    // Fetch changelog data
    const fetchChangelog = useCallback(
        async ( pkg: 'lite' | 'pro' ) => {
            // Check if already loaded
            if ( pkg === 'lite' && liteVersions !== null ) {
                return;
            }
            if ( pkg === 'pro' && proVersions !== null ) {
                return;
            }
            if ( dokanAdminDashboardSettings?.header_info?.has_new_version ) {
                dismissWhatsNewNotice( pkg );
            }
            setLoading( true );
            try {
                const response = await apiFetch< string >( {
                    path: `/dokan/v1/admin/changelog/${ pkg }`,
                } );

                const data =
                    typeof response === 'string'
                        ? JSON.parse( response )
                        : response;

                if ( pkg === 'lite' ) {
                    setLiteVersions( data );
                } else {
                    setProVersions( data );
                }
            } catch ( error ) {
                // eslint-disable-next-line no-console
                console.error( 'Failed to fetch changelog:', error );
            } finally {
                setLoading( false );
            }
        },

        [ liteVersions, proVersions, dismissWhatsNewNotice ]
    );

    // Load initial data
    useEffect( () => {
        fetchChangelog( activePackage );
    }, [ activePackage, fetchChangelog ] );

    // Handle package toggle
    const handlePackageToggle = ( pkg: 'lite' | 'pro' ) => {
        setActivePackage( pkg );
        setExpandedVersions( [] );
        setHighlightedVersion( null );
    };

    // Handle version expand/collapse
    const toggleVersion = ( versionId: string ) => {
        setExpandedVersions( ( prev ) =>
            prev.includes( versionId )
                ? prev.filter( ( id ) => id !== versionId )
                : [ ...prev, versionId ]
        );
    };

    // Handle jump to version with highlight
    const handleJumpToVersion = ( index: number ) => {
        const versions = activePackage === 'lite' ? liteVersions : proVersions;
        if ( ! versions ) {
            return;
        }

        const version = versions[ index ];
        const versionKey = `${ activePackage }-${ version.version }`;
        const element = versionRefs.current[ versionKey ];

        // Set highlight
        setHighlightedVersion( versionKey );

        // Scroll to element
        if ( element ) {
            element.scrollIntoView( { behavior: 'smooth', block: 'start' } );
        }
    };

    // Get current versions based on active package
    const currentVersions =
        activePackage === 'lite' ? liteVersions : proVersions;

    // Render content based on loading state
    const renderContent = () => {
        if ( loading ) {
            return <LoadingSpinner />;
        }

        if ( currentVersions && currentVersions.length > 0 ) {
            return (
                <div>
                    { currentVersions.map( ( version, index ) => {
                        const versionKey = `${ activePackage }-${ version.version }`;
                        return (
                            <div
                                key={ versionKey }
                                ref={ ( el ) => {
                                    versionRefs.current[ versionKey ] = el;
                                } }
                            >
                                <VersionRow
                                    version={ version }
                                    isLatest={ index === 0 }
                                    isExpanded={ expandedVersions.includes(
                                        versionKey
                                    ) }
                                    isHighlighted={
                                        highlightedVersion === versionKey
                                    }
                                    onToggle={ () => {
                                        toggleVersion( versionKey );
                                    } }
                                />
                            </div>
                        );
                    } ) }
                </div>
            );
        }

        return (
            <div className="text-center py-12 text-gray-500">
                { __( 'No changelog data available.', 'dokan-lite' ) }
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto mt-10">
            { /* Header */ }
            <div className="flex items-start justify-between mb-14">
                { /* Left Side - Title and Jump to Version */ }
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        { __( 'Dokan Changelog', 'dokan-lite' ) }
                    </h1>
                    <SearchBar
                        versions={ currentVersions || [] }
                        onVersionSelect={ handleJumpToVersion }
                    />
                </div>

                { /* Right Side - Package Toggle */ }
                <PackageToggle
                    hasPro={ hasPro }
                    activePackage={ activePackage }
                    onToggle={ handlePackageToggle }
                />

                { highlightedVersion && (
                    <div
                        className="fixed inset-0 z-10"
                        onClick={ () => setHighlightedVersion( null ) }
                    />
                ) }
            </div>

            { /* Content */ }
            { renderContent() }
        </div>
    );
};

export default ChangelogPage;
