import { truncate } from '../../../../../utilities/Truncate';
import { __ } from '@wordpress/i18n';

interface Product {
    id: number;
    name: string;
    image: string;
    category: string;
    price: number;
    sold: number;
}

interface ProductCardProps {
    product: Product;
}

const ProductCard = ( { product }: ProductCardProps ) => (
    <div className="bg-white border border-[#E9E9E9] rounded-md flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors shadow">
        <img
            src={ product.image }
            alt={ product.name }
            className="w-14 h-14 rounded-lg object-cover bg-gray-100"
            loading="lazy"
        />
        <div className="flex-1 min-w-0 space-y-1.5">
            <h4
                className="text-gray-900 truncate text-base font-medium mt-1"
                dangerouslySetInnerHTML={ {
                    __html: truncate( product.name, 30 ),
                } }
            />
            <div className="flex items-center gap-4">
                <p
                    className="text-sm border-r text-[#828282] pr-4"
                    dangerouslySetInnerHTML={ {
                        __html: truncate( product.category, 20 ),
                    } }
                />
                <div className="flex gap-3">
                    <div
                        className="font-bold text-gray-900 text-xl"
                        dangerouslySetInnerHTML={ {
                            // @ts-ignore
                            __html: product.sold,
                        } }
                    />
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-[#EFEAFF] text-[#7047EB]">
                        { __( 'Sold', 'dokan-lite' ) }
                    </span>
                </div>
            </div>
        </div>
    </div>
);

export default ProductCard;
export type { Product };
