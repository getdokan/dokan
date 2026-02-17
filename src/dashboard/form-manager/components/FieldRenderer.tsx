import { DokanTooltip } from '@src/components';
import { Info } from 'lucide-react';
import { sanitizeHTML } from '../../../utilities';
import { getFieldConfigFromFactory } from '../factories';
import { FormField } from '../types';
import { resolveDependency } from '../utils';

export const getFieldConfig = ( field: FormField ) => {
    const mappedField = {
        ...field,
        label: (
            <div className="flex gap-1 items-center">
                <span
                    className="dokan-form-field-label"
                    dangerouslySetInnerHTML={ {
                        __html: sanitizeHTML( field.label ),
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
                    __html: sanitizeHTML( field.description ?? '' ),
                } }
            />
        ),
        placeholder: field.placeholder,
        type: field.variant,
        isValid: {
            required: field.required,
        },
        isVisible: ( data: Record< string, any > ) => {
            return resolveDependency( field.dependencies, data );
        },
    };

    const specificConfig = getFieldConfigFromFactory( field );
    Object.assign( mappedField, specificConfig );

    if ( ! field.description ) {
        // @ts-ignore
        delete mappedField.description;
    }

    return mappedField;
};

