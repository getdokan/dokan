import { X } from 'lucide-react';

interface ImagePreviewProps {
    images: any;
    onRemove: ( index: number ) => void;
    children?: React.ReactNode;
    itemClassName?: string;
}

const ImagePreview = ( {
    images,
    onRemove,
    children,
    itemClassName = '',
}: ImagePreviewProps ) => {
    const items = Array.isArray( images ) ? images : [ images ];

    // If no images and no children (like uploader button), rendering nothing is safer
    if ( items.length === 0 && ! children ) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-3">
            { items.map( ( item: any, index: number ) => (
                <div
                    key={ item.url }
                    className={ `relative group border border-gray-200 rounded-md overflow-hidden ${ itemClassName }` }
                >
                    <img
                        src={ item.url }
                        alt={ item.alt || 'product' }
                        className="w-full h-full object-cover"
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
            ) ) }
            { children }
        </div>
    );
};

export default ImagePreview;
