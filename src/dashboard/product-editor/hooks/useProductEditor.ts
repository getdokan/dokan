import { useToast } from '@getdokan/dokan-ui';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
// @ts-ignore
import productEditorStore from '@dokan/stores/product-editor';
import { getFieldConfig } from '../components/FieldRenderer';
import { FlatFormItem } from '../types';
import { resolveLabel, resolveVisibility } from '../utils';

/**
 * Hook that provides product editor state and actions from the Redux store.
 * Drop-in replacement for the old useFormContext().
 */
export function useProductEditor( productId: number ) {
    const toast = useToast();

    const { product, formItems, isLoading } = useSelect(
        ( select ) => ( {
            product: select( productEditorStore ).getProduct( productId ),
            formItems: select( productEditorStore ).getFormItems( productId ),
            isLoading: select( productEditorStore ).isSubmitting( productId ),
        } ),
        [ productId ]
    );

    const { updateProduct, saveProduct } = useDispatch( productEditorStore );

    // Compute fields from formItems + product type (produces JSX, stays in hook).
    const currentProductType = product?.type || 'simple';
    const fields = useMemo( () => {
        if ( ! formItems ) {
            return [];
        }
        return formItems
            .filter( ( i: FlatFormItem ) => i.type === 'field' )
            .map( ( item: FlatFormItem ) => {
                const field = {
                    ...item,
                    label: resolveLabel( item, currentProductType ),
                    visibility: resolveVisibility( item, currentProductType ),
                };
                return getFieldConfig( field as any );
            } );
    }, [ formItems, currentProductType ] );

    const onChange = useCallback(
        ( newData: Record< string, any > ) => {
            updateProduct( productId, newData );
        },
        [ productId, updateProduct ]
    );

    const submitHandler = useCallback(
        async ( e: any ) => {
            if ( e?.preventDefault ) {
                e.preventDefault();
                e.stopPropagation();
            }
            try {
                await saveProduct( productId );
                toast( {
                    type: 'success',
                    title: __( 'Product saved successfully.', 'dokan-lite' ),
                } );
            } catch ( err: any ) {
                toast( {
                    type: 'error',
                    title:
                        err.message ||
                        __( 'Error saving product.', 'dokan-lite' ),
                } );
                throw err;
            }
        },
        [ productId, saveProduct, toast ]
    );

    return {
        product: product || {},
        fields,
        formItems: formItems || [],
        onChange,
        submitHandler,
        isLoading,
    };
}

/**
 * Hook to initialize a product editor form in the store.
 * Call once on mount to set up the form entry.
 */
export function useInitProductEditor(
    productId: number,
    formItems: FlatFormItem[],
    vendorEarning: number
) {
    const { initForm } = useDispatch( productEditorStore );
    const hasForm = useSelect(
        ( select ) => select( productEditorStore ).hasForm( productId ),
        [ productId ]
    );

    useEffect( () => {
        if ( ! hasForm && formItems.length > 0 ) {
            initForm( productId, formItems, vendorEarning );
        }
    }, [ productId, formItems, vendorEarning, hasForm, initForm ] );
}
