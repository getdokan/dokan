import { DokanTooltip } from '@src/components';
// eslint-disable-next-line
import { __experimentalInputControlPrefixWrapper as InputControlPrefixWrapper } from '@wordpress/components';
import { Info } from 'lucide-react';
import { getFieldConfigFrom } from './index';
import { FormItem } from '../types';
import { isEmpty, resolveDependency } from '../utils';
import { runSchemaValidations } from './validations';
import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { RawHTML } from '@wordpress/element';

// A select option; tree fields (e.g. categories) nest deeper options under `children`.
type FieldOption = {
    label: string;
    value?: string | number;
    children?: FieldOption[];
};

export const getFieldConfig = ( field: FormItem ) => {
    /**
     * Helper function to normalize options into an array of label/value objects.
     * @param fieldItem
     */
    const getElementsFromOptions = ( fieldItem?: FormItem ) => {
        const { options } = fieldItem || {};
        if ( ! options ) {
            return [];
        }

        // Term names arrive HTML-encoded from the schema; decode the whole tree so options and chips read naturally.
        const decodeOption = ( option: FieldOption ): FieldOption => ( {
            ...option,
            label: decodeEntities( option.label ),
            ...( Array.isArray( option.children )
                ? { children: option.children.map( decodeOption ) }
                : {} ),
        } );

        if ( Array.isArray( options ) ) {
            return options.map( decodeOption );
        }

        return Object.entries( options ).map( ( [ value, label ] ) => ( {
            label: decodeEntities( label ),
            value,
        } ) );
    };
    const mappedField = {
        ...field,
        readOnly: field.disabled || false,
        label: (
            <div className="flex gap-1 items-center">
                <RawHTML className="dokan-form-field-label">
                    { decodeEntities( field.label ) }
                </RawHTML>
                { field.tooltip && (
                    <DokanTooltip content={ field.tooltip }>
                        <Info size={ 16 } />
                    </DokanTooltip>
                ) }
            </div>
        ),
        type: field.variant,
        placeholder: field.placeholder,
        elements: getElementsFromOptions( field ),
        isValid: {
            // Required is handled in custom so invisible fields are skipped.
            required: field.required || false,
            // Disable built-in "Value must be one of the elements." so custom validation is used.
            elements: false,
            custom: ( value: any ) => {
                // Skip validation for fields that are not visible.
                const isVisible =
                    field.visibility !== false &&
                    resolveDependency( field, value );

                if (
                    field.required &&
                    isVisible &&
                    isEmpty( value?.[ field.id ] )
                ) {
                    return __( 'Please fill out this field.', 'dokan-lite' );
                }

                if ( ! isVisible ) {
                    return null;
                }

                // 1. Schema-driven validations (from PHP `validations` key).
                const schemaError = runSchemaValidations( field, value );
                if ( schemaError ) {
                    return schemaError;
                }

                return null;
            },
        },
        isVisible: ( data: Record< string, any > ) => {
            if ( field.visibility === false ) {
                return false;
            }
            return resolveDependency( field, data );
        },
    };

    const specificConfig = getFieldConfigFrom( field );
    Object.assign( mappedField, specificConfig );

    // If the field defines a prefix string, use the built-in text control with a prefix addon.
    if ( field.prefix && ! specificConfig.Edit ) {
        const prefixValue = field.prefix;
        const PrefixComponent = () => (
            <InputControlPrefixWrapper>
                <span
                    title={ prefixValue }
                    className="text-gray-500 whitespace-nowrap"
                >
                    { prefixValue }
                </span>
            </InputControlPrefixWrapper>
        );
        ( mappedField as any ).Edit = {
            control: 'text',
            prefix: PrefixComponent,
        };
    }

    if ( field.description ) {
        mappedField.description = (
            <span
                dangerouslySetInnerHTML={ {
                    __html: field.description as string,
                } }
            />
        );
    }

    const customData: Record< string, any > = {
        ...field,
        rawLabel: field.label,
        multiple: specificConfig.multiple || false,
    };

    const OriginalEdit = ( mappedField as any ).Edit;
    if ( typeof OriginalEdit === 'function' ) {
        return {
            ...mappedField,
            Edit: ( props: any ) => (
                <OriginalEdit
                    { ...props }
                    field={ { ...customData, ...props.field } }
                />
            ),
        };
    }

    return mappedField;
};
