import { __, sprintf } from '@wordpress/i18n';
import { useState, useEffect, useCallback, useRef } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Search, X, Crown } from 'lucide-react';

// Types
interface ChangeItem {
    title: string;
    description: string;
}

interface VersionChanges {
    [ key: string ]: ChangeItem[];
}

interface Version {
    version: string;
    released: string;
    changes: VersionChanges;
}

// Badge component for change types
const ChangeBadge = ( { type }: { type: string } ) => {
    const getBadgeStyles = () => {
        switch ( type ) {
            case 'New':
            case 'New Module':
            case 'New Feature':
                return 'bg-teal-500 text-white';
            case 'Fix':
                return 'bg-red-500 text-white';
            case 'Improvement':
            case 'Improvements':
            case 'Update':
                return 'bg-purple-500 text-white';
            default:
                return 'bg-blue-500 text-white';
        }
    };

    return (
        <span
            className={ `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${ getBadgeStyles() }` }
        >
            { type }
        </span>
    );
};

// Search Component with Dropdown
const SearchBar = ( {
    versions,
    onVersionSelect,
}: {
    versions: Version[];
    onVersionSelect: ( index: number ) => void;
} ) => {
    const [ isOpen, setIsOpen ] = useState( false );
    const [ searchQuery, setSearchQuery ] = useState( '' );
    const searchRef = useRef< HTMLDivElement >( null );

    useEffect( () => {
        const handleClickOutside = ( event: MouseEvent ) => {
            if (
                searchRef.current &&
                ! searchRef.current.contains( event.target as Node )
            ) {
                setIsOpen( false );
            }
        };

        document.addEventListener( 'mousedown', handleClickOutside );
        return () =>
            document.removeEventListener( 'mousedown', handleClickOutside );
    }, [] );

    // Filter versions based on search query or show latest 5
    const getDisplayVersions = () => {
        if ( searchQuery.length > 0 ) {
            return versions.filter( ( version ) =>
                version.version
                    .toLowerCase()
                    .includes( searchQuery.toLowerCase() )
            );
        }
        // Show latest 5 versions when no search query
        return versions.slice( 0, 5 );
    };

    const displayVersions = getDisplayVersions();

    return (
        <div className="relative" ref={ searchRef }>
            { /* Jump to version trigger button */ }
            <button
                onClick={ () => setIsOpen( ! isOpen ) }
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
                { __( 'Jump to version', 'dokan-lite' ) }
                <svg
                    className={ `w-4 h-4 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    }` }
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={ 2 }
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            { /* Dropdown */ }
            { isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    { /* Search Input */ }
                    <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={ searchQuery }
                                onChange={ ( e ) =>
                                    setSearchQuery( e.target.value )
                                }
                                placeholder={ __(
                                    'Search version…',
                                    'dokan-lite'
                                ) }
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoFocus
                            />
                            { searchQuery && (
                                <button
                                    onClick={ () => setSearchQuery( '' ) }
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            ) }
                        </div>
                    </div>

                    { /* Version List */ }
                    <div className="max-h-64 overflow-y-auto py-1">
                        { displayVersions.length > 0 ? (
                            displayVersions.map( ( version ) => {
                                const originalIndex = versions.findIndex(
                                    ( v ) => v.version === version.version
                                );
                                const isMatch =
                                    searchQuery.length > 0 &&
                                    version.version
                                        .toLowerCase()
                                        .includes( searchQuery.toLowerCase() );
                                return (
                                    <button
                                        key={ version.version }
                                        onClick={ () => {
                                            onVersionSelect( originalIndex );
                                            setIsOpen( false );
                                            setSearchQuery( '' );
                                        } }
                                        className={ `w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:outline-none ${
                                            isMatch
                                                ? 'text-purple-600'
                                                : 'text-gray-700'
                                        }` }
                                    >
                                        { version.version }
                                        { originalIndex === 0 && (
                                            <span className="ml-2 text-xs text-gray-500">
                                                (
                                                { __( 'Latest', 'dokan-lite' ) }
                                                )
                                            </span>
                                        ) }
                                    </button>
                                );
                            } )
                        ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">
                                { __( 'No versions found', 'dokan-lite' ) }
                            </div>
                        ) }
                    </div>
                </div>
            ) }
        </div>
    );
};

