import {
    FormItem,
    VariationType,
} from '../../dashboard/product-editor/types';

export type { VariationType };

export interface FormEntry {
    product: Record< string, any >;
    formItems: FormItem[];
}

export interface ProductEditorState {
    forms: Record< number, FormEntry >;
    submitting: Record< number, boolean >;
    variations: Record< number, VariationType[] >;
    variationsLoading: Record< number, boolean >;
    error: Error | null;
}
