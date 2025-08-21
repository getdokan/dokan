import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Check, Menu, Pencil, Plus, Trash, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { DokanFieldLabel } from '../../../../../../components/fields';
import TextField from '../../../../../../components/fields/TextField';
import DokanModal from '../../../../../../components/modals/DokanModal';
import SortableList from '../../../../../../components/sortable-list';
import { snakeCase } from '../../../../../../utilities/ChangeCase';
import { SettingsProps } from '../../types';
import { dispatch } from '@wordpress/data';
import settingsStore from '../../../../../../stores/adminSettings';

interface RepeaterItemData {
    id: string;
    order: number;
    title: string;
    required?: boolean;
}

// Individual Repeater Item Component
const RepeaterItem = ( {
    item,
    onUpdate,
    onDeleteRequest,
    isDragging = false,
    isNewItem = false,
}: {
    item: RepeaterItemData;
    onUpdate: ( id: string, updatedItem: RepeaterItemData ) => void;
    onDeleteRequest: ( id: string ) => void;
    isDragging?: boolean;
    isNewItem?: boolean;
} ) => {
    const [ isEditing, setIsEditing ] = useState( isNewItem );
    const [ editValue, setEditValue ] = useState( item.title );
    const [ originalValue, setOriginalValue ] = useState( item.title );
    const [ hasValidationError, setHasValidationError ] = useState( false );
    const [ hasBeenModified, setHasBeenModified ] = useState( false );

    const handleEdit = () => {
        setIsEditing( true );
        setOriginalValue( editValue );
        setHasBeenModified( false );
    };

    const handleSave = () => {
        const trimmedValue = editValue.trim();

        // Validate that the field is not empty
        if ( trimmedValue === '' ) {
            setHasValidationError( true );
            return;
        }

        setHasValidationError( false );
        const updatedItem = {
            ...item,
            title: trimmedValue,
        };
        onUpdate( item.id, updatedItem );
        setEditValue( trimmedValue );
        setIsEditing( false );
    };

    const handleCancel = () => {
        setEditValue( originalValue );
        setIsEditing( false );
        setHasBeenModified( false );
    };

    const handleDelete = () => {
        if ( ! item.required ) {
            onDeleteRequest( item.id );
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
                            onChange={ ( val ) => {
                                setEditValue( val );
                                setHasBeenModified( true );
                            } }
                            inputClassName={ twMerge(
                                'bg-white border-[#E9E9E9] rounded-[5px] h-10 px-4 text-[#25252D] text-sm border-[#7047eb]',
                                hasBeenModified &&
                                    ! editValue &&
                                    'border-red-500 hover:border-red-500'
                            ) }
                        />
                    ) : (
                        <span className="text-sm font-medium text-[#25252D]">
                            { item.title }
                            { item.required && (
                                <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-3xl">
                                    { __( 'Default', 'dokan-lite' ) }
                                </span>
                            ) }
                        </span>
                    ) }
                </div>
            </div>

            { /* Right Section - Actions */ }
            <div className="flex items-center gap-3">
                { /* Edit Actions */ }
                { isEditing && (
                    <>
                        { editValue.trim() && ! isNewItem && (
                            <button
                                onClick={ handleCancel }
                                className="action-icon-wrapper cancel-icon-wrapper p-1.5 border-none rounded hover:bg-gray-100 transition-colors"
                                title={ __( 'Cancel', 'dokan-lite' ) }
                            >
                                <X
                                    onClick={ handleCancel }
                                    size={ 16 }
                                    color="#828282"
                                />
                            </button>
                        ) }
                        <button
                            onClick={ handleSave }
                            className={ twMerge(
                                'action-icon-wrapper check-icon-wrapper p-1.5 border rounded transition-colors',
                                ! editValue.trim()
                                    ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                                    : 'border-gray-300 hover:bg-gray-100'
                            ) }
                            title={ __( 'Save', 'dokan-lite' ) }
                        >
                            <Check size={ 16 } color={ '#828282' } />
                        </button>
                    </>
                ) }

                <div
                    className={ twMerge(
                        'relative flex items-center gap-2',
                        item.required && 'cursor-not-allowed opacity-50',
                        ! item.required && 'cursor-grab active:cursor-grabbing',
                        ! item.required && 'drag-handle'
                    ) }
                    data-drag-handle="true"
                >
                    { ! isEditing && (
                        <button
                            onClick={ handleEdit }
                            className="action-icon-wrapper edit-icon-wrapper p-1.5 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                            title={ __( 'Edit', 'dokan-lite' ) }
                        >
                            <Pencil size={ 16 } color="#828282" />
                        </button>
                    ) }

                    { /* Trash icon is always available */ }
                    <button
                        onClick={ handleDelete }
                        className="action-icon-wrapper delete-icon-wrapper p-1.5 border border-gray-300 rounded hover:bg-red-100 transition-colors"
                        title={ __( 'Delete', 'dokan-lite' ) }
                    >
                        <Trash size={ 16 } color="#dc2626" />
                    </button>

                    { item.required && (
                        <div className="absolute inset-0 cursor-not-allowed"></div>
                    ) }
                </div>
            </div>
        </div>
    );
};

