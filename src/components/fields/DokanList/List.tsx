// filepath: /Users/osman/Sites/dokan-test/wp-content/plugins/dokan-lite/src/components/fields/List.tsx
import { Fragment, useEffect, useRef, useState } from '@wordpress/element';
import { twMerge } from 'tailwind-merge';
import ListItem, { ListItemProps } from './ListItem';

interface ListProps {
    /**
     * Array of items to render in the list
     */
    items: Array< ListItemProps >;

    /**
     * Custom class name for the list container
     */
    className?: string;

    /**
     * Title of the list
     */
    title?: string;

    /**
     * Description or subtitle for the list
     */
    description?: string;

    /**
     * Whether to show dividers between list items
     */
    showDividers?: boolean;

    /**
     * Whether the list has a border
     */
    bordered?: boolean;

    /**
     * Whether the list has rounded corners
     */
    rounded?: boolean;

    /**
     * Background color of the list
     */
    bgColor?: string;

    /**
     * Maximum height of the list with overflow
     */
    maxHeight?: string | number;

    /**
     * Custom element to render at the top of the list
     */
    headerElement?: JSX.Element;

    /**
     * Custom element to render at the bottom of the list
     */
    footerElement?: JSX.Element;

    /**
     * Whether the list is in a loading state
     */
    loading?: boolean;

    /**
     * Message to display when there are no items
     */
    emptyMessage?: string | JSX.Element;

    /**
     * Function to call when an item is selected
     */
    onSelect?: ( item: ListItemProps, index: number ) => void;

    /**
     * ID of the currently selected item
     */
    selectedId?: string | number;

    /**
     * Key name to use for item identification
     */
    itemKey?: string;

    /**
     * Whether to allow multiple item selection
     */
    multiSelect?: boolean;

    /**
     * Array of selected item IDs when multiSelect is true
     */
    selectedIds?: Array< string | number >;

    /**
     * Custom class names for the list wrapper
     */

    listWrapperClasses?: string;
}

/**
 * List component that renders a collection of ListItem components
 * @param root0
 * @param root0.items
 * @param root0.className
 * @param root0.title
 * @param root0.description
 * @param root0.showDividers
 * @param root0.bordered
 * @param root0.rounded
 * @param root0.bgColor
 * @param root0.maxHeight
 * @param root0.headerElement
 * @param root0.footerElement
 * @param root0.loading
 * @param root0.emptyMessage
 * @param root0.onSelect
 * @param root0.selectedId
 * @param root0.itemKey
 * @param root0.multiSelect
 * @param root0.selectedIds
 * @param root0.listWrapperClasses
 */
