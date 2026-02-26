import { FlatFormItem } from '../../dashboard/product-editor/types';
import { ProductEditorState } from './types';

export const selectors = {
    getProduct: (
        state: ProductEditorState,
        productId: number
    ): Record< string, any > | undefined => state.forms[ productId ]?.product,

    getFormItems: (
        state: ProductEditorState,
        productId: number
    ): FlatFormItem[] | undefined => state.forms[ productId ]?.formItems,

    isSubmitting: (
        state: ProductEditorState,
        productId: number
    ): boolean => !! state.submitting[ productId ],

    getError: ( state: ProductEditorState ): Error | null => state.error,

    hasForm: (
        state: ProductEditorState,
        productId: number
    ): boolean => !! state.forms[ productId ],
};
