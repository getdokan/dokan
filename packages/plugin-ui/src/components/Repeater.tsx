import { useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { RepeaterItem, RepeaterProps } from '../types';

/**
 * Default item renderer
 */
const DefaultItemRenderer = ( {
    item,
    onUpdate,
    onDelete,
    isEditing,
    setIsEditing,
    disabled,
}: {
    item: RepeaterItem;
    onUpdate: ( item: RepeaterItem ) => void;
    onDelete: () => void;
    isEditing: boolean;
    setIsEditing: ( editing: boolean ) => void;
    disabled?: boolean;
} ) => {
    const [ editValue, setEditValue ] = useState( item.title );

    const handleSave = () => {
        if ( editValue.trim() ) {
            onUpdate( { ...item, title: editValue.trim() } );
            setIsEditing( false );
        }
    };

    const handleCancel = () => {
        setEditValue( item.title );
        setIsEditing( false );
    };

    return (
        <div className="flex items-center justify-between gap-3 p-3 bg-white border border-gray-200 rounded-md">
            { isEditing ? (
                <div className="flex-1 flex items-center gap-2">
                    <input
                        type="text"
                        value={ editValue }
                        onChange={ ( e ) => setEditValue( e.target.value ) }
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={ handleSave }
                        disabled={ ! editValue.trim() }
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={ handleCancel }
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3 flex-1">
                        <span className="cursor-grab text-gray-400 drag-handle">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M4 8h16M4 16h16" />
                            </svg>
                        </span>
                        <span className="text-sm text-gray-900">{ item.title }</span>
                        { item.required && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                { __( 'Required', 'wedevs-plugin-ui' ) }
                            </span>
                        ) }
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={ () => setIsEditing( true ) }
                            disabled={ disabled }
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-50"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                        { ! item.required && (
                            <button
                                type="button"
                                onClick={ onDelete }
                                disabled={ disabled }
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded disabled:opacity-50"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        ) }
                    </div>
                </>
            ) }
        </div>
    );
};

/**
 * Repeater Component
 *
 * A repeatable field list with drag-and-drop support.
 */
const Repeater = ( {
    items = [],
    onChange,
    addButtonText,
    sortable = true,
    renderItem,
    maxItems,
    minItems = 0,
}: RepeaterProps ) => {
    const [ editingId, setEditingId ] = useState< string | null >( null );

    const handleAdd = useCallback( () => {
        if ( maxItems && items.length >= maxItems ) return;

        const newItem: RepeaterItem = {
            id: `item_${ Date.now() }_${ Math.random().toString( 36 ).substr( 2, 9 ) }`,
            order: items.length,
            title: '',
        };

        onChange( [ ...items, newItem ] );
        setEditingId( newItem.id );
    }, [ items, onChange, maxItems ] );

    const handleUpdate = useCallback(
        ( id: string, updatedItem: RepeaterItem ) => {
            const newItems = items.map( ( item ) =>
                item.id === id ? updatedItem : item
            );
            onChange( newItems );
        },
        [ items, onChange ]
    );

    const handleDelete = useCallback(
        ( id: string ) => {
            const requiredCount = items.filter( ( i ) => i.required ).length;
            const deletableCount = items.length - requiredCount;

            if ( deletableCount <= minItems ) return;

            const newItems = items
                .filter( ( item ) => item.id !== id )
                .map( ( item, index ) => ( { ...item, order: index } ) );
            onChange( newItems );
        },
        [ items, onChange, minItems ]
    );

    const handleMoveUp = useCallback(
        ( index: number ) => {
            if ( index === 0 ) return;
            const newItems = [ ...items ];
            [ newItems[ index - 1 ], newItems[ index ] ] = [
                newItems[ index ],
                newItems[ index - 1 ],
            ];
            onChange(
                newItems.map( ( item, i ) => ( { ...item, order: i } ) )
            );
        },
        [ items, onChange ]
    );

    const handleMoveDown = useCallback(
        ( index: number ) => {
            if ( index === items.length - 1 ) return;
            const newItems = [ ...items ];
            [ newItems[ index ], newItems[ index + 1 ] ] = [
                newItems[ index + 1 ],
                newItems[ index ],
            ];
            onChange(
                newItems.map( ( item, i ) => ( { ...item, order: i } ) )
            );
        },
        [ items, onChange ]
    );

    const sortedItems = [ ...items ].sort( ( a, b ) => a.order - b.order );
    const canAdd = ! maxItems || items.length < maxItems;

    return (
        <div className="plugin-ui-repeater space-y-3">
            { sortedItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md border border-dashed border-gray-300">
                    <p>{ __( 'No items added yet.', 'wedevs-plugin-ui' ) }</p>
                </div>
            ) : (
                <div className="space-y-2">
                    { sortedItems.map( ( item, index ) => (
                        <div key={ item.id } className="flex items-center gap-2">
                            { sortable && (
                                <div className="flex flex-col">
                                    <button
                                        type="button"
                                        onClick={ () => handleMoveUp( index ) }
                                        disabled={ index === 0 }
                                        className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M5 15l7-7 7 7" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={ () => handleMoveDown( index ) }
                                        disabled={ index === sortedItems.length - 1 }
                                        className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                            ) }
                            <div className="flex-1">
                                { renderItem ? (
                                    renderItem( item )
                                ) : (
                                    <DefaultItemRenderer
                                        item={ item }
                                        onUpdate={ ( updatedItem ) =>
                                            handleUpdate( item.id, updatedItem )
                                        }
                                        onDelete={ () => handleDelete( item.id ) }
                                        isEditing={ editingId === item.id }
                                        setIsEditing={ ( editing ) =>
                                            setEditingId( editing ? item.id : null )
                                        }
                                    />
                                ) }
                            </div>
                        </div>
                    ) ) }
                </div>
            ) }

            { canAdd && (
                <button
                    type="button"
                    onClick={ handleAdd }
                    className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={ 2 } d="M12 4v16m8-8H4" />
                    </svg>
                    { addButtonText || __( 'Add Item', 'wedevs-plugin-ui' ) }
                </button>
            ) }
        </div>
    );
};

export default Repeater;

