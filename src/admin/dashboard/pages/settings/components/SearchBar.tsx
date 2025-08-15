import * as LucideIcons from 'lucide-react';
import { useState, useEffect, useCallback } from "@wordpress/element";
import { useDispatch } from "@wordpress/data";
import { debounce } from "@wordpress/compose";
import settingsStore from "../../../../../stores/adminSettings";
import { twMerge } from "tailwind-merge";
import { __ } from "@wordpress/i18n";

const SearchBar = (
    { className = '' } :
    { className?: string }
) => {
    const dispatch = useDispatch();
    const [ searchText, setSearchText ] = useState( '' );

    // Create a debounced dispatch function with 300ms delay
    const debouncedSetSearchText = useCallback(
        debounce( ( value ) => {
            dispatch( settingsStore ).setSearchText( value );
        }, 700 ),
        [ dispatch ]
    );

    const handleInputChange = ( event ) => {
        const value = event.target.value;
        setSearchText( value );
        debouncedSetSearchText( value );
    };

    const handleClearSearch = () => {
        setSearchText('');
        // For clear action, use debounced dispatch for consistency
        debouncedSetSearchText( '' );
    };

    const handleKeyDown = ( event ) => {
        if ( event.key === 'Escape' ) {
            handleClearSearch();
        }
    };

    return (
        <div className={ twMerge( 'mb-6', className ) }>
            <div className="relative">
                <div className="bg-white border border-[#e9e9e9] rounded-[5px] lg:h-9 h-fit flex items-center px-3 gap-3">
                    <LucideIcons.Search className="lg:!w-[18px] lg:!h-[18px] w-5 h-5 text-[#828282]" />
                    <input
                        type="text"
                        placeholder={ __( 'Search', 'dokan-lite' ) }
                        value={ searchText }
                        onChange={ handleInputChange }
                        onKeyDown={ handleKeyDown }
                        className="flex-1 lg:!text-[12px] text-base text-[#25252D] bg-transparent border-none outline-none font-normal p-0 focus:ring-0 placeholder:text-[#a5a5aa]"
                    />
                    { searchText && (
                        <button
                            onClick={ handleClearSearch }
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title={ __( 'Clear search', 'dokan-lite' ) }
                        >
                            <LucideIcons.X className="w-4 h-4 text-[#828282] hover:text-[#25252D]" />
                        </button>
                    ) }
                </div>
            </div>
        </div>
    );
};

export default SearchBar;
