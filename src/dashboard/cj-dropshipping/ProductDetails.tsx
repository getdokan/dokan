import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { DokanButton, PriceHtml } from '@dokan/components';
import type { CJProduct, CJStatus } from './types';

type Props = {
    pid: string;
    status: CJStatus;
    warehouseNames: Record< string, string >;
    onClose: () => void;
};

// Where CJ stocks a product, e.g. "China 670,136 · United States 15 (1 of 22 variants)".
export const warehouseSummary = (
    product: CJProduct,
    names: Record< string, string >
): string[] => {
    const totals: Record< string, { units: number; variants: number } > = {};

    product.variants.forEach( ( variant ) => {
        Object.entries( variant.stock ).forEach( ( [ country, units ] ) => {
            if ( units <= 0 ) {
                return;
            }
            totals[ country ] = totals[ country ] ?? { units: 0, variants: 0 };
            totals[ country ].units += units;
            totals[ country ].variants += 1;
        } );
    } );

    return Object.entries( totals )
        .sort( ( a, b ) => b[ 1 ].units - a[ 1 ].units )
        .map( ( [ country, total ] ) =>
            total.variants < product.variants.length
                ? sprintf(
                      /* translators: 1: warehouse country, 2: units, 3: variants stocked, 4: all variants */
                      __( '%1$s %2$s (%3$d of %4$d variants)', 'dokan-lite' ),
                      names[ country ] ?? country,
                      total.units.toLocaleString(),
                      total.variants,
                      product.variants.length
                  )
                : sprintf(
                      /* translators: 1: warehouse country, 2: units */
                      __( '%1$s %2$s', 'dokan-lite' ),
                      names[ country ] ?? country,
                      total.units.toLocaleString()
                  )
        );
};

// A CJ product's variants, cost and stock per warehouse; the import form comes next.
const ProductDetails = ( { pid, warehouseNames, onClose }: Props ) => {
    const [ product, setProduct ] = useState< CJProduct | null >( null );
    const [ error, setError ] = useState( '' );

    useEffect( () => {
        setProduct( null );
        setError( '' );
        apiFetch< CJProduct >( {
            path: `/dokan/v1/cj-dropshipping/catalog/${ encodeURIComponent(
                pid
            ) }`,
        } )
            .then( setProduct )
            .catch( ( e ) => setError( e?.message || '' ) );
    }, [ pid ] );

    return (
        <div
            className="fixed inset-0 z-[100000] flex justify-end bg-black/30"
            role="dialog"
            aria-modal="true"
            aria-label={ __( 'CJ product', 'dokan-lite' ) }
            data-testid="cj-details"
        >
            <div className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <h3 className="m-0 text-lg font-semibold">
                        { product?.name ?? __( 'Loading…', 'dokan-lite' ) }
                    </h3>
                    <DokanButton variant="secondary" onClick={ onClose }>
                        { __( 'Close', 'dokan-lite' ) }
                    </DokanButton>
                </div>

                { error && <p className="text-sm text-red-600">{ error }</p> }

                { product && (
                    <>
                        <div>
                            <span className="text-sm font-medium">
                                { __( 'Where CJ stocks it', 'dokan-lite' ) }
                            </span>
                            <ul className="m-0 mt-1 list-none p-0 text-sm text-gray-700">
                                { warehouseSummary(
                                    product,
                                    warehouseNames
                                ).map( ( line ) => (
                                    <li key={ line }>{ line }</li>
                                ) ) }
                                { 0 ===
                                    warehouseSummary( product, warehouseNames )
                                        .length && (
                                    <li>
                                        { __(
                                            'Out of stock at CJ',
                                            'dokan-lite'
                                        ) }
                                    </li>
                                ) }
                            </ul>
                        </div>

                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-2">
                                        { __( 'Variant', 'dokan-lite' ) }
                                    </th>
                                    <th className="py-2">
                                        { __( 'CJ cost', 'dokan-lite' ) }
                                    </th>
                                    <th className="py-2">
                                        { __( 'Stock', 'dokan-lite' ) }
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                { product.variants.map( ( variant ) => (
                                    <tr
                                        key={ variant.vid }
                                        className="border-b border-gray-100"
                                    >
                                        <td className="py-2 pr-2">
                                            { variant.key || variant.name }
                                            <div className="text-xs text-gray-500">
                                                { variant.sku }
                                            </div>
                                        </td>
                                        <td className="py-2 pr-2">
                                            <PriceHtml price={ variant.cost } />
                                        </td>
                                        <td className="py-2">
                                            { Object.entries( variant.stock )
                                                .filter(
                                                    ( [ , units ] ) => units > 0
                                                )
                                                .map(
                                                    ( [ country, units ] ) =>
                                                        `${
                                                            warehouseNames[
                                                                country
                                                            ] ?? country
                                                        } ${ units.toLocaleString() }`
                                                )
                                                .join( ' · ' ) ||
                                                __(
                                                    'Out of stock',
                                                    'dokan-lite'
                                                ) }
                                        </td>
                                    </tr>
                                ) ) }
                            </tbody>
                        </table>
                    </>
                ) }
            </div>
        </div>
    );
};

export default ProductDetails;
