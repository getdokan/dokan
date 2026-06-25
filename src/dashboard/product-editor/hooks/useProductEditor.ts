import { useToast } from '@getdokan/dokan-ui';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
// @ts-ignore
import productEditorStore from '@dokan/stores/product-editor';
import { getFieldConfig } from '../field-config';
import { Attribute, DefaultAttribute, FormItem } from '../types';
import { resolveLabel, resolveRequired, resolveVisibility } from '../utils';
import { doAction } from '@wordpress/hooks';

/**
 * Hook that provides product editor state and actions from the Redux store.
 * Drop-in replacement for the old useFormContext().
 */

type ProductEditorValue = {
    product: Record< string, any >;
    fields: any[];
    formItems: FormItem[];
    onChange: ( newData: Record< string, any > ) => void;
    submitHandler: ( e: any ) => Promise< void >;
    isLoading: boolean;
    defaultAttributes: DefaultAttribute[];
    getDefaultValue: (
        attr: Attribute
    ) => { label: string; value: string } | null;
    handleDefaultChange: ( attr: Attribute, selectedOption: any ) => void;
};
export function useProductEditor(
    productId: number,
    isNewProduct = false
): ProductEditorValue {
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
            .filter( ( i: FormItem ) => i.type === 'field' )
            .map( ( item: FormItem ) => {
                const field = {
                    ...item,
                    label: resolveLabel( item, currentProductType ),
                    visibility: resolveVisibility( item, currentProductType ),
                    required: resolveRequired( item, currentProductType ),
                };
                return getFieldConfig( field );
            } );
    }, [ formItems, currentProductType ] );

    const onChange = useCallback(
        ( newData: Record< string, any > ) => {
            updateProduct( productId, newData );
            doAction( 'dokan_product_editor_field_changed', {
                productId,
                newData,
            } );
        },
        [ productId, updateProduct ]
    );

    // Initialize default_attributes from attributes' default values on first load.
    const attributes: Attribute[] = useMemo(
        () => product?.attributes || [],
        [ product?.attributes ]
    );
    const variationAttributes = useMemo(
        () => attributes.filter( ( attr ) => attr.variation ),
        [ attributes ]
    );

    useEffect( () => {
        if ( product?.default_attributes !== undefined ) {
            return;
        }
        if ( ! variationAttributes.length ) {
            return;
        }
        const defaults = variationAttributes
            .filter( ( attr ) => attr.default )
            .map( ( attr ) => ( {
                id: attr.id,
                name: attr.name,
                option: attr.default!,
            } ) );
        onChange( { default_attributes: defaults } );
    }, [ product?.default_attributes, variationAttributes, onChange ] );

    const defaultAttributes: DefaultAttribute[] = useMemo(
        () => product?.default_attributes || [],
        [ product?.default_attributes ]
    );

    const getDefaultValue = useCallback(
        ( attr: Attribute ) => {
            const found = defaultAttributes.find(
                ( d ) => d.name === attr.name
            );
            if ( ! found || ! found.option ) {
                return null;
            }
            return { label: found.option, value: found.option };
        },
        [ defaultAttributes ]
    );

    const handleDefaultChange = useCallback(
        ( attr: Attribute, selectedOption: any ) => {
            // eslint-disable-next-line
            const option = selectedOption
                ? typeof selectedOption === 'string'
                    ? selectedOption
                    : selectedOption.label || selectedOption.value || ''
                : '';

            let newDefaults: DefaultAttribute[];

            if ( option ) {
                const existingIndex = defaultAttributes.findIndex(
                    ( d ) => d.name === attr.name
                );
                if ( existingIndex >= 0 ) {
                    newDefaults = [ ...defaultAttributes ];
                    newDefaults[ existingIndex ] = {
                        id: attr.id,
                        name: attr.name,
                        option,
                    };
                } else {
                    newDefaults = [
                        ...defaultAttributes,
                        { id: attr.id, name: attr.name, option },
                    ];
                }
            } else {
                newDefaults = defaultAttributes.filter(
                    ( d ) => d.name !== attr.name
                );
            }

            onChange( { default_attributes: newDefaults } );
        },
        [ defaultAttributes, onChange ]
    );

    const submitHandler = useCallback(
        async ( e: any ) => {
            if ( e?.preventDefault ) {
                e.preventDefault();
                e.stopPropagation();
            }
            try {
                await saveProduct( productId );

                // Lets features persist their own data once the product has been saved.
                doAction( 'dokan_product_editor_after_save', productId );

                toast( {
                    type: 'success',
                    title: __( 'Product saved successfully.', 'dokan-lite' ),
                } );

                // Reload so the server-rendered data (is_new_product, status, etc.) refreshes.
                if ( isNewProduct ) {
                    window.location.href =
                        // @ts-ignore
                        window.dokanProductEditor.products_url;
                }
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
        [ productId, saveProduct, toast, isNewProduct ]
    );

    return {
        product: product || {},
        fields,
        formItems: formItems || [],
        onChange,
        submitHandler,
        isLoading,
        defaultAttributes,
        getDefaultValue,
        handleDefaultChange,
    };
}

/**
 * Hook to initialize a product editor form in the store.
 * Call once on mount to set up the form entry.
 */

export function useInitProductEditor(
    productId: number,
    formItems: FormItem[],
    vendorEarning: number
) {
    const { initForm } = useDispatch( productEditorStore );

    useEffect( () => {
        // Re-init when freshly-fetched form items arrive (App re-fetches per product on navigation). Without this, returning to a product after save reused a stale cached form, so file fields showed empty until a full reload.
        if ( formItems.length > 0 ) {
            initForm( productId, formItems, vendorEarning );
        }
    }, [ productId, formItems, vendorEarning, initForm ] );
}
