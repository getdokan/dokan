import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { X, Menu, Pencil, Check, Plus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { TextField, DokanSwitch } from '@dokan/components';
import SortableList from '../../../../../../components/sortable-list'
import { DokanFieldLabel } from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';
import { dispatch } from '@wordpress/data';
import { SettingsProps } from '../../types';

interface RepeaterItemData {
    id: string;
    order: number;
    title: string;
    required?: boolean;
}

interface RepeaterOptionData {
    title: string;
    order: string;
}

// Individual Repeater Item Component
const RepeaterItem = ( {
    item,
    onUpdate,
    onDelete,
    isDragging = false,
}: {
    item: RepeaterItemData;
    onUpdate: ( id: string, updatedItem: RepeaterItemData ) => void;
    onDelete: ( id: string ) => void;
    isDragging?: boolean;
} ) => {
    const [ isEditing, setIsEditing ] = useState( false );
    const [ editValue, setEditValue ] = useState( item.title );
    const [ originalValue, setOriginalValue ] = useState( item.title );

    const handleEdit = () => {
        setIsEditing( true );
        setOriginalValue( editValue );
    };

    const handleSave = () => {
        const finalValue =
            editValue.trim() === '' ? originalValue : editValue.trim();
        const updatedItem = {
            ...item,
            title: finalValue,
        };
        onUpdate( item.id, updatedItem );
        setEditValue( finalValue );
        setIsEditing( false );
    };

    const handleCancel = () => {
        setEditValue( originalValue );
        setIsEditing( false );
    };

    const handleDelete = () => {
        if ( ! item.required ) {
            onDelete( item.id );
        }
    };

    return (
        <div
            className={ twMerge(
                'repeater-item flex items-center justify-between pr-5 bg-white transition-all duration-200',
                isDragging && 'opacity-50 transform scale-95'
            ) }
        >
            { /* Left Section - Item Title / Edit Input */ }
            <div className="flex items-center flex-1 py-5">
                <div className="flex-1">
                    { isEditing ? (
                        <TextField
                            inputType="text"
                            value={ editValue }
                            containerClassName="w-fit"
                            onChange={ ( val ) => setEditValue( val ) }
                            inputClassName="bg-white border-[#E9E9E9] rounded-[5px] h-10 px-4 text-[#25252D] text-sm border-[#7047eb]"
                        />
                    ) : (
                        <span className="text-sm font-medium text-[#25252D]">
                            { item.title }
                            { item.required && (
                                <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                    { __( 'Must Have', 'dokan' ) }
                                </span>
                            ) }
                        </span>
                    ) }
                </div>
            </div>

            { /* Right Section - Actions */ }
            <div className="flex items-center gap-3 px-5">
                { /* Edit Actions */ }
                { isEditing ? (
                    <>
                        <button
                            onClick={ handleCancel }
                            className="action-icon-wrapper cancel-icon-wrapper p-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                            title={ __( 'Cancel', 'dokan' ) }
                        >
                            <X size={ 16 } color="#828282" />
                        </button>
                        <button
                            onClick={ handleSave }
                            className="action-icon-wrapper check-icon-wrapper p-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                            title={ __( 'Save', 'dokan' ) }
                        >
                            <Check size={ 16 } color="#828282" />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={ handleEdit }
                            className="action-icon-wrapper edit-icon-wrapper p-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                            title={ __( 'Edit', 'dokan' ) }
                        >
                            <Pencil size={ 16 } color="#828282" />
                        </button>
                        { ! item.required && (
                            <button
                                onClick={ handleDelete }
                                className="action-icon-wrapper delete-icon-wrapper p-1.5 border border-gray-300 rounded hover:bg-red-100 transition-colors"
                                title={ __( 'Delete', 'dokan' ) }
                            >
                                <X size={ 16 } color="#dc2626" />
                            </button>
                        ) }
                    </>
                ) }
            </div>
        </div>
    );
};

// Main DokanRepeater Component
const DokanRepeater = ( { element, onValueChange, getSetting }: SettingsProps ) => {
    const [ items, setItems ] = useState< RepeaterItemData[] >( 
        element?.value || element?.default || [] 
    );

    // Update local state when element changes
    useEffect( () => {
        if ( element?.value ) {
            setItems( element.value );
        }
    }, [ element?.value ] );

    if ( ! element.display ) {
        return null;
    }

    // Handle value changes and update store
    const handleItemsChange = ( updatedItems: RepeaterItemData[] ) => {
        setItems( updatedItems );
        
        // Use provided onValueChange callback or dispatch to store
        if ( onValueChange ) {
            onValueChange( {
                ...element,
                value: updatedItems,
            } );
        } else {
            dispatch( settingsStore ).updateSettingsValue( {
                ...element,
                value: updatedItems,
            } );
        }
    };

    // Handle individual item updates
    const handleItemUpdate = ( id: string, updatedItem: RepeaterItemData ) => {
        const newItems = items.map( item =>
            item.id === id ? updatedItem : item
        );
        handleItemsChange( newItems );
    };

    // Handle item deletion
    const handleItemDelete = ( id: string ) => {
        const newItems = items.filter( item => item.id !== id );
        handleItemsChange( newItems );
    };

    // Handle drag and drop reordering
    const handleOrderUpdate = ( updatedItems: RepeaterItemData[] ) => {
        // Update order property based on new positions
        const reorderedItems = updatedItems.map( ( item, index ) => ( {
            ...item,
            order: index,
        } ) );
        handleItemsChange( reorderedItems );
    };

    // Add new item from options
    const handleAddNew = ( optionTitle: string ) => {
        const newId = `item_${ Date.now() }_${ Math.random().toString( 36 ).substr( 2, 9 ) }`;
        const newItem: RepeaterItemData = {
            id: newId,
            order: items.length,
            title: optionTitle,
            required: false,
        };
        
        handleItemsChange( [ ...items, newItem ] );
    };

    // Render individual item for SortableList
    const renderItem = ( item: RepeaterItemData ) => {
        return (
            <div className="border-b border-gray-200 last:border-b-0 flex items-center">
                { /* Drag Handle */ }
                <div
                    className="relative flex items-center pl-5 pr-3 cursor-grab active:cursor-grabbing drag-handle"
                    data-drag-handle="true"
                >
                    <Menu className="cursor-grab" color="#828282" size={ 16 } />
                </div>

                { /* Item Content */ }
                <div className="flex-1">
                    <RepeaterItem
                        item={ item }
                        onUpdate={ handleItemUpdate }
                        onDelete={ handleItemDelete }
                    />
                </div>
            </div>
        );
    };

    // Sort items by order
    const sortedItems = [ ...items ].sort( ( a, b ) => a.order - b.order );

    return (
        <div className="dokan-repeater-field w-full p-4">
            <DokanFieldLabel
                title={ element.title || '' }
                titleFontWeight="light"
                helperText={ element.description }
            />
            
            <div className="mt-4">
                { sortedItems.length > 0 ? (
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                        <SortableList
                            wrapperElement=""
                            items={ sortedItems }
                            namespace={ `dokan-repeater-${ element.id || 'default' }` }
                            onChange={ handleOrderUpdate }
                            renderItem={ renderItem }
                            orderProperty="order"
                            dragSelector="drag-handle"
                            strategy="vertical"
                        />
                    </div>
                ) : (
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                        <div className="text-center py-8 text-gray-500">
                            <p>{ __( 'No items found.', 'dokan' ) }</p>
                        </div>
                    </div>
                ) }

                { /* Add New Item Section */ }
                { element?.options && element.options.length > 0 && (
                    <div className="mt-4">
                        <details className="group">
                            <summary className="flex items-center gap-2 cursor-pointer text-[#7047eb] hover:text-[#5a3bc4] transition-colors">
                                <Plus size={ 16 } />
                                <span className="text-sm font-medium">
                                    { __( 'Add New', 'dokan' ) } { element.title || __( 'Item', 'dokan' ) }
                                </span>
                            </summary>
                            <div className="mt-3 ml-6">
                                <div className="flex flex-wrap gap-2">
                                    { element.options.map( ( option: RepeaterOptionData, index: number ) => (
                                        <button
                                            key={ index }
                                            onClick={ () => handleAddNew( option.title ) }
                                            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors"
                                        >
                                            { option.title }
                                        </button>
                                    ) ) }
                                </div>
                            </div>
                        </details>
                    </div>
                ) }
            </div>
        </div>
    );
};

export default DokanRepeater;
