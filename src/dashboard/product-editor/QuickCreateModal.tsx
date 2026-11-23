import { DataForm, useFormValidity } from '@dokan/product-editor';
import { DokanModal } from '@src/components';
import { useToast } from '@getdokan/dokan-ui';
import apiFetch from '@wordpress/api-fetch';
import { useDispatch } from '@wordpress/data';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { doAction } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
// @ts-ignore - store registered via window global, no local types.
import productEditorStore from '@dokan/stores/product-editor';
import {
    useInitProductEditor,
    useProductEditor,
} from './hooks/useProductEditor';
import { FormItem } from './types';

/**
 * Schema field IDs (Elements constants) rendered in the lightweight quick-create form.
 * Everything else from the full product-editor schema is fetched but never shown.
 *
 * @since 5.0.9
 */
const QUICK_CREATE_FIELDS = [
    {
        id: 'root-layout',
        layout: {
            type: 'row',
            alignment: 'start',
            // `styles` is keyed by the row's DIRECT child id and only `flex` is
            // honored (see @wordpress/dataviews RowLayout). `image_id` is a
            // grandchild, so target the `image_gallery` column and pin it to a
            // fixed 200px basis (no grow/shrink).
            styles: {
                image_gallery: {
                    flex: '0 0 200px',
                },
            },
        },
        children: [
            {
                id: 'image_gallery',
                layout: {
                    type: 'column',
                    alignment: 'start',
                },
                children: [ 'image_id', 'gallery_image_ids' ],
            },
            {
                id: 'other-fields',
                layout: {
                    type: 'column',
                    alignment: 'start',
                },
                children: [
                    'name', // Elements::NAME
                    'regular_price',
                    'sale_price',
                    'create_schedule_for_discount',
                    'date_on_sale_from', // Elements::DATE_ON_SALE_FROM
                    'date_on_sale_to', // Elements::DATE_ON_SALE_TO
                ],
            },
        ],
    },
    'category_ids', // Elements::CATEGORIES
    'short_description', // Elements::SHORT_DESCRIPTION
];

// New products live under id 0 in the product-editor store (same as the full create route).
const NEW_PRODUCT_ID = 0;

interface InitFieldsResponse {
    form_items: FormItem[];
    vendor_earning: number;
    products_url: string;
}

/**
 * Pulse skeleton mirroring the quick-create layout (200px image column beside
 * the stacked name/price fields, then category and short-description rows) so
 * the modal keeps its shape while the schema fetch is in flight.
 *
 * @since 5.0.9
 */
const QuickCreateSkeleton = () => (
    <div role="status" className="animate-pulse">
        <span className="sr-only">{ __( 'Loading…', 'dokan-lite' ) }</span>
        <div className="flex gap-6 mb-6" aria-hidden="true">
            { /* Image + gallery column (fixed 200px, like the real form). */ }
            <div className="w-50 shrink-0">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="bg-gray-100 rounded w-full aspect-square mb-3"></div>
                <div className="flex gap-2">
                    <div className="bg-gray-100 rounded w-12 h-12"></div>
                    <div className="bg-gray-100 rounded w-12 h-12"></div>
                    <div className="bg-gray-100 rounded w-12 h-12"></div>
                </div>
            </div>
            { /* Name, regular price, sale price + discount-schedule row. */ }
            <div className="flex-1">
                <div className="mb-6">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="bg-gray-100 rounded w-full h-10"></div>
                </div>
                <div className="mb-6">
                    <div className="h-4 bg-gray-200 rounded w-1/5 mb-3"></div>
                    <div className="bg-gray-100 rounded w-full h-10"></div>
                </div>
                <div className="mb-6">
                    <div className="h-4 bg-gray-200 rounded w-1/5 mb-3"></div>
                    <div className="bg-gray-100 rounded w-full h-10"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-100 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                </div>
            </div>
        </div>
        { /* Category + short description (full width). */ }
        <div className="mb-6" aria-hidden="true">
            <div className="h-4 bg-gray-200 rounded w-1/6 mb-3"></div>
            <div className="bg-gray-100 rounded w-full h-10"></div>
        </div>
        <div aria-hidden="true">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div className="bg-gray-100 rounded w-full h-24"></div>
        </div>
    </div>
);

interface QuickCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    /**
     * Called after a successful create. The caller uses this to refresh the
     * product list (and status counts) so the new draft appears in place — no
     * navigation away from the listing.
     */
    onCreated?: () => void;
}

/**
 * Lightweight, schema-driven "Add New Product" modal.
 *
 * Pulls the same FormSchema the full React product editor uses
 * (`GET dokan/v3/products/init/fields`), renders only the essential subset via
 * `DataForm`, and creates a draft product through the shared product-editor
 * store. Server-side `PayloadResolver` maps the schema-keyed payload to the WC
 * REST shape, so no field transformation happens here.
 *
 * @param root0
 * @param root0.isOpen
 * @param root0.onClose
 * @param root0.onCreated
 * @since 5.0.9
 */
