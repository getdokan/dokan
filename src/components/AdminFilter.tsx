import { __ } from '@wordpress/i18n';
import { twMerge } from 'tailwind-merge';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { snakeCase, kebabCase } from '../utilities';
import { DokanButton } from '@src/components';

import { Plus, X } from 'lucide-react';
import { useEffect, useState } from '@wordpress/element';
import { Popover } from '@wordpress/components';

export interface Field {
    field: React.ReactNode;
    label: string;
    id: string;
}

export interface AdminFilterProps {
    /** Namespace for the filter, used to generate unique IDs */
    namespace: string;
    /** Array of filter field configs */
    fields: Field[];
    /** Callback function to handle filter action */
    onFilterRemove?: ( filterId: string ) => void;
    /** Callback function to handle reset action */
    onReset?: () => void;
    /** Open the filter selection popover on initial render or when toggled true */
    openOnMount?: boolean;
    /** External trigger to open the filter selection list popover; change the value to open */
    openSelectorSignal?: number;
    /** Notify parent when the first filter is added */
    onFirstFilterAdded?: () => void;
    /** Notify parent when active filter count changes */
    onActiveFiltersChange?: ( count: number ) => void;
    buttonPopOverAnchor?: HTMLElement | null;
    /** Additional class names for the filter container */
    className?: string;
    /** Additional class names for the filter button */
}

const AdminFilter = ( {
    namespace = '',
    fields,
    onReset = () => {},
    onFilterRemove = () => {},
    className = '',
    openOnMount = false,
    openSelectorSignal = 0,
    onFirstFilterAdded = () => {},
    onActiveFiltersChange = () => {},
    buttonPopOverAnchor = null,
}: AdminFilterProps ) => {
    const snakeCaseNamespace = snakeCase( namespace );
    const filterId = `dokan_admin_${ snakeCaseNamespace }_filters`;

    // @ts-ignore
    const filteredFields: Field[] = wp.hooks.applyFilters( filterId, fields );

    // Track active filter IDs only
    const [ activeFilters, setActiveFilters ] = useState< string[] >( [] );
    const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );

    // Auto-open the filter selection popover when requested
    useEffect( () => {
        if ( openOnMount ) {
            setIsPopoverOpen( true );
        }
    }, [ openOnMount ] );
    // Open the selection list when an external signal is emitted
    useEffect( () => {
        if ( openSelectorSignal !== 0 ) {
            setIsPopoverOpen( true );
        }
    }, [ openSelectorSignal ] );
    const [ popoverAnchor, setPopoverAnchor ] = useState( buttonPopOverAnchor );
    const [ addButtonAnchor, setAddButtonAnchor ] =
        useState< HTMLElement | null >( null );
    // Keep the popover anchored to the external trigger (funnel button) when provided
    useEffect( () => {
        setPopoverAnchor( buttonPopOverAnchor );
    }, [ buttonPopOverAnchor ] );

    // When there are no active filters (initial load or after reset), anchor the popover to the funnel button
    useEffect( () => {
        if ( activeFilters.length === 0 ) {
            setPopoverAnchor( buttonPopOverAnchor );
        }
    }, [ activeFilters.length, buttonPopOverAnchor ] );

    // When filters exist, anchor the popover to the Add Filter button wrapper
    useEffect( () => {
        if ( activeFilters.length > 0 && addButtonAnchor ) {
            setPopoverAnchor( addButtonAnchor );
        }
    }, [ activeFilters.length, addButtonAnchor ] );

    // Notify parent about active filter count changes
    useEffect( () => {
        onActiveFiltersChange?.( activeFilters.length );
    }, [ activeFilters.length ] );

    // Compute available filters (not already active)
    const availableFilters = filteredFields.filter(
        ( f ) => ! activeFilters.includes( f.id )
    );

    const handleAddFilter = ( id: string ) => {
        setActiveFilters( ( prev ) => {
            if ( prev.includes( id ) ) {
                return prev;
            }
            if ( prev.length === 0 ) {
                onFirstFilterAdded?.();
            }
            return [ ...prev, id ];
        } );

        setIsPopoverOpen( false );
    };

    const handleReset = () => {
        setActiveFilters( [] );
        onReset();
    };

    const handleRemoveFilter = ( id: string ) => {
        setActiveFilters( ( prev ) => prev.filter( ( f ) => f !== id ) );
        onFilterRemove?.( id );
    };

    return (
        <>
            <div
                className={ twMerge(
                    'flex w-full justify-between items-center',
                    className
                ) }
                id={ kebabCase( filterId ) }
                data-filter-id={ filterId }
            >
                <div className="flex flex-row flex-wrap gap-4 items-center">
                    { activeFilters.map( ( id ) => {
                        const field = filteredFields.find(
                            ( f ) => f.id === id
                        );
                        if ( ! field ) {
                            return null;
                        }
                        return (
                            <div
                                className="dokan-dashboard-filter-item relative inline-block"
                                key={ id }
                            >
                                <div className="relative inline-block">
                                    { field.field }
                                    <button
                                        type="button"
                                        aria-label={ __(
                                            'Remove filter',
                                            'dokan-lite'
                                        ) }
                                        className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#828282] hover:text-[#7047EB] z-10"
                                        onClick={ () =>
                                            handleRemoveFilter( id )
                                        }
                                    >
                                        <X size="14" />
                                    </button>
                                </div>
                            </div>
                        );
                    } ) }
                    { availableFilters.length > 0 && (
                        <span ref={ setAddButtonAnchor }>
                            <DokanButton
                                className="flex gap-2 items-center justify-center dokan-btn-tertiary"
                                onClick={ () =>
                                    setIsPopoverOpen(
                                        ( currentState ) => ! currentState
                                    )
                                }
                            >
                                <Plus size="16" />
                                { __( 'Add Filter', 'dokan-lite' ) }
                            </DokanButton>
                        </span>
                    ) }
                </div>

                {
                    <DokanButton
                        className="flex dokan-btn-tertiary"
                        onClick={ handleReset }
                    >
                        { __( 'Reset', 'dokan-lite' ) }
                    </DokanButton>
                }
            </div>
            { isPopoverOpen && (
                <Popover
                    anchor={ popoverAnchor }
                    offset={ 15 }
                    position="bottom right"
                    className={ `dokan-layout` }
                    onClose={ () => setIsPopoverOpen( false ) }
                >
                    <div className="py-1 min-w-40 bg-white border-[#E9E9E9] rounded-md">
                        { availableFilters.map( ( f ) => (
                            <button
                                key={ f.id }
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#828282] hover:bg-[#EFEAFF] hover:text-[#7047EB] transition-all duration-200 border-none bg-transparent group"
                                onClick={ () => handleAddFilter( f.id ) }
                            >
                                { f.label }
                            </button>
                        ) ) }
                    </div>
                </Popover>
            ) }
        </>
    );
};

export default AdminFilter;
