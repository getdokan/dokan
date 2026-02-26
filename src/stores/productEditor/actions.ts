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

/**
 * Strip empty-string values before sending to the API.
 */
const transformPayload = ( product: Record< string, any > ) => {
    const copy = { ...product };
    Object.keys( copy ).forEach( ( key ) => {
        if ( copy[ key ] === '' ) {
            delete copy[ key ];
        }
    } );
    return copy;
};

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
    initForm:
        (
            productId: number,
            formItems: FlatFormItem[],
            vendorEarning: number
        ) =>
        ( { dispatch }: { dispatch: any } ) => {
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
        },

    saveProduct:
        ( productId: number ) =>
        async ( { dispatch, select }: { dispatch: any; select: any } ) => {
            dispatch( actions.setSubmitting( productId, true ) );
            try {
                const product = select.getProduct( productId );
                await apiFetch( {
                    path: `dokan/v3/products/${ productId ? productId : '' }`,
                    method: productId ? 'PUT' : 'POST',
                    data: transformPayload( { ...product } ),
                } );
            } catch ( err ) {
                dispatch( actions.setError( err as Error ) );
                throw err;
            } finally {
                dispatch( actions.setSubmitting( productId, false ) );
            }
        },

    // Variations thunk actions.
    fetchVariations:
        ( productId: number ) =>
        async ( { dispatch }: { dispatch: any } ) => {
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
        },

    saveVariation:
        ( variation: VariationType, data: Record< string, any > ) =>
        async ( { dispatch }: { dispatch: any } ) => {
            try {
                const payload: Record< string, any > = { ...data };

                // Map variation attributes to WC REST format.
                if ( variation.attributes?.length ) {
                    payload.attributes = variation.attributes
                        .filter( ( attr ) => attr.selected_value )
                        .map( ( attr ) => ( {
                            name: attr.value,
                            option: attr.selected_value?.value || '',
                        } ) );
                }

                await apiFetch( {
                    path: `/dokan/v2/products/${ variation.parent_id }/variations/${ variation.id }`,
                    method: 'PUT',
                    data: payload,
                } );
            } catch ( error ) {
                dispatch( actions.setError( error as Error ) );
                throw error;
            }
        },

    generateVariations:
        ( productId: number ) =>
        async ( { dispatch }: { dispatch: any } ) => {
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
        },

    addVariation:
        ( productId: number ) =>
        async ( { dispatch }: { dispatch: any } ) => {
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
        },

    removeVariation:
        ( variation: VariationType ) =>
        async ( { dispatch }: { dispatch: any } ) => {
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
        },
};
