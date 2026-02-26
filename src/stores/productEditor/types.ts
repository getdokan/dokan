import { FlatFormItem } from '../../dashboard/product-editor/types';

export interface FormEntry {
    product: Record< string, any >;
    formItems: FlatFormItem[];
}

export interface ProductEditorState {
    forms: Record< number, FormEntry >;
    submitting: Record< number, boolean >;
    error: Error | null;
}
