import { ProductFormState } from './types';
import { DEFAULT_STATE } from './state';
import {
    ActionTypes,
    SET_FORM,
    UPDATE_PRODUCT,
    SET_SUBMITTING,
    SET_ERROR,
    REMOVE_FORM,
} from './actions';

export const reducer = (
    state: ProductFormState = DEFAULT_STATE,
    action: ActionTypes
): ProductFormState => {
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

        default:
            return state;
    }
};
