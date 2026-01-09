import { DokanTooltip } from '@src/components';
import { Info } from 'lucide-react';
import { sanitizeHTML } from '../../../utilities';
import { getFieldConfigFromFactory } from '../factories';
import { DependencyCondition, FormField } from '../types';

export const checkDependency = (
    depsCondition: DependencyCondition | DependencyCondition[] | undefined,
    data: Record< string, any >
): boolean => {
    if ( Array.isArray( depsCondition ) ) {
        return depsCondition.every( ( condition ) =>
            checkDependency( condition, data )
        );
    }

    if ( typeof depsCondition === 'object' && depsCondition !== null ) {
        const { field: depField, operator, value } = depsCondition;
        const depValue = data[ depField ];

        let targetValue = value;
        if ( value === 'on' || value === 'yes' ) {
            targetValue = true;
        }
        if ( value === 'off' || value === 'no' ) {
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
        isValid: {
            required: field.required,
        },
    };

    const specificConfig = getFieldConfigFromFactory( field );
    Object.assign( mappedField, specificConfig );

    // Handle Visibility/Dependency
    mappedField.isVisible = ( data: Record< string, any > ) => {
        if ( ! field.visibility ) {
            return false;
        }
        return checkDependency( field.dependency_condition, data );
    };

    if ( ! field.help_content && ! field.description ) {
        // @ts-ignore
        delete mappedField.description;
    }

    return mappedField;
};

const FieldRenderer = () => {
    return null;
};

export default FieldRenderer;
