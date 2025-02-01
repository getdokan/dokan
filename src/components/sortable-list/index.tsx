import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
    type CollisionDetection,
    type PointerActivationConstraint,
    type DragStartEvent,
    type DragCancelEvent,
    type DragMoveEvent,
    type DragOverEvent,
    type DragPendingEvent,
    type DragAbortEvent,
} from '@dnd-kit/core';

import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    horizontalListSortingStrategy,
    rectSortingStrategy,
    type SortingStrategy,
} from '@dnd-kit/sortable';

import { Slot } from "@wordpress/components";
import { snakeCase, kebabCase } from "@dokan/utilities";
import SortableItem from './SortableItem';
import type { Announcements, ScreenReaderInstructions } from "@dnd-kit/core";
import type { AutoScrollOptions } from "@dnd-kit/core";
import type { MeasuringConfiguration } from "@dnd-kit/core";
import { Modifiers } from "@dnd-kit/core";
import type { SensorDescriptor } from "@dnd-kit/core";
import type { CancelDrop } from "@dnd-kit/core";
import type { Disabled } from "@dnd-kit/sortable";

type StrategyType = 'horizontal' | 'vertical' | 'grid';

interface SortableListProps<T> {
    items: T[];
    namespace: string;
    onChange?: (items: T[]) => void;
    renderItem?: (item: T) => JSX.Element;
    orderProperty?: keyof T;
    className?: string;
    activationConstraint?: PointerActivationConstraint;
    strategy?: StrategyType;
    keyExtractor?: (item: T) => UniqueIdentifier;
    gridColumns?: number;
    id?: string;
    disabled?: boolean | Disabled;
    sortableId?: string;
    accessibility?: {
        announcements?: Announcements;
        container?: Element;
        restoreFocus?: boolean;
        screenReaderInstructions?: ScreenReaderInstructions;
    };
    autoScroll?: boolean | AutoScrollOptions;
    cancelDrop?: CancelDrop;
    collisionDetection?: CollisionDetection;
    measuring?: MeasuringConfiguration;
    modifiers?: Modifiers;
    sensors?: SensorDescriptor<any>[];
    onDragAbort?: (event: DragAbortEvent) => void;
    onDragPending?: (event: DragPendingEvent) => void;
    onDragStart?: (event: DragStartEvent) => void;
    onDragMove?: (event: DragMoveEvent) => void;
    onDragOver?: (event: DragOverEvent) => void;
    onDragEnd?: (event: DragEndEvent) => void;
    onDragCancel?: (event: DragCancelEvent) => void;
}

const SortableList = <T extends object>( props: SortableListProps<T> ): JSX.Element => {
    if ( ! props.namespace ) {
        throw new Error( 'Namespace is required for the SortableList component' );
    }

    const {
        items,
        namespace,
        onChange,
        renderItem,
        orderProperty,
        className = '',
        activationConstraint,
        strategy = 'vertical',
        keyExtractor = item => (item as any)?.id || item,
        gridColumns = 4,
        disabled,
        sortableId,
    } = props;

    const sensors = useSensors(
        useSensor( PointerSensor, {
            activationConstraint: activationConstraint || {
                delay     : 5,
                tolerance : 5,
            },
        }),
        useSensor( KeyboardSensor, {
            coordinateGetter : sortableKeyboardCoordinates,
        })
    );

    const getSortingStrategy = (): SortingStrategy => {
        switch ( strategy ) {
            case 'horizontal':
                return horizontalListSortingStrategy;
            case 'grid':
                return rectSortingStrategy;
            case 'vertical':
            default:
                return verticalListSortingStrategy;
        }
    };

    const handleDragEnd = ( event: DragEndEvent ) => {
        const { active, over } = event;

        if ( active?.id !== over?.id ) {
            const oldIndex = items.findIndex(
                item => keyExtractor( item ) === active.id
            );
            const newIndex = items.findIndex(
                item => keyExtractor( item ) === over.id
            );

            const newItems = arrayMove( items, oldIndex, newIndex );
            if ( orderProperty ) {
                newItems.forEach( ( item, index ) => {
                    ( item[ orderProperty ] as number ) = index + 1;
                });
            }

            onChange?.( newItems );
        }

        // Call the original onDragEnd if provided
        props.onDragEnd?.( event );
    };

    const itemIds = items.map( keyExtractor );
    const containerNamespace = kebabCase( namespace );

    const getLayoutClasses = () => {
        switch ( strategy ) {
            case 'horizontal':
                return 'flex flex-row items-center';
            case 'grid':
                return `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${ gridColumns }`;
            case 'vertical':
            default:
                return 'flex flex-col';
        }
    };

    return (
        <div
            id={ containerNamespace }
            className={ `dokan-sortable-container` }
            data-filter-id={ `dokan_${ snakeCase( namespace ) }_sortable_container` }
        >
            <Slot
                name={ `dokan-before-sortable-${ containerNamespace }` }
                fillProps={{ items, strategy }}
            />

            <DndContext
                sensors={ sensors }
                collisionDetection={ closestCenter }
                onDragEnd={ handleDragEnd }
                { ...props }
            >
                <SortableContext
                    items={ itemIds }
                    strategy={ getSortingStrategy() }
                    id={ sortableId }
                    disabled={ disabled }
                >
                    <div className={ `${ getLayoutClasses() } gap-4 ${ className }` }>
                        { items.map( ( item ) => (
                            <SortableItem
                                id={ keyExtractor( item ) }
                                key={ keyExtractor( item ) }
                                renderItem={ () => renderItem ? renderItem( item ) : null }
                            />
                        )) }
                    </div>
                </SortableContext>
            </DndContext>

            <Slot
                name={ `dokan-after-sortable-${ containerNamespace }` }
                fillProps={{ items, strategy }}
            />
        </div>
    );
};

export default SortableList;
