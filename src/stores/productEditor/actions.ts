import apiFetch from '@wordpress/api-fetch';
import { FormItem } from '../../dashboard/product-editor/types';
import { fieldValueForProduct } from '../../dashboard/product-editor/utils';
import { VariationType, VariationPagination } from './types';

// Action type constants.
export const SET_FORM = 'SET_FORM';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
export const SET_SUBMITTING = 'SET_SUBMITTING';
export const SET_ERROR = 'SET_ERROR';
export const REMOVE_FORM = 'REMOVE_FORM';
export const SET_VARIATIONS = 'SET_VARIATIONS';
export const SET_VARIATION = 'SET_VARIATION';
export const SET_VARIATIONS_LOADING = 'SET_VARIATIONS_LOADING';
export const SET_VARIATIONS_PAGINATION = 'SET_VARIATIONS_PAGINATION';

// Action interfaces.
interface SetFormAction {
    type: typeof SET_FORM;
    productId: number;
    product: Record< string, any >;
    formItems: FormItem[];
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

interface SetVariationsPaginationAction {
    type: typeof SET_VARIATIONS_PAGINATION;
    productId: number;
    pagination: VariationPagination;
}

export type ActionTypes =
    | SetFormAction
    | UpdateProductAction
    | SetSubmittingAction
    | SetErrorAction
    | RemoveFormAction
    | SetVariationsAction
    | SetVariationAction
    | SetVariationsLoadingAction
    | SetVariationsPaginationAction;

interface BatchResponse {
    update?: Array< Record< string, any > >;
    delete?: Array< Record< string, any > >;
}

export const actions = {
    // Plain action creators.
    setForm: (
        productId: number,
        product: Record< string, any >,
        formItems: FormItem[]
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

    setVariationsPagination: (
        productId: number,
        pagination: VariationPagination
    ): SetVariationsPaginationAction => ( {
        type: SET_VARIATIONS_PAGINATION,
        productId,
        pagination,
    } ),

    // Thunk actions for side effects.
    initForm: (
        productId: number,
        formItems: FormItem[],
        vendorEarning: number
    ) => {
        return ( { dispatch }: { dispatch: any } ) => {
            const entries = formItems
                .filter( ( i: FormItem ) => i.type === 'field' )
                .map( ( item: FormItem ) => [
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
                        product_editor: true,
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

                if ( productId ) {
                    const variations = select.getVariations( productId ) || [];
                    const expandedVariations = variations.filter(
                        ( v: VariationType ) => select.hasForm( v.id )
                    );

                    if ( expandedVariations.length > 0 ) {
                        await Promise.all(
                            expandedVariations.map( ( v: VariationType ) => {
                                const variationData = select.getProduct( v.id );
                                if ( variationData ) {
                                    return dispatch(
                                        actions.saveVariation(
                                            v,
                                            variationData
                                        )
                                    );
                                }
                                return Promise.resolve();
                            } )
                        );
                    }
                }
            } catch ( err ) {
                dispatch( actions.setError( err as Error ) );
                throw err;
            } finally {
                dispatch( actions.setSubmitting( productId, false ) );
            }
        };
    },

    batchUpdateProducts( productIds: number[], data: Record< string, any > ) {
        return async ( { dispatch }: { dispatch: any } ) => {
            try {
                const response = ( await apiFetch( {
                    path: '/dokan/v3/products/batch',
                    method: 'POST',
                    data: {
                        update: productIds.map( ( id ) => ( {
                            id,
                            ...data,
                        } ) ),
                    },
                } ) ) as BatchResponse;
                return response;
            } catch ( error ) {
                dispatch( actions.setError( error as Error ) );
                throw error;
            }
        };
    },

    batchDeleteProducts( productIds: number[] ) {
        return async ( { dispatch }: { dispatch: any } ) => {
            try {
                const response = ( await apiFetch( {
                    path: '/dokan/v3/products/batch',
                    method: 'POST',
                    data: {
                        delete: productIds,
                    },
                } ) ) as BatchResponse;
                return response;
            } catch ( error ) {
                dispatch( actions.setError( error as Error ) );
                throw error;
            }
        };
    },

    batchUpdateProductsStatus( productIds: number[], status: string ) {
        return async ( { dispatch }: { dispatch: any } ) => {
            try {
                const response = ( await apiFetch( {
                    path: '/dokan/v3/products/batch',
                    method: 'POST',
                    data: {
                        update: productIds.map( ( id ) => ( {
                            id,
                            status,
                        } ) ),
                    },
                } ) ) as BatchResponse;
                return response;
            } catch ( error ) {
                dispatch( actions.setError( error as Error ) );
                throw error;
            }
        };
    },

    // Re-fetch a single variation's form fields and update the store.
    fetchVariationForm: ( variationId: number ) => {
        return async ( { dispatch }: { dispatch: any } ) => {
            const response = await apiFetch< {
                form_items: FormItem[];
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
                        dispatch( actions.fetchVariationForm( v.id ) )
                    )
            );
        };
    },

    // Variations thunk actions.
    fetchVariations: ( productId: number, page = 1, perPage = 10 ) => {
        return async ( { dispatch }: { dispatch: any } ) => {
            dispatch( actions.setVariationsLoading( productId, true ) );
            try {
                const response = await apiFetch< Response >( {
                    path: `/dokan/v2/products/${ productId }/variations?per_page=${ perPage }&page=${ page }`,
                    // @ts-ignore
                    parse: false,
                } );
                const variations = await response.json();
                const totalCount = parseInt(
                    response.headers.get( 'X-WP-Total' ) || '0',
                    10
                );
                const totalPages = parseInt(
                    response.headers.get( 'X-WP-TotalPages' ) || '1',
                    10
                );

                dispatch(
                    actions.setVariations( productId, variations || [] )
                );
                dispatch(
                    actions.setVariationsPagination( productId, {
                        totalCount,
                        totalPages,
                        currentPage: page,
                        perPage,
                    } )
                );
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
                await dispatch( actions.fetchVariationForm( variation.id ) );
            } catch ( error ) {
                dispatch( actions.setError( error as Error ) );
                throw error;
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

    reorderVariations: ( productId: number, variations: VariationType[] ) => {
        return async ( { dispatch }: { dispatch: any } ) => {
            // Update the store immediately for instant UI feedback.
            dispatch( actions.setVariations( productId, variations ) );

            try {
                await apiFetch( {
                    path: `/dokan/v2/products/${ productId }/variations/batch`,
                    method: 'POST',
                    data: {
                        update: variations.map( ( v, i ) => ( {
                            id: v.id,
                            menu_order: i,
                        } ) ),
                    },
                } );
            } catch ( error ) {
                dispatch( actions.setError( error as Error ) );
                // Re-fetch to restore server state on failure.
                await dispatch( actions.fetchVariations( productId ) );
                throw error;
            }
        };
    },
};
