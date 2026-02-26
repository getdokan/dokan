import apiFetch from '@wordpress/api-fetch';
import { VariationType } from './types';

// Action type constants.
export const SET_VARIATIONS = 'SET_VARIATIONS';
export const SET_VARIATION = 'SET_VARIATION';
export const SET_LOADING = 'SET_LOADING';
export const SET_ERROR = 'SET_ERROR';

// Action interfaces.
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

interface SetLoadingAction {
    type: typeof SET_LOADING;
    productId: number;
    isLoading: boolean;
}

interface SetErrorAction {
    type: typeof SET_ERROR;
    error: Error | null;
}

export type ActionTypes =
    | SetVariationsAction
    | SetVariationAction
    | SetLoadingAction
    | SetErrorAction;

export const actions = {
    // Plain action creators.
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

    setLoading: (
        productId: number,
        isLoading: boolean
    ): SetLoadingAction => ( {
        type: SET_LOADING,
        productId,
        isLoading,
    } ),

    setError: ( error: Error | null ): SetErrorAction => ( {
        type: SET_ERROR,
        error,
    } ),

    // Thunk actions for async operations.
    fetchVariations:
        ( productId: number ) =>
        async ( { dispatch }: { dispatch: any } ) => {
            dispatch( actions.setLoading( productId, true ) );
            try {
                const response: any = await apiFetch( {
                    path: `/dokan/v2/products/${ productId }/variations`,
                } );
                dispatch( actions.setVariations( productId, response || [] ) );
            } catch ( error ) {
                dispatch( actions.setError( error as Error ) );
                throw error;
            } finally {
                dispatch( actions.setLoading( productId, false ) );
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
