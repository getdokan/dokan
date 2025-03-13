import { useSortable } from '@dnd-kit/sortable';
import { cloneElement } from '@wordpress/element';

interface SortableItemProps {
    id: string | number;
    dragSelector?: string;
    wrapperElement?: string | null;
}

const SortableItem = ( {
    id,
    renderItem,
    dragSelector
}: SortableItemProps ) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable( { id } );

    const content = renderItem();
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.6 : 1,
        touchAction: 'none',
        transition,
    };

    // If dragSelector is provided, find and enhance the draggable cell
    if ( dragSelector && content.props.children ) {
        const children = content.props.children;
        const enhancedChildren = children.map( child => {
            if ( child?.props?.className?.includes( dragSelector ) ) {
                return cloneElement( child, {
                    ...child.props,
                    ...listeners
                });
            }

            return child;
        });

        return cloneElement( content, {
            ref: setNodeRef,
            style: {
                ...content.props.style,
                ...style
            },
            ...attributes,
            children: enhancedChildren
        });
    }

    // No dragSelector, apply everything to the root element
    return cloneElement( content, {
        ref: setNodeRef,
        style: {
            ...content.props.style,
            ...style
        },
        ...attributes,
        ...listeners
    });
};

export default SortableItem;