const List: React.FC< ListProps > = ( {
    items = [],
    className = '',
    title,
    description,
    showDividers = true,
    bordered = false,
    rounded = true,
    bgColor = 'bg-white',
    maxHeight,
    headerElement,
    footerElement,
    loading = false,
    emptyMessage = 'No items to display',
    onSelect,
    selectedId,
    itemKey = 'id',
    multiSelect = false,
    selectedIds = [],
    listWrapperClasses = '',
} ) => {
    // Generate container classes
    const containerClasses = twMerge(
        bgColor,
        bordered ? 'border border-gray-200' : '',
        rounded ? 'rounded' : '',
        'overflow-hidden p-2',
        className
    );

    // Generate list classes
    const listClasses = twMerge(
        'w-full overflow-y-auto bg-white  [&::-webkit-scrollbar]:w-2\n' +
            '  [&::-webkit-scrollbar-track]:rounded-full\n' +
            '  [&::-webkit-scrollbar-track]:bg-[#E9E9E9]\n' +
            '  [&::-webkit-scrollbar-thumb]:rounded-full\n' +
            '  [&::-webkit-scrollbar-thumb]:bg-primary-500\n' +
            '  dark:[&::-webkit-scrollbar-track]:bg-[#E9E9E9]\n' +
            '  dark:[&::-webkit-scrollbar-thumb]:bg-primary-500',
        listWrapperClasses
    );

    // Keyboard navigation state and refs
    const [ focusedIndex, setFocusedIndex ] = useState< number | null >( null );
    const itemRefs = useRef< ( HTMLDivElement | null )[] >( [] );

    useEffect( () => {
        if ( focusedIndex !== null && itemRefs.current[ focusedIndex ] ) {
            itemRefs.current[ focusedIndex ]?.focus();
        }
    }, [ focusedIndex ] );

    // Render loading state
    if ( loading ) {
        return (
            <div className={ containerClasses }>
                { title && (
                    <div className="px-4 pt-3 pb-2">
                        <h3 className="font-medium text-gray-900">{ title }</h3>
                        { description && (
                            <p className="text-sm text-gray-500">
                                { description }
                            </p>
                        ) }
                    </div>
                ) }
                <div className="p-4 flex items-center justify-center">
                    <div className="animate-pulse flex space-x-4 w-full">
                        <div className="flex-1 space-y-4 py-1">
                            { [ 1, 2, 3 ].map( ( i ) => (
                                <div
                                    key={ i }
                                    className="h-12 bg-gray-200 rounded w-full"
                                ></div>
                            ) ) }
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render empty state
    if ( items.length === 0 ) {
        return (
            <div className={ containerClasses }>
                { title && (
                    <div className="px-4 pt-3 pb-2">
                        <h3 className="font-medium text-gray-900">{ title }</h3>
                        { description && (
                            <p className="text-sm text-gray-500">
                                { description }
                            </p>
                        ) }
                    </div>
                ) }
                <div className="p-6 flex flex-col items-center justify-center text-center text-gray-500">
                    { emptyMessage }
                </div>
            </div>
        );
    }

    // Handle item selection
    const handleItemClick = ( item: ListItemProps, index: number ) => {
        if ( onSelect ) {
            onSelect( item, index );
        }
    };
    return (
        <div className={ twMerge( 'shadow ', containerClasses ) }>
            { /* List header with title and description */ }
            { ( title || headerElement ) && (
                <div className="px-4 pt-3 pb-2">
                    { headerElement || (
                        <Fragment>
                            { title && (
                                <h3 className="font-medium text-gray-900">
                                    { title }
                                </h3>
                            ) }
                            { description && (
                                <p className="text-sm text-gray-500">
                                    { description }
                                </p>
                            ) }
                        </Fragment>
                    ) }
                </div>
            ) }

            { /* List items container */ }
            <div
                className={ listClasses }
                style={ maxHeight ? { maxHeight } : undefined }
            >
                { items.map( ( item, index ) => {
                    // Determine if the item is selected
                    const itemId = item[ itemKey as keyof typeof item ];
                    const isSelected = multiSelect
                        ? selectedIds.includes( itemId )
                        : selectedId === itemId;

                    // Keyboard navigation handler
                    const handleKeyDown = (
                        e: React.KeyboardEvent< HTMLDivElement >
                    ) => {
                        if ( e.key === 'ArrowDown' ) {
                            e.preventDefault();
                            setFocusedIndex( ( prev ) =>
                                prev === null
                                    ? 0
                                    : Math.min( items.length - 1, prev + 1 )
                            );
                        } else if ( e.key === 'ArrowUp' ) {
                            e.preventDefault();
                            setFocusedIndex( ( prev ) =>
                                prev === null ? 0 : Math.max( 0, prev - 1 )
                            );
                        } else if (
                            ( e.key === 'Enter' || e.key === ' ' ) &&
                            ( item.onClick || onSelect )
                        ) {
                            e.preventDefault();
                            if ( item.onClick ) {
                                item.onClick();
                            } else {
                                handleItemClick( item, index );
                            }
                        }
                    };

                    return (
                        <div
                            key={ `list-item-${ index }-${ itemId || index }` }
                            ref={ ( el ) => ( itemRefs.current[ index ] = el ) }
                            tabIndex={ focusedIndex === index ? 0 : -1 }
                            onKeyDown={ handleKeyDown }
                            onFocus={ () => setFocusedIndex( index ) }
                            onClick={ ( e ) => {
                                setFocusedIndex( index );
                                e.currentTarget.focus();
                                if ( item.onClick ) {
                                    item.onClick();
                                } else {
                                    handleItemClick( item, index );
                                }
                            } }
                            className={ `outline-none focus:ring-2 focus:ring-primary-500` }
                            role="option"
                            aria-selected={ isSelected }
                        >
                            <ListItem
                                { ...item }
                                primary={ item.primary || item.title }
                                selected={ item.selected || isSelected }
                                showDivider={
                                    index < items.length - 1 && showDividers
                                }
                                onClick={ () => {
                                    if ( item.onClick ) {
                                        item.onClick();
                                    } else {
                                        handleItemClick( item, index );
                                    }
                                } }
                            />
                        </div>
                    );
                } ) }
            </div>

            { /* List footer */ }
            { footerElement && (
                <div className="px-4 py-3 border-t border-gray-100">
                    { footerElement }
                </div>
            ) }
        </div>
    );
};

export default List;
