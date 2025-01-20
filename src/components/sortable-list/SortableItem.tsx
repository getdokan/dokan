import { useSortable } from '@dnd-kit/sortable';

interface SortableItemProps {
    id: string | number;
    renderItem: () => JSX.Element;
}

const SortableItem = ( { id, renderItem }: SortableItemProps ) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable( { id } );

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.6 : 1,
        touchAction: 'none',
        transition,
    };

    return (
        <div ref={ setNodeRef } style={{ ...style }} { ...attributes } { ...listeners }>
            { renderItem ? renderItem( id ) : id }
        </div>
    );
};

export default SortableItem;
