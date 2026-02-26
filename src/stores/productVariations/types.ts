import { VariationType } from '../../dashboard/product-form/types';

export type { VariationType };

export interface ProductVariationState {
    items: Record< number, VariationType[] >;
    loading: Record< number, boolean >;
    error: Error | null;
}
