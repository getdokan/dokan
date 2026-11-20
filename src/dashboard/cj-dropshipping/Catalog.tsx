import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { DokanButton, PriceHtml } from '@dokan/components';
import ProductDetails from './ProductDetails';
import type { CJSearchResult, CJStatus } from './types';

type Props = {
    status: CJStatus;
};

// Search CJ's catalog with CJ's own "ships from" warehouse filter.
const Catalog = ( { status }: Props ) => {
    const [ keyword, setKeyword ] = useState( '' );
    const [ warehouse, setWarehouse ] = useState( '' );
    const [ page, setPage ] = useState( 1 );
    const [ result, setResult ] = useState< CJSearchResult | null >( null );
    const [ busy, setBusy ] = useState( false );
    const [ error, setError ] = useState( '' );
    const [ openPid, setOpenPid ] = useState( '' );

    const search = ( nextPage = 1 ) => {
        setBusy( true );
        setError( '' );
        setPage( nextPage );
        apiFetch< CJSearchResult >( {
            path: addQueryArgs( '/dokan/v1/cj-dropshipping/catalog', {
                keyword,
                warehouse,
                page: nextPage,
            } ),
        } )
            .then( setResult )
            .catch( ( e ) => setError( e?.message || '' ) )
            .finally( () => setBusy( false ) );
    };

    return (
        <div className="space-y-4">
            <form
                className="flex flex-wrap items-end gap-3"
                onSubmit={ ( e ) => {
                    e.preventDefault();
                    search( 1 );
                } }
            >
                <div className="flex flex-col gap-1 text-sm">
                    <label htmlFor="cj-search-keyword">
                        { __( 'Search CJ products', 'dokan-lite' ) }
                    </label>
                    <input
                        id="cj-search-keyword"
                        type="search"
                        className="h-10 min-w-72 rounded border border-gray-300 px-3"
                        value={ keyword }
                        onChange={ ( e ) => setKeyword( e.target.value ) }
                        placeholder={ __(
                            'Product name or SKU',
                            'dokan-lite'
                        ) }
                    />
                </div>
                <div className="flex flex-col gap-1 text-sm">
                    <label htmlFor="cj-search-warehouse">
                        { __( 'Ships from', 'dokan-lite' ) }
                    </label>
                    <select
                        id="cj-search-warehouse"
                        className="h-10 rounded border border-gray-300 px-3"
                        value={ warehouse }
                        onChange={ ( e ) => setWarehouse( e.target.value ) }
                    >
                        <option value="">
                            { __( 'Any warehouse', 'dokan-lite' ) }
                        </option>
                        { Object.entries( status.warehouses ).map(
                            ( [ code, name ] ) => (
                                <option key={ code } value={ code }>
                                    { name }
                                </option>
                            )
                        ) }
                    </select>
                </div>
                <DokanButton type="submit" disabled={ busy } loading={ busy }>
                    { __( 'Search', 'dokan-lite' ) }
                </DokanButton>
            </form>

            { error && <p className="text-sm text-red-600">{ error }</p> }

            { result && 0 === result.items.length && (
                <p className="text-sm text-gray-600">
                    { __( 'No CJ products match your search.', 'dokan-lite' ) }
                </p>
            ) }

            { result && result.items.length > 0 && (
                <>
                    <p className="text-sm text-gray-600 m-0">
                        { sprintf(
                            /* translators: %s: number of products found */
                            __( '%s products found', 'dokan-lite' ),
                            result.total.toLocaleString()
                        ) }
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        { result.items.map( ( item ) => (
                            <div
                                key={ item.pid }
                                className="flex flex-col rounded-md border border-gray-200 bg-white p-3"
                                data-testid="cj-card"
                            >
                                { item.image && (
                                    <img
                                        src={ item.image }
                                        alt=""
                                        className="mb-2 aspect-square w-full rounded object-cover"
                                        loading="lazy"
                                    />
                                ) }
                                <span className="text-sm font-medium text-gray-900 line-clamp-2">
                                    { item.name }
                                </span>
                                <span className="mt-1 text-xs text-gray-600">
                                    { __( 'CJ cost from', 'dokan-lite' ) }{ ' ' }
                                    <PriceHtml price={ item.cost } />
                                </span>
                                { item.delivery_cycle && (
                                    <span className="text-xs text-gray-500">
                                        { sprintf(
                                            /* translators: %s: CJ processing days, e.g. 3-5 */
                                            __(
                                                'CJ processing: %s days',
                                                'dokan-lite'
                                            ),
                                            item.delivery_cycle
                                        ) }
                                    </span>
                                ) }
                                <DokanButton
                                    className="mt-3"
                                    variant="secondary"
                                    onClick={ () => setOpenPid( item.pid ) }
                                >
                                    { __(
                                        'Check stock and import',
                                        'dokan-lite'
                                    ) }
                                </DokanButton>
                            </div>
                        ) ) }
                    </div>
                    { result.pages > 1 && (
                        <div className="flex items-center gap-2">
                            <DokanButton
                                variant="secondary"
                                disabled={ busy || page <= 1 }
                                onClick={ () => search( page - 1 ) }
                            >
                                { __( 'Previous', 'dokan-lite' ) }
                            </DokanButton>
                            <span className="text-sm">
                                { sprintf(
                                    /* translators: 1: current page, 2: total pages */
                                    __( 'Page %1$d of %2$d', 'dokan-lite' ),
                                    page,
                                    result.pages
                                ) }
                            </span>
                            <DokanButton
                                variant="secondary"
                                disabled={ busy || page >= result.pages }
                                onClick={ () => search( page + 1 ) }
                            >
                                { __( 'Next', 'dokan-lite' ) }
                            </DokanButton>
                        </div>
                    ) }
                </>
            ) }

            { openPid && (
                <ProductDetails
                    pid={ openPid }
                    status={ status }
                    warehouseNames={ status.warehouses }
                    onClose={ () => setOpenPid( '' ) }
                />
            ) }
        </div>
    );
};

export default Catalog;
