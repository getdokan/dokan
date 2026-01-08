import { Field } from '@wordpress/dataviews';

export interface DependencyCondition {
    field: string;
    operator: 'equal' | 'not_equal';
    value: string | boolean | number;
}
export interface Section {
    id: string;
    title: string;
    description: string;
    order: number;
    fields: FormField[];
    dependency_condition?: DependencyCondition;
}

export type FormField = {
    id: string;
    name: string;
    title: string;
    help: string;
    placeholder: string;
    help_content: string;
    tooltip: string;
    description: string;
    required: boolean;
    value: any;
    field_type: string;
    options: { label: string; value: string }[] | Record< string, string >;
    errors: string;
    dependency_condition?: DependencyCondition;
    visibility: boolean;
    left_icon?: string;
    right_icon?: string;
} & Field< any >;

export type FieldConfig = Partial< FormField > & {
    type?: string;
    Edit?: any;
    elements?: any[];
    [ key: string ]: any;
};

export type FieldHandler = ( field?: FormField ) => FieldConfig;
