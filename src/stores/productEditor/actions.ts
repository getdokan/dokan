import apiFetch from '@wordpress/api-fetch';
import { FlatFormItem } from '../../dashboard/product-editor/types';
import { fieldValueForProduct } from '../../dashboard/product-editor/utils';
import { VariationType } from './types';

// Action type constants.
export const SET_FORM = 'SET_FORM';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
export const SET_SUBMITTING = 'SET_SUBMITTING';
export const SET_ERROR = 'SET_ERROR';
export const REMOVE_FORM = 'REMOVE_FORM';
export const SET_VARIATIONS = 'SET_VARIATIONS';
export const SET_VARIATION = 'SET_VARIATION';
export const SET_VARIATIONS_LOADING = 'SET_VARIATIONS_LOADING';

// Action interfaces.
interface SetFormAction {
    type: typeof SET_FORM;
    productId: number;
    product: Record< string, any >;
    formItems: FlatFormItem[];
}

interface UpdateProductAction {
    type: typeof UPDATE_PRODUCT;
    productId: number;
    data: Record< string, any >;
}

interface SetSubmittingAction {
    type: typeof SET_SUBMITTING;
    productId: number;
    isSubmitting: boolean;
}

interface SetErrorAction {
    type: typeof SET_ERROR;
    error: Error | null;
}

interface RemoveFormAction {
    type: typeof REMOVE_FORM;
    productId: number;
}

interface SetVariationsAction {
    type: typeof SET_VARIATIONS;
    productId: number;
    variations: VariationType[];
}

interface SetVariationAction {
    type: typeof SET_VARIATION;
    productId: number;
    variation: VariationType;
}

interface SetVariationsLoadingAction {
    type: typeof SET_VARIATIONS_LOADING;
    productId: number;
    isLoading: boolean;
}

export type ActionTypes =
    | SetFormAction
    | UpdateProductAction
    | SetSubmittingAction
    | SetErrorAction
    | RemoveFormAction
    | SetVariationsAction
    | SetVariationAction
    | SetVariationsLoadingAction;

