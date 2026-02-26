import { ProductVariationState } from './types';
import { DEFAULT_STATE } from './state';
import {
    ActionTypes,
    SET_VARIATIONS,
    SET_VARIATION,
    SET_LOADING,
    SET_ERROR,
} from './actions';

export const reducer = (
    state: ProductVariationState = DEFAULT_STATE,
    action: ActionTypes
): ProductVariationState => {
    switch ( action.type ) {
        case SET_VARIATIONS:
            return {
                ...state,
                items: {
                    ...state.items,
                    [ action.productId ]: action.variations,
                },
                error: null,
            };

        case SET_VARIATION: {
            const existing = state.items[ action.productId ];
            if ( ! existing ) {
                return state;
            }
            const index = existing.findIndex(
                ( v ) => v.id === action.variation.id
            );
            if ( index === -1 ) {
                return state;
            }
            const updated = [ ...existing ];
            updated[ index ] = action.variation;
            return {
                ...state,
                items: {
                    ...state.items,
                    [ action.productId ]: updated,
                },
            };
        }

        case SET_LOADING:
            return {
                ...state,
                loading: {
                    ...state.loading,
                    [ action.productId ]: action.isLoading,
                },
            };

        case SET_ERROR:
            return {
                ...state,
                error: action.error,
            };

        default:
            return state;
    }
};
