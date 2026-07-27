import { decodeEntities } from '@wordpress/html-entities';
import { PriceHtml } from '@dokan/components';
import type { DetailsLineItem } from './types';

/**
 * One order line: thumbnail, name, unit price, quantity, and line total with the
 * pre-discount subtotal struck through when they differ.
 * @param root0
 * @param root0.item
 */
const ItemRow = ( { item }: { item: DetailsLineItem } ) => {
    const subtotal = parseFloat( item.subtotal || '0' );
    const total = parseFloat( item.total || '0' );
    const discounted = Math.abs( subtotal - total ) > 0.005;

    return (
        <div className="grid grid-cols-[44fr_22fr_22fr_22fr] items-center gap-3 border-b border-[#E9E9E9] px-6 py-4">
            <div className="flex min-w-0 items-center gap-3">
                <img
                    src={ item.image }
                    alt={ decodeEntities( item.name ) }
                    className="h-11 w-11 shrink-0 rounded border border-[#E9E9E9] object-cover"
                />
                <div className="min-w-0">
                    <p className="truncate text-sm text-[#25252D]">
                        { decodeEntities( item.name ) }
                    </p>
                    { item.sku && (
                        <p className="truncate text-xs text-[#828282]">
                            { item.sku }
                        </p>
                    ) }
                </div>
            </div>
            <div className="text-sm text-[#575757]">
                <PriceHtml price={ item.price } />
            </div>
            <div className="text-sm text-[#575757]">{ item.quantity }</div>
            <div className="text-right text-sm text-[#25252D]">
                <span className="font-medium">
                    <PriceHtml price={ item.total } />
                </span>
                { discounted && (
                    <span className="block text-xs text-gray-400 line-through">
                        <PriceHtml price={ item.subtotal } />
                    </span>
                ) }
            </div>
        </div>
    );
};

export default ItemRow;
