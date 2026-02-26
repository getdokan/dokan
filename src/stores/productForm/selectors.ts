import { FlatFormItem } from '../../dashboard/product-form/types';
import { ProductFormState } from './types';

export const selectors = {
    getProduct: (
        state: ProductFormState,
        productId: number
    ): Record< string, any > | undefined => state.forms[ productId ]?.product,

    getFormItems: (
        state: ProductFormState,
        productId: number
    ): FlatFormItem[] | undefined => state.forms[ productId ]?.formItems,

    isSubmitting: (
        state: ProductFormState,
        productId: number
    ): boolean => !! state.submitting[ productId ],

    getError: ( state: ProductFormState ): Error | null => state.error,

    hasForm: (
        state: ProductFormState,
        productId: number
    ): boolean => !! state.forms[ productId ],
};
