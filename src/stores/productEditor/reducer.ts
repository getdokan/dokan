import { ProductEditorState } from './types';
import { DEFAULT_STATE } from './state';
import {
    ActionTypes,
    SET_FORM,
    UPDATE_PRODUCT,
    SET_SUBMITTING,
    SET_ERROR,
    REMOVE_FORM,
    SET_VARIATIONS,
    SET_VARIATION,
    SET_VARIATIONS_LOADING,
    SET_VARIATIONS_PAGINATION,
} from './actions';

export const reducer = (
    state: ProductEditorState = DEFAULT_STATE,
    action: ActionTypes
): ProductEditorState => {
    switch ( action.type ) {
        case SET_FORM:
            return {
                ...state,
                forms: {
                    ...state.forms,
                    [ action.productId ]: {
                        product: action.product,
                        formItems: action.formItems,
                    },
                },
                error: null,
            };

        case UPDATE_PRODUCT: {
            const existing = state.forms[ action.productId ];
            if ( ! existing ) {
                return state;
            }
            return {
                ...state,
                forms: {
                    ...state.forms,
                    [ action.productId ]: {
                        ...existing,
                        product: {
                            ...existing.product,
                            ...action.data,
                        },
                    },
                },
            };
        }

        case SET_SUBMITTING:
            return {
                ...state,
                submitting: {
                    ...state.submitting,
                    [ action.productId ]: action.isSubmitting,
                },
            };

        case SET_ERROR:
            return {
                ...state,
                error: action.error,
            };

        case REMOVE_FORM: {
            const { [ action.productId ]: _, ...remainingForms } = state.forms;
            const { [ action.productId ]: __, ...remainingSubmitting } =
                state.submitting;
            return {
                ...state,
                forms: remainingForms,
                submitting: remainingSubmitting,
            };
        }

        case SET_VARIATIONS:
            return {
                ...state,
                variations: {
                    ...state.variations,
                    [ action.productId ]: action.variations,
                },
                error: null,
            };

        case SET_VARIATION: {
            const existing = state.variations[ action.productId ];
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
                variations: {
                    ...state.variations,
                    [ action.productId ]: updated,
                },
            };
        }

        case SET_VARIATIONS_LOADING:
            return {
                ...state,
                variationsLoading: {
                    ...state.variationsLoading,
                    [ action.productId ]: action.isLoading,
                },
            };

        case SET_VARIATIONS_PAGINATION:
            return {
                ...state,
                variationsPagination: {
                    ...state.variationsPagination,
                    [ action.productId ]: action.pagination,
                },
            };

        default:
            return state;
    }
};
