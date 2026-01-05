import { DokanTooltip } from '@src/components';
import { sanitizeHTML } from '@src/utilities';
import { Info } from 'lucide-react';
import { FormField } from '../types';
import { getFieldConfigFromFactory } from '../factories';

export const getFieldConfig = ( field: FormField ) => {
    const mappedField = {
        ...field,
        label: (
            <div className="flex gap-1">
                <span
                    dangerouslySetInnerHTML={ {
                        __html: sanitizeHTML( field.title ),
                    } }
                />
                { field.tooltip && (
                    <DokanTooltip content={ field.tooltip }>
                        <Info size={ 16 } />
                    </DokanTooltip>
                ) }
            </div>
        ),
        description: (
            <span
                dangerouslySetInnerHTML={ {
                    __html: sanitizeHTML(
                        field.help_content || field.description
                    ),
                } }
            />
        ),
        placeholder: field.placeholder,
        required: field.required,
        type: field.field_type,
        multiple: false,
    };

    const specificConfig = getFieldConfigFromFactory( field );
    Object.assign( mappedField, specificConfig );

    // Handle Visibility/Dependency
    mappedField.isVisible = ( data: Record< string, any > ) => {
        if ( ! field.visibility ) {
            return false;
        }
        const item = field.dependency_condition;
        if ( typeof item === 'object' && ! Array.isArray( item ) ) {
            const {
                field: depField,
                operator,
                value,
            } = field.dependency_condition;
            const depValue = data[ depField ];

            let targetValue = value;
            if ( value === 'on' ) {
                targetValue = true;
            }
            if ( value === 'off' ) {
                targetValue = false;
            }

            if ( operator === 'equal' ) {
                return depValue === targetValue;
            }
            if ( operator === 'not_equal' ) {
                return depValue !== targetValue;
            }
        }
        return true;
    };

    if ( ! field.help_content && ! field.description ) {
        // @ts-ignore
        delete mappedField.description;
    }

    return mappedField;
};

export const processLayout = ( layoutFields: any[] ) => {
    return layoutFields.map( ( field ) => {
        if ( typeof field === 'string' ) {
            return field;
        }

        const newField = { ...field };

        if ( newField.layout?.type === 'card' && newField.description ) {
            newField.label = (
                <div className="dokan-form-card-header-content">
                    <div className="dokan-form-card-title">
                        { newField.label }
                    </div>
                    <div
                        className="dokan-form-card-description"
                        dangerouslySetInnerHTML={ {
                            __html: sanitizeHTML( newField.description ),
                        } }
                    />
                </div>
            );
            delete newField.description;
        }

        if ( newField.children ) {
            newField.children = processLayout( newField.children );
        }

        return newField;
    } );
};

const FieldRenderer = () => {
    return null;
};

export default FieldRenderer;
