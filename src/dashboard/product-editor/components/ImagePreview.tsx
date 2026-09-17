import {
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SortableList } from '@src/components';
import { X } from 'lucide-react';

interface ImagePreviewProps {
    images: any;
    onRemove: ( index: number ) => void;
    onSort?: ( images: any[] ) => void;
    children?: React.ReactNode;
    itemClassName?: string;
}

const ImagePreview = ( {
    images,
    onRemove,
    onSort,
    children,
    itemClassName = '',
}: ImagePreviewProps ) => {
    // Mouse needs some movement so the remove button stays clickable; touch
    // needs a long press so swiping over the images still scrolls the page.
    const sensors = useSensors(
        useSensor( MouseSensor, { activationConstraint: { distance: 5 } } ),
        useSensor( TouchSensor, {
            activationConstraint: { delay: 250, tolerance: 5 },
        } ),
        useSensor( KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        } )
    );

    const items = Array.isArray( images ) ? images : [ images ];

    // If no images and no children (like uploader button), rendering nothing is safer
    if ( items.length === 0 && ! children ) {
        return null;
    }

    const isSortable = !! onSort && items.length > 1;

    const renderItem = ( item: any ) => {
        const index = items.indexOf( item );

        return (
            <div
                key={ item.id ?? item.url }
                className={ `relative group border border-gray-200 rounded-md overflow-hidden ${
                    isSortable ? 'dokan-sortable-image cursor-move' : ''
                } ${ itemClassName }` }
            >
                <img
                    src={ item.url }
                    alt={ item.alt || 'product' }
                    className="w-full h-full object-cover"
                    draggable={ false }
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                    <button
                        type="button"
                        className="bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-red-500"
                        onClick={ ( e ) => {
                            e.preventDefault();
                            onRemove( index );
                        } }
                    >
                        <X size={ 16 } />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-wrap gap-3">
            { isSortable ? (
                <SortableList
                    items={ items }
                    namespace="product-editor-gallery-images"
                    strategy="grid"
                    wrapperElement={ null }
                    keyExtractor={ ( item: any ) => item.id }
                    sensors={ sensors }
                    onChange={ onSort }
                    renderItem={ renderItem }
                />
            ) : (
                items.map( renderItem )
            ) }
            { children }
        </div>
    );
};

export default ImagePreview;