export const actions = {
    // Plain action creators.
    setForm: (
        productId: number,
        product: Record< string, any >,
        formItems: FlatFormItem[]
    ): SetFormAction => ( {
        type: SET_FORM,
        productId,
        product,
        formItems,
    } ),

    updateProduct: (
        productId: number,
        data: Record< string, any >
    ): UpdateProductAction => ( {
        type: UPDATE_PRODUCT,
        productId,
        data,
    } ),

    setSubmitting: (
        productId: number,
        isSubmitting: boolean
    ): SetSubmittingAction => ( {
        type: SET_SUBMITTING,
        productId,
        isSubmitting,
    } ),

    setError: ( error: Error | null ): SetErrorAction => ( {
        type: SET_ERROR,
        error,
    } ),

    removeForm: ( productId: number ): RemoveFormAction => ( {
        type: REMOVE_FORM,
        productId,
    } ),

    // Variations plain action creators.
    setVariations: (
        productId: number,
        variations: VariationType[]
    ): SetVariationsAction => ( {
        type: SET_VARIATIONS,
        productId,
        variations,
    } ),

    setVariation: (
        productId: number,
        variation: VariationType
    ): SetVariationAction => ( {
        type: SET_VARIATION,
        productId,
        variation,
    } ),

    setVariationsLoading: (
        productId: number,
        isLoading: boolean
    ): SetVariationsLoadingAction => ( {
        type: SET_VARIATIONS_LOADING,
        productId,
        isLoading,
    } ),

    // Thunk actions for side effects.
    initForm: (
        productId: number,
        formItems: FlatFormItem[],
        vendorEarning: number
    ) => {
        return ( { dispatch }: { dispatch: any } ) => {
            const entries = formItems
                .filter( ( i: FlatFormItem ) => i.type === 'field' )
                .map( ( item: FlatFormItem ) => [
                    item.id,
                    fieldValueForProduct( item ),
                ] );
            const defaultData = Object.fromEntries( entries );

            dispatch(
                actions.setForm(
                    productId,
                    {
                        ...defaultData,
                        id: productId,
                        vendor_earning: vendorEarning,
                        form_manager: true,
                    },
                    formItems
                )
            );
        };
    },

    saveProduct: ( productId: number ) => {
        return async ( {
            dispatch,
            select,
        }: {
            dispatch: any;
            select: any;
        } ) => {
            dispatch( actions.setSubmitting( productId, true ) );
            try {
                const product = select.getProduct( productId );
                await apiFetch( {
                    path: `dokan/v3/products/${ productId ? productId : '' }`,
                    method: productId ? 'PUT' : 'POST',
                    data: product,
                } );
            } catch ( err ) {
                dispatch( actions.setError( err as Error ) );
                throw err;
            } finally {
                dispatch( actions.setSubmitting( productId, false ) );
            }
        };
    },

    // Re-fetch a single variation's form fields and update the store.
    fetchVariationForm: ( variationId: number ) => {
        return async ( { dispatch }: { dispatch: any } ) => {
            const response = await apiFetch< {
                form_items: FlatFormItem[];
                vendor_earning: number;
            } >( {
                path: `/dokan/v3/products/${ variationId }/fields`,
            } );
            dispatch(
                actions.initForm(
                    variationId,
                    response.form_items ?? [],
                    response.vendor_earning ?? 0
                )
            );
        };
    },

    // Re-fetch form fields for all expanded variations of a product.
    refreshExpandedForms: ( productId: number ) => {
        return async ( {
            dispatch,
            select,
        }: {
            dispatch: any;
            select: any;
        } ) => {
            const variations = select.getVariations( productId ) || [];
            await Promise.all(
                variations
                    .filter( ( v: VariationType ) => select.hasForm( v.id ) )
                    .map( ( v: VariationType ) =>
                        dispatch( actions.fetchVariationForm( v.id ) ).catch(
                            console.error
                        )
                    )
            );
        };
    },

    // Variations thunk actions.
    fetchVariations: ( productId: number ) => {
        return async ( { dispatch }: { dispatch: any } ) => {
            dispatch( actions.setVariationsLoading( productId, true ) );
            try {
                const response: any = await apiFetch( {
                    path: `/dokan/v2/products/${ productId }/variations`,
                } );
                dispatch( actions.setVariations( productId, response || [] ) );
            } catch ( error ) {
                dispatch( actions.setError( error as Error ) );
                throw error;
            } finally {
                dispatch( actions.setVariationsLoading( productId, false ) );
            }
        };
    },

    saveVariation: (
        variation: VariationType,
        data: Record< string, any >
    ) => {
        return async ( { dispatch }: { dispatch: any } ) => {
            dispatch(
                actions.setVariationsLoading( variation.parent_id, true )
            );
            try {
                const payload: Record< string, any > = { ...data };

                // Map variation attributes to WC REST format.
                if ( variation.attributes?.length ) {
                    payload.attributes = variation.attributes
                        .filter( ( attr ) => attr.selected_value )
                        .map( ( attr ) => ( {
                            name: attr.value,
                            option: attr.selected_value?.label || '',
                        } ) );
                }

                await apiFetch( {
                    path: `/dokan/v2/products/${ variation.parent_id }/variations/${ variation.id }`,
                    method: 'PUT',
                    data: payload,
                } );

                // Re-fetch variation form fields to reflect updated values.
                await dispatch(
                    actions.fetchVariationForm( variation.id )
                );
            } catch ( error ) {
                dispatch( actions.setError( error as Error ) );
                throw error;
            } finally {
                dispatch(
                    actions.setVariationsLoading( variation.parent_id, false )
                );
            }
        };
    },

    generateVariations: ( productId: number ) => {
        return async ( { dispatch }: { dispatch: any } ) => {
            try {
                await apiFetch( {
                    path: `/dokan/v2/products/${ productId }/variations/generate`,
                    method: 'POST',
                    data: { delete: true },
                } );
                await dispatch( actions.fetchVariations( productId ) );
            } catch ( error ) {
                dispatch( actions.setError( error as Error ) );
                throw error;
            }
        };
    },

    addVariation: ( productId: number ) => {
        return async ( { dispatch }: { dispatch: any } ) => {
            try {
                await apiFetch( {
                    path: `/dokan/v2/products/${ productId }/variations`,
                    method: 'POST',
                    data: { regular_price: '' },
                } );
                await dispatch( actions.fetchVariations( productId ) );
            } catch ( error ) {
                dispatch( actions.setError( error as Error ) );
                throw error;
            }
        };
    },

    removeVariation: ( variation: VariationType ) => {
        return async ( { dispatch }: { dispatch: any } ) => {
            try {
                await apiFetch( {
                    path: `/dokan/v2/products/${ variation.parent_id }/variations/${ variation.id }`,
                    method: 'DELETE',
                    data: { force: true },
                } );
                await dispatch(
                    actions.fetchVariations( variation.parent_id )
                );
            } catch ( error ) {
                dispatch( actions.setError( error as Error ) );
                throw error;
            }
        };
    },

    bulkEditVariations: (
        productId: number,
        bulkAction: string,
        data: Record< string, any > = {}
    ) => {
        return async ( { dispatch }: { dispatch: any } ) => {
            dispatch( actions.setVariationsLoading( productId, true ) );
            try {
                const dokanGlobal = ( window as any ).dokan;
                const formData = new FormData();
                formData.append( 'action', 'dokan_bulk_edit_variations' );
                formData.append(
                    'security',
                    dokanGlobal.bulk_edit_variations_nonce
                );
                formData.append( 'product_id', String( productId ) );
                formData.append( 'bulk_action', bulkAction );
                Object.entries( data ).forEach( ( [ key, value ] ) => {
                    formData.append( `data[${ key }]`, String( value ) );
                } );

                const response = await fetch( dokanGlobal.ajaxurl, {
                    method: 'POST',
                    body: formData,
                } );

                if ( ! response.ok ) {
                    throw new Error( 'Bulk edit failed' );
                }

                await dispatch( actions.fetchVariations( productId ) );

                // Re-fetch form fields for expanded variations so they reflect the updated values.
                await dispatch( actions.refreshExpandedForms( productId ) );
            } catch ( error ) {
                dispatch( actions.setError( error as Error ) );
                throw error;
            } finally {
                dispatch( actions.setVariationsLoading( productId, false ) );
            }
        };
    },
};