const QuickCreateModal = ( {
    isOpen,
    onClose,
    onCreated,
}: QuickCreateModalProps ) => {
    const toast = useToast();

    const [ formItems, setFormItems ] = useState< FormItem[] >( [] );
    const [ vendorEarning, setVendorEarning ] = useState( 0 );
    const [ initLoading, setInitLoading ] = useState( false );
    const [ initError, setInitError ] = useState< string | null >( null );

    // Fetch the schema once the modal opens (and only once per mount).
    const fetchFields = useCallback( async () => {
        setInitLoading( true );
        setInitError( null );
        try {
            const response = await apiFetch< InitFieldsResponse >( {
                path: `/dokan/v3/products/init/fields?id=`,
            } );
            setFormItems( response.form_items || [] );
            setVendorEarning( response.vendor_earning || 0 );
        } catch ( err: any ) {
            setInitError(
                err?.message ||
                    __( 'Failed to load the product form.', 'dokan-lite' )
            );
        } finally {
            setInitLoading( false );
        }
    }, [] );

    useEffect( () => {
        if ( isOpen && ! formItems.length && ! initLoading && ! initError ) {
            void fetchFields();
        }
    }, [ isOpen, formItems.length, initLoading, initError, fetchFields ] );

    // Seed the shared store with the fetched schema for product id 0.
    useInitProductEditor( NEW_PRODUCT_ID, formItems, vendorEarning );

    const { product, fields, isLoading } = useProductEditor(
        NEW_PRODUCT_ID,
        true
    );

    const { updateProduct, saveProduct } = useDispatch( productEditorStore );

    // Flat single-column layout — render only the quick-create subset. DataForm
    // ignores field configs not listed here, so the rest of the schema stays hidden.
    const form = useMemo( () => ( { fields: QUICK_CREATE_FIELDS } ), [] );

    const { validity, isValid } = useFormValidity( product, fields, form );

    const onChange = useCallback(
        ( newData: Record< string, any > ) => {
            updateProduct( NEW_PRODUCT_ID, newData );
            doAction( 'dokan_product_editor_field_changed', {
                productId: NEW_PRODUCT_ID,
                newData,
            } );
        },
        [ updateProduct ]
    );

    const handleConfirm = useCallback( async () => {
        // Quick create always produces a simple draft; vendor finishes from the list.
        updateProduct( NEW_PRODUCT_ID, { type: 'simple', status: 'draft' } );

        // `saveProduct` throws on failure; success means the draft was created.
        try {
            await saveProduct( NEW_PRODUCT_ID );

            // Lets features persist their own data once the draft is saved.
            doAction( 'dokan_product_editor_after_save', NEW_PRODUCT_ID );
        } catch ( err: any ) {
            toast( {
                type: 'error',
                title:
                    err?.message ||
                    __( 'Failed to create product.', 'dokan-lite' ),
            } );
            throw err; // Keep the modal open so the vendor can retry.
        }

        toast( {
            type: 'success',
            title: __( 'Draft product created.', 'dokan-lite' ),
        } );

        // Refresh the listing in place — no navigation.
        onCreated?.();
    }, [ updateProduct, saveProduct, toast, onCreated ] );

    const dialogContent = useMemo( () => {
        if ( initLoading ) {
            return <QuickCreateSkeleton />;
        }

        if ( initError ) {
            return <p className="text-sm text-red-600">{ initError }</p>;
        }

        if ( ! fields.length ) {
            return <></>;
        }

        return (
            <div className="dokan-product-product-editor dokan-layout quick-create-product-editor">
                <form onSubmit={ ( e ) => e.preventDefault() }>
                    <DataForm
                        data={ product }
                        fields={ fields }
                        form={ form }
                        onChange={ onChange }
                        validity={ validity }
                    />
                </form>
            </div>
        );
    }, [ initLoading, initError, fields, product, form, onChange, validity ] );

    return (
        <DokanModal
            isOpen={ isOpen }
            onClose={ onClose }
            namespace="quick-create-product"
            className="min-w-160 min-h-60"
            dialogTitle={ __( 'Add New Product', 'dokan-lite' ) }
            dialogContent={ dialogContent }
            onConfirm={ handleConfirm }
            confirmButtonText={ __( 'Create & Continue', 'dokan-lite' ) }
            confirmButtonDisabled={
                ! isValid || initLoading || !! initError || ! fields.length
            }
            loading={ isLoading }
        />
    );
};

export default QuickCreateModal;
