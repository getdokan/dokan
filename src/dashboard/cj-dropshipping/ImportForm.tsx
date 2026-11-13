import { useEffect, useMemo, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { DokanButton, PriceHtml } from '@dokan/components';
import type { CJProduct, CJStatus, CJVariant } from './types';

type Earning = {
    price: number;
    commission: number;
    earning: number;
    keeps: number;
};

type Imported = {
    product_id: number;
    status: string;
    edit_url: string;
};

type Props = {
    product: CJProduct;
    status: CJStatus;
};

const totalStock = ( variant: CJVariant ) =>
    Object.values( variant.stock ).reduce( ( sum, units ) => sum + units, 0 );

// Price per variant, category, and what the vendor keeps; import is refused when nothing is left.
const ImportForm = ( { product, status }: Props ) => {
    const importable = product.variants.filter(
        ( variant ) =>
            ! variant.imported_product_id && totalStock( variant ) > 0
    );
    const [ selected, setSelected ] = useState< string[] >(
        importable[ 0 ] ? [ importable[ 0 ].vid ] : []
    );
    const [ prices, setPrices ] = useState< Record< string, string > >( () =>
        Object.fromEntries(
            product.variants.map( ( variant ) => [
                variant.vid,
                ( variant.cost * ( 1 + status.default_markup / 100 ) ).toFixed(
                    2
                ),
            ] )
        )
    );
    const [ categoryId, setCategoryId ] = useState(
        status.categories[ 0 ]?.id ?? 0
    );
    const [ earnings, setEarnings ] = useState< Record< string, Earning > >(
        {}
    );
    const [ busy, setBusy ] = useState( false );
    const [ error, setError ] = useState( '' );
    const [ imported, setImported ] = useState< Imported | null >( null );

    const variants = useMemo(
        () =>
            Object.fromEntries( product.variants.map( ( v ) => [ v.vid, v ] ) ),
        [ product ]
    );

    // Recalculate commission and what the vendor keeps when price or category changes.
    useEffect( () => {
        const timer = setTimeout( () => {
            selected.forEach( ( vid ) => {
                const price = parseFloat( prices[ vid ] || '0' );
                apiFetch< Earning >( {
                    path: addQueryArgs( '/dokan/v1/cj-dropshipping/earning', {
                        price,
                        cost: variants[ vid ].cost,
                        category_id: categoryId,
                    } ),
                } )
                    .then( ( result ) =>
                        setEarnings( ( prev ) => ( {
                            ...prev,
                            [ vid ]: result,
                        } ) )
                    )
                    .catch( () => undefined );
            } );
        }, 400 );

        return () => clearTimeout( timer );
    }, [ selected, prices, categoryId, variants ] );

    const toggle = ( vid: string ) => {
        if ( ! status.variable ) {
            setSelected( [ vid ] );
            return;
        }
        setSelected( ( prev ) =>
            prev.includes( vid )
                ? prev.filter( ( v ) => v !== vid )
                : [ ...prev, vid ]
        );
    };

    const losing = selected.some(
        ( vid ) => earnings[ vid ] && earnings[ vid ].keeps <= 0
    );

    const submit = () => {
        setBusy( true );
        setError( '' );
        apiFetch< Imported >( {
            path: '/dokan/v1/cj-dropshipping/import',
            method: 'POST',
            data: {
                pid: product.pid,
                vids: selected,
                prices: Object.fromEntries(
                    selected.map( ( vid ) => [
                        vid,
                        parseFloat( prices[ vid ] || '0' ),
                    ] )
                ),
                category_ids: categoryId ? [ categoryId ] : [],
            },
        } )
            .then( setImported )
            .catch( ( e ) => setError( e?.message || '' ) )
            .finally( () => setBusy( false ) );
    };

    if ( imported ) {
        return (
            <div
                className="rounded-md border border-green-200 bg-green-50 p-4 text-sm space-y-2"
                data-testid="cj-imported"
            >
                <p className="m-0">
                    { 'publish' === imported.status
                        ? __( 'Imported and published.', 'dokan-lite' )
                        : __(
                              'Imported. It goes on sale once it is approved.',
                              'dokan-lite'
                          ) }
                </p>
                <a href={ imported.edit_url }>
                    { __( 'Edit the product', 'dokan-lite' ) }
                </a>
            </div>
        );
    }

    if ( ! importable.length ) {
        return (
            <p className="text-sm text-gray-600">
                { __(
                    'Nothing left to import: you already sell every variant in stock.',
                    'dokan-lite'
                ) }
            </p>
        );
    }

    return (
        <div className="space-y-4" data-testid="cj-import-form">
            <h4 className="m-0 text-base font-semibold">
                { status.variable
                    ? __( 'Variants to import', 'dokan-lite' )
                    : __( 'Variant to import', 'dokan-lite' ) }
            </h4>
            { ! status.variable && product.variants.length > 1 && (
                <p className="m-0 text-xs text-gray-600">
                    { __(
                        'Imports this one variant. Importing all variants as one product needs Dokan Pro.',
                        'dokan-lite'
                    ) }
                </p>
            ) }

            <div className="space-y-3">
                { importable.map( ( variant ) => {
                    const checked = selected.includes( variant.vid );
                    const result = earnings[ variant.vid ];
                    return (
                        <div
                            key={ variant.vid }
                            className="rounded border border-gray-200 p-3 space-y-2"
                        >
                            <div className="flex items-center gap-2 text-sm">
                                <input
                                    id={ `cj-variant-${ variant.vid }` }
                                    type={
                                        status.variable ? 'checkbox' : 'radio'
                                    }
                                    name="cj-variant"
                                    checked={ checked }
                                    onChange={ () => toggle( variant.vid ) }
                                />
                                <label
                                    htmlFor={ `cj-variant-${ variant.vid }` }
                                >
                                    { variant.key || variant.name }
                                </label>
                            </div>
                            { checked && (
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <label
                                        htmlFor={ `cj-price-${ variant.vid }` }
                                    >
                                        { sprintf(
                                            /* translators: %s: currency symbol */
                                            __(
                                                'Your price (%s)',
                                                'dokan-lite'
                                            ),
                                            status.currency
                                        ) }
                                    </label>
                                    <input
                                        id={ `cj-price-${ variant.vid }` }
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="h-9 rounded border border-gray-300 px-2"
                                        value={ prices[ variant.vid ] }
                                        onChange={ ( e ) =>
                                            setPrices( ( prev ) => ( {
                                                ...prev,
                                                [ variant.vid ]: e.target.value,
                                            } ) )
                                        }
                                    />
                                    <span>
                                        { __( 'CJ cost', 'dokan-lite' ) }
                                    </span>
                                    <PriceHtml price={ variant.cost } />
                                    <span>
                                        { __( 'Commission', 'dokan-lite' ) }
                                    </span>
                                    { result ? (
                                        <PriceHtml
                                            price={ result.commission }
                                        />
                                    ) : (
                                        <span>…</span>
                                    ) }
                                    <span className="font-semibold">
                                        { __( 'You keep', 'dokan-lite' ) }
                                    </span>
                                    { result ? (
                                        <span
                                            className={
                                                result.keeps > 0
                                                    ? 'font-semibold'
                                                    : 'font-semibold text-red-600'
                                            }
                                            data-testid="cj-keeps"
                                        >
                                            <PriceHtml price={ result.keeps } />
                                        </span>
                                    ) : (
                                        <span>…</span>
                                    ) }
                                </div>
                            ) }
                        </div>
                    );
                } ) }
            </div>

            <div className="flex flex-col gap-1 text-sm">
                <label htmlFor="cj-import-category">
                    { __( 'Category', 'dokan-lite' ) }
                </label>
                <select
                    id="cj-import-category"
                    className="h-9 rounded border border-gray-300 px-2"
                    value={ categoryId }
                    onChange={ ( e ) =>
                        setCategoryId( parseInt( e.target.value, 10 ) )
                    }
                >
                    { status.categories.map( ( category ) => (
                        <option key={ category.id } value={ category.id }>
                            { category.name }
                        </option>
                    ) ) }
                </select>
            </div>

            { losing && (
                <p className="m-0 text-sm text-red-600">
                    { __(
                        "This price leaves you nothing after commission and CJ's cost. Raise the price.",
                        'dokan-lite'
                    ) }
                </p>
            ) }
            { error && <p className="m-0 text-sm text-red-600">{ error }</p> }

            <DokanButton
                onClick={ submit }
                disabled={ busy || ! selected.length || losing || ! categoryId }
                loading={ busy }
            >
                { __( 'Import to my store', 'dokan-lite' ) }
            </DokanButton>
        </div>
    );
};

export default ImportForm;