// Package Toggle (Lite/Pro)
const PackageToggle = ( {
    activePackage,
    hasPro,
    onToggle,
}: {
    activePackage: 'lite' | 'pro';
    hasPro: boolean;
    onToggle: ( pkg: 'lite' | 'pro' ) => void;
} ) => {
    if ( ! hasPro ) {
        return null;
    }

    return (
        <div className="inline-flex rounded-full bg-white p-1">
            <button
                onClick={ () => onToggle( 'lite' ) }
                className={ `px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    activePackage === 'lite'
                        ? 'bg-[#7047EB] text-white'
                        : 'text-gray-600 hover:text-gray-900'
                }` }
            >
                { __( 'Lite', 'dokan-lite' ) }
            </button>
            <button
                onClick={ () => onToggle( 'pro' ) }
                className={ `px-4 py-1.5 text-sm font-medium rounded-full transition-colors flex items-center gap-1 ${
                    activePackage === 'pro'
                        ? 'bg-[#7047EB] text-white'
                        : 'text-gray-600 hover:text-gray-900'
                }` }
            >
                { __( 'Pro', 'dokan-lite' ) }
                <Crown className="w-3 h-3" />
            </button>
        </div>
    );
};

// Loading Spinner
const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
);

// Version Row Component with sticky behavior
const VersionRow = ( {
    version,
    isLatest,
    isExpanded,
    isHighlighted,
    onToggle,
}: {
    version: Version;
    isLatest: boolean;
    isExpanded: boolean;
    isHighlighted: boolean;
    onToggle: () => void;
} ) => {
    const formatDate = ( dateString: string ) => {
        const date = new Date( dateString );
        return date.toLocaleDateString( 'en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        } );
    };

    const changeTypes = Object.keys( version.changes );

    // Calculate total items across all change types
    const totalItems = changeTypes.reduce(
        ( sum, type ) => sum + version.changes[ type ].length,
        0
    );

    // Show toggle only when total items > 5 (not for latest)
    const shouldShowToggle = ! isLatest && totalItems > 5;

    // For non-latest versions, show limited content when collapsed
    const getVisibleChanges = () => {
        if ( isLatest || isExpanded || totalItems <= 5 ) {
            return version.changes;
        }

        // Show only first 5 items total when collapsed
        const limitedChanges: VersionChanges = {};
        let itemCount = 0;
        const maxItems = 5;

        for ( const type of changeTypes ) {
            if ( itemCount >= maxItems ) {
                break;
            }

            const items = version.changes[ type ];
            const remainingSlots = maxItems - itemCount;
            const itemsToShow = items.slice( 0, remainingSlots );

            if ( itemsToShow.length > 0 ) {
                limitedChanges[ type ] = itemsToShow;
                itemCount += itemsToShow.length;
            }
        }

        return limitedChanges;
    };

    const visibleChanges = getVisibleChanges();
    const visibleChangeEntries = Object.entries( visibleChanges );

    return (
        <div className="flex gap-8 mb-8">
            { /* Left Column - Version Info (Sticky) */ }
            <div className="w-48 flex-shrink-0">
                <div className="sticky top-4">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                            { version.version }
                        </h3>
                        { isLatest && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                { __( 'Latest', 'dokan-lite' ) }
                                <Crown className="w-3 h-3 ml-1" />
                            </span>
                        ) }
                    </div>
                    <p className="text-sm text-gray-500">
                        { formatDate( version.released ) }
                    </p>
                </div>
            </div>

            { /* Right Column - Changes Card */ }
            <div className="flex-1">
                <div
                    className={ `bg-gray-50 rounded-lg p-6 transition-all duration-300 ${
                        isHighlighted
                            ? 'ring-2 ring-blue-500 ring-offset-2'
                            : 'border border-gray-200'
                    }` }
                >
                    { visibleChangeEntries.map(
                        ( [ type, items ], typeIndex ) => (
                            <div key={ type }>
                                { /* Add border/divider before each section except the first */ }
                                { typeIndex > 0 && (
                                    <hr className="my-6 border-t border-gray-200" />
                                ) }
                                <ChangeBadge type={ type } />
                                <ul className="mt-3 space-y-2">
                                    { items.map( ( item, itemIndex ) => (
                                        <li
                                            key={ itemIndex }
                                            className="flex items-start text-sm text-gray-700"
                                        >
                                            <span className="mr-2 text-gray-400">
                                                •
                                            </span>
                                            <span>{ item.title }</span>
                                        </li>
                                    ) ) }
                                </ul>
                            </div>
                        )
                    ) }

                    { /* See Details / See Less Toggle */ }
                    { shouldShowToggle && (
                        <button
                            onClick={ onToggle }
                            className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none underline"
                        >
                            { isExpanded
                                ? __( 'See Less', 'dokan-lite' )
                                : __( 'See Details', 'dokan-lite' ) }
                        </button>
                    ) }
                </div>
            </div>
        </div>
    );
};

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
        [ liteVersions, proVersions ]
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

        // Remove highlight after 2 seconds
        setTimeout( () => {
            setHighlightedVersion( null );
        }, 2000 );
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
        <div className="max-w-6xl mx-auto">
            { /* Header */ }
            <div className="flex items-start justify-between mb-8">
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
            </div>

            { /* Content */ }
            { renderContent() }
        </div>
    );
};

export default ChangelogPage;
