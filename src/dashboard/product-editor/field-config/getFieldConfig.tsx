import { DokanTooltip } from '@src/components';
// eslint-disable-next-line
import { __experimentalInputControlPrefixWrapper as InputControlPrefixWrapper } from '@wordpress/components';
import { Info } from 'lucide-react';
import { getFieldConfigFrom } from './index';
import { FormItem } from '../types';
import { resolveDependency } from '../utils';
import { isEmpty, runSchemaValidations } from './validations';
import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { RawHTML } from '@wordpress/element';

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

        let normalizedOptions = [];
        if ( Array.isArray( options ) ) {
            normalizedOptions = [ ...options ]; // Clone to prevent mutation of the original array
        } else {
            normalizedOptions = Object.entries( options ).map(
                ( [ value, label ] ) => ( {
                    label,
                    value,
                } )
            );
        }
        return normalizedOptions;
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

    // For disabled checkbox fields, render a non-interactive checkbox visual
    // inline with the label so the user sees the actual checkbox state instead
    // of the framework's "True"/"False" text from the readOnly render path.
    if ( field.disabled && field.variant === 'checkbox' ) {
        const rawLabel = field.label;
        ( mappedField as any ).render = ( { item }: any ) => {
            const checked = !! ( item?.[ field.id ] ?? field.value );
            return (
                <div className="flex items-center gap-2 cursor-not-allowed text-sm">
                    <input
                        type="checkbox"
                        checked={ checked }
                        disabled
                        readOnly
                        aria-label={
                            typeof rawLabel === 'string' ? rawLabel : ''
                        }
                    />
                    <RawHTML>{ decodeEntities( rawLabel ) }</RawHTML>
                </div>
            );
        };
        // Suppress the framework's VisualLabel above the render to avoid
        // duplicating the message text. An empty fragment is truthy so the
        // framework doesn't fall back to `field.id`, but renders to nothing.
        ( mappedField as any ).label = <></>;
    }

    const customData: Record< string, any > = {
        ...field,
        rawLabel: field.label,
        multiple: 'multiple' in specificConfig,
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
