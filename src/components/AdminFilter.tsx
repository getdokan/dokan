import { __ } from '@wordpress/i18n';
import { twMerge } from 'tailwind-merge';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { snakeCase, kebabCase } from '../utilities';
import { DokanButton } from '@src/components';

import { Plus } from 'lucide-react';
import { useState } from '@wordpress/element';
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
    /** Additional class names for the filter container */
    className?: string;
    /** Additional class names for the filter button */
}

const AdminFilter = ( {
    namespace = '',
    fields,
    onReset = () => {},
    onFilterRemove = ( filterId: string ) => {},
    className = '',
}: AdminFilterProps ) => {
    const snakeCaseNamespace = snakeCase( namespace );
    const filterId = `dokan_admin_${ snakeCaseNamespace }_filters`;

    // @ts-ignore
    const filteredFields: Field[] = wp.hooks.applyFilters( filterId, fields );

    // Track active filter IDs only
    const [ activeFilters, setActiveFilters ] = useState< string[] >( [] );
    const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );
    const [ popoverAnchor, setPopoverAnchor ] = useState();

    // Compute available filters (not already active)
    const availableFilters = filteredFields.filter(
        ( f ) => ! activeFilters.includes( f.id )
    );

    const handleAddFilter = ( id: string ) => {
        setActiveFilters( ( prev ) =>
            prev.includes( id ) ? prev : [ ...prev, id ]
        );

        setIsPopoverOpen( false );
    };

    const handleReset = () => {
        setActiveFilters( [] );
        onReset();
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
                    { filteredFields.map( ( field: Field, index ) => {
                        const isActive = activeFilters.includes( field.id );
                        if ( ! isActive ) {
                            return null;
                        }
                        return (
                            <div
                                className="dokan-dashboard-filter-item"
                                key={ field.id }
                            >
                                { field.field }
                            </div>
                        );
                    } ) }
                    { availableFilters.length > 0 && (
                        <DokanButton
                            className="flex gap-2 items-center justify-center dokan-btn-tertiary"
                            onClick={ () =>
                                setIsPopoverOpen(
                                    ( currentState ) => ! currentState
                                )
                            }
                        >
                            <Plus size="16" ref={ setPopoverAnchor } />
                            { __( 'Add Filter', 'dokan-lite' ) }
                        </DokanButton>
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
