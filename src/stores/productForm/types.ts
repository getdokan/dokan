import { FlatFormItem } from '../../dashboard/product-form/types';

export interface FormEntry {
    product: Record< string, any >;
    formItems: FlatFormItem[];
}

export interface ProductFormState {
    forms: Record< number, FormEntry >;
    submitting: Record< number, boolean >;
    error: Error | null;
}
