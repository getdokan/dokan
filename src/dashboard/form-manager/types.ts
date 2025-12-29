import { Field } from '@wordpress/dataviews';

export interface Section {
    id: string;
    title: string;
    description: string;
    order: number;
    fields: FormField[];
}

export type FormField = {
    id: string;
    name: string;
    title: string;
    help: string;
    placeholder: string;
    help_content: string;
    description: string;
    required: boolean;
    value: string | number | boolean | null;
    field_type: string;
    options: { label: string; value: string }[] | Record< string, string >;
    errors: string;
    dependency_condition: { [ key: string ]: any };
    visibility: boolean;
} & Field< any >;
