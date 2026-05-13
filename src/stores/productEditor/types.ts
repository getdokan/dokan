import {
    FormItem,
    VariationType,
} from '../../dashboard/product-editor/types';

export type { VariationType };

export interface FormEntry {
    product: Record< string, any >;
    formItems: FormItem[];
}

export interface VariationPagination {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
}

export interface ProductEditorState {
    forms: Record< number, FormEntry >;
    submitting: Record< number, boolean >;
    variations: Record< number, VariationType[] >;
    variationsLoading: Record< number, boolean >;
    variationsPagination: Record< number, VariationPagination >;
    error: Error | null;
}
