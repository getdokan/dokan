// Search Component with Dropdown
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Search, X } from 'lucide-react';

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

const SearchBar = ({
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
                className="flex items-center gap-1 text-sm text-[#575757] hover:text-gray-900"
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
                    <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                                className="w-full pl-10 pr-10 py-2 rounded-[3px] border border-[#7047EB] bg-white text-sm focus:outline-none focus:border-[#7047EB]"
                            />
                            { searchQuery && (
                                <button
                                    onClick={ () => setSearchQuery( '' ) }
                                    className="absolute right-3 top-[calc(50%-8px)] text-gray-400 hover:text-gray-600"
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
                                        className={ `w-full text-left px-4 py-2 text-sm hover:bg-[#EFEAFF] focus:outline-none ${
                                            isMatch
                                                ? 'text-[#828282] hover:text-[#7047EB]'
                                                : 'text-[#828282] hover:text-[#7047EB]'
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

export default SearchBar;
