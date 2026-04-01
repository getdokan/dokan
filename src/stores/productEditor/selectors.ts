import {
    FormItem,
    VariationType,
} from '../../dashboard/product-editor/types';
import { ProductEditorState } from './types';

export const selectors = {
    getProduct: (
        state: ProductEditorState,
        productId: number
    ): Record< string, any > | undefined => state.forms[ productId ]?.product,

    getFormItems: (
        state: ProductEditorState,
        productId: number
    ): FormItem[] | undefined => state.forms[ productId ]?.formItems,

    isSubmitting: ( state: ProductEditorState, productId: number ): boolean => {
        return !! state.submitting[ productId ];
    },

    hasForm: ( state: ProductEditorState, productId: number ): boolean => {
        return !! state.forms[ productId ];
    },

    // Variations selectors.
    getVariations: (
        state: ProductEditorState,
        productId: number
    ): VariationType[] | undefined => state.variations[ productId ],

    isVariationsLoading: (
        state: ProductEditorState,
        productId: number
    ): boolean => !! state.variationsLoading[ productId ],

    getError: ( state: ProductEditorState ): Error | null => state.error,
};
