import { ProductVariationState, VariationType } from './types';

export const selectors = {
    getVariations: (
        state: ProductVariationState,
        productId: number
    ): VariationType[] | undefined => state.items[ productId ],

    isLoading: (
        state: ProductVariationState,
        productId: number
    ): boolean => !! state.loading[ productId ],

    getError: ( state: ProductVariationState ): Error | null => state.error,
};