// Main DokanRepeater Component
const DokanRepeater = ( { element }: SettingsProps ) => {
    const [ items, setItems ] = useState< RepeaterItemData[] >(
        element?.value || element?.default || []
    );
    const [ newItemIds, setNewItemIds ] = useState< Set< string > >(
        new Set()
    );
    const [ deleteConfirmItem, setDeleteConfirmItem ] = useState<
        string | null
    >( null );

    // Update local state when element changes
    useEffect( () => {
        // Filter out items with empty titles (keep only items with content or required items)
        const filteredItems = element.value?.filter(
            ( item ) => item.title.trim() !== '' || item.required
        );

        // Only update if there are items to remove
        if (
            element.value?.length &&
            filteredItems.length !== element.value?.length
        ) {
            setItems( filteredItems );
            onValueChange( {
                ...element,
                value: filteredItems,
            } );
        }
    }, [] );

    if ( ! element.display ) {
        return null;
    }

    // Handle value changes and update store
    const handleItemsChange = ( updatedItems: RepeaterItemData[] ) => {
        setItems( updatedItems );

        // This code only runs if no empty titles are found
        onValueChange( {
            ...element,
            value: updatedItems,
        } );
    };

    // Handle individual item updates
    const handleItemUpdate = ( id: string, updatedItem: RepeaterItemData ) => {
        let finalUpdatedItem = updatedItem;

        // If this is a new item with a title, generate snake_case ID
        if ( updatedItem.title.trim() !== '' && newItemIds.has( id ) ) {
            const newId = snakeCase( updatedItem.title );
            finalUpdatedItem = {
                ...updatedItem,
                id: newId,
            };

            // Remove from new items tracking
            setNewItemIds( ( prev ) => {
                const newSet = new Set( prev );
                newSet.delete( id );
                return newSet;
            } );
        }

        const newItems = items.map( ( item ) =>
            item.id === id ? finalUpdatedItem : item
        );

        handleItemsChange( newItems );
    };

    // Handle delete request (show confirmation)
    const handleDeleteRequest = ( id: string ) => {
        setDeleteConfirmItem( id );
    };

    // Handle confirmed deletion
    const handleItemDelete = ( id: string ) => {
        const newItems = items.filter( ( item ) => item.id !== id );

        // Remove from new items tracking
        setNewItemIds( ( prev ) => {
            const newSet = new Set( prev );
            newSet.delete( id );
            return newSet;
        } );

        handleItemsChange( newItems );
        setDeleteConfirmItem( null );
    };

    // Cancel delete confirmation
    const handleDeleteCancel = () => {
        setDeleteConfirmItem( null );
    };

    // Handle drag and drop reordering
    const handleOrderUpdate = ( updatedItems: RepeaterItemData[] ) => {
        // Get current required items to maintain their positions
        const requiredItems = sortedItems.filter( ( item ) => item.required );

        // Update order property for sortable items, accounting for required items' positions
        const reorderedItems = updatedItems.map( ( item, index ) => {
            // Calculate the correct order considering required items
            let newOrder = index;
            requiredItems.forEach( ( reqItem ) => {
                if ( reqItem.order <= newOrder ) {
                    newOrder++;
                }
            } );

            return {
                ...item,
                order: newOrder,
            };
        } );

        // Combine required items with reordered sortable items
        const finalItems = [ ...requiredItems, ...reorderedItems ].sort(
            ( a, b ) => a.order - b.order
        );

        handleItemsChange( finalItems );
    };

    // Add new item with blank title that starts in edit mode
    const handleAddNew = () => {
        const newId = `item_${ Math.random().toString( 36 ).substr( 2, 9 ) }`;
        const newItem: RepeaterItemData = {
            id: newId,
            order: items.length,
            title: '',
        };

        // Track this as a new item
        setNewItemIds( ( prev ) => new Set( prev ).add( newId ) );
        handleItemsChange( [ ...items, newItem ] );
    };

    // Render individual item for SortableList (sortable items only)
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
                        onDeleteRequest={ handleDeleteRequest }
                        isNewItem={ newItemIds.has( item.id ) }
                    />
                </div>
            </div>
        );
    };

    // Render individual non-sortable item (required items)
    const renderNonSortableItem = ( item: RepeaterItemData ) => {
        return (
            <div className="border-b border-gray-200 flex items-center not-sortable">
                { /* Non-draggable handle placeholder */ }
                <div className="relative flex items-center pl-5 pr-3 cursor-not-allowed opacity-50">
                    <Menu
                        className="cursor-not-allowed"
                        color="#828282"
                        size={ 16 }
                    />
                    <div className="absolute inset-0 cursor-not-allowed"></div>
                </div>

                { /* Item Content */ }
                <div className="flex-1">
                    <RepeaterItem
                        item={ item }
                        onUpdate={ handleItemUpdate }
                        onDeleteRequest={ handleDeleteRequest }
                        isNewItem={ newItemIds.has( item.id ) }
                    />
                </div>
            </div>
        );
    };

    // Sort items by order
    const sortedItems = [ ...items ].sort( ( a, b ) => a.order - b.order );

    // Separate required items from sortable items
    const requiredItems = sortedItems.filter( ( item ) => item.required );
    const sortableItems = sortedItems.filter( ( item ) => ! item.required );
    if ( ! element.display ) {
        return null;
    }
    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };
    return (
        <>
            <div className="dokan-repeater-field w-full">
                <DokanFieldLabel
                    titleFontWeight="light"
                    wrapperClassNames={ element.title ? 'p-4' : '' }
                    title={ element.title || '' }
                    helperText={ element.description }
                    imageUrl={ element?.image_url }
                />

                { sortedItems.length > 0 ? (
                    <div className="overflow-hidden">
                        { /* Render required items outside sortable list */ }
                        { requiredItems.map( ( item ) => (
                            <div key={ item.id }>
                                { renderNonSortableItem( item ) }
                            </div>
                        ) ) }

                        { /* Render sortable items in sortable list */ }
                        { sortableItems.length > 0 && (
                            <SortableList
                                wrapperElement=""
                                items={ sortableItems }
                                namespace={ `dokan-repeater-${
                                    element.id || 'default'
                                }` }
                                onChange={ handleOrderUpdate }
                                renderItem={ renderItem }
                                orderProperty="order"
                                dragSelector="drag-handle"
                                strategy="vertical"
                            />
                        ) }
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>{ __( 'No items found.', 'dokan-lite' ) }</p>
                    </div>
                ) }

                { /* Add New Item Section */ }
                <div
                    onClick={ handleAddNew }
                    className="flex items-center gap-2 cursor-pointer text-[#7047eb] hover:text-[#5a3bc4] transition-colors p-5"
                >
                    <Plus size={ 16 } />
                    <span className="text-sm font-medium">
                        { element.new_title ||
                            __( 'Add New Item', 'dokan-lite' ) }
                    </span>
                </div>
            </div>

            { /* Delete Confirmation Modal - Outside of .dokan-repeater-field for proper width */ }
            { deleteConfirmItem && (
                <DokanModal
                    className="min-w-96"
                    isOpen={ !! deleteConfirmItem }
                    onConfirm={ () => handleItemDelete( deleteConfirmItem ) }
                    namespace={ `delete-item-${ deleteConfirmItem }` }
                    onClose={ handleDeleteCancel }
                    dialogHeader={ __( 'Confirm Item Deletion', 'dokan-lite' ) }
                    confirmationTitle={ __(
                        'Are you sure you want to delete this item?',
                        'dokan-lite'
                    ) }
                    confirmationDescription={ __(
                        'This action cannot be undone.',
                        'dokan-lite'
                    ) }
                    confirmButtonText={ __( 'Delete', 'dokan-lite' ) }
                />
            ) }
        </>
    );
};

export default DokanRepeater;
