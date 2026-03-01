import { useToast } from '@getdokan/dokan-ui';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
// @ts-ignore
import productEditorStore from '@dokan/stores/product-editor';
import { getFieldConfig } from '../components/FieldRenderer';
import { Attribute, DefaultAttribute, FlatFormItem } from '../types';
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

    // Initialize default_attributes from attributes' default values on first load.
    const attributes: Attribute[] = product?.attributes || [];
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

    const defaultAttributes: DefaultAttribute[] =
        product?.default_attributes || [];

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
