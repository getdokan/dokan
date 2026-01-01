import {
    DokanButton,
    DokanTooltip,
    MediaUploader,
    RichText,
} from '@src/components';
import { sanitizeHTML } from '@src/utilities';
import { Info } from 'lucide-react';
import { FormField, Section } from '../types';

export const CustomField = ( {
    label,
    children,
    className = '',
}: {
    label: string | React.ReactNode;
    children: React.ReactNode;
    className?: string;
} ) => {
    return (
        <div className={ `flex flex-col gap-1 ${ className }` }>
            <div className="uppercase">{ label }</div>
            { children }
        </div>
    );
};

const RichTextEdit = ( { data, field, onChange }: any ) => (
    <CustomField label={ field.label }>
        <RichText
            placeholder={ field.placeholder }
            value={ data[ field.id ] }
            onChange={ ( value: string ) => {
                onChange( { [ field.id ]: value } );
            } }
        />
    </CustomField>
);

const FeatureImage = ( { data, field, onChange }: any ) => {
    return (
        <CustomField label={ field.label }>
            <MediaUploader
                multiple={ field.field_type === 'gallery' }
                onSelect={ ( value: any ) => {
                    onChange( {
                        [ field.id ]: value.id,
                        [ `$${ field.id }_url` ]: value.url,
                    } );
                } }
            >
                <DokanButton variant="secondary" className="uppercase">
                    Upload { field.field_type }
                </DokanButton>
                { data[ `$${ field.id }_url` ] && (
                    <img
                        src={ data[ `$${ field.id }_url` ] }
                        alt="Product"
                        style={ {
                            marginTop: '10px',
                            maxWidth: '100%',
                            width: '150px',
                        } }
                    />
                ) }
            </MediaUploader>
        </CustomField>
    );
};

const getElementsFromOptions = ( options: any ) => {
    if ( Array.isArray( options ) ) {
        return options;
    }

    return Object.entries( options ).map( ( [ value, label ] ) => ( {
        label,
        value,
    } ) );
};

export const getFieldConfig = ( field: FormField, section: Section ) => {
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
    };

    // Map Input Types
    switch ( field.field_type ) {
        case 'textarea':
            mappedField.type = 'text';
            mappedField.Edit = 'textarea';
            break;
        case 'rich_text':
            mappedField.type = 'text';
            mappedField.Edit = RichTextEdit;
            break;
        case 'checkbox':
            mappedField.type = 'boolean';
            mappedField.Edit = 'checkbox';
            break;
        case 'number':
            mappedField.type = 'integer';
            break;
        case 'date':
        case 'datetime':
            mappedField.type = 'datetime';
            break;
        case 'select':
            mappedField.type = field.id.endsWith( '_ids' ) ? 'array' : 'text';
            mappedField.elements = getElementsFromOptions( field.options );
            mappedField.Edit =
                mappedField.elements.length > 0 ? 'select' : 'text';
            break;
        case 'image':
            mappedField.type = 'integer';
            mappedField.Edit = FeatureImage;
            break;
        case 'gallery':
            mappedField.type = 'array';
            mappedField.Edit = FeatureImage;
            break;
        default:
            mappedField.type = 'text';
    }

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

            let targetValue: any = value;
            if ( value === 'on' ) targetValue = true;
            if ( value === 'off' ) targetValue = false;

            if ( operator === 'equal' ) {
                return depValue === targetValue;
            }
        }
        return true;
    };

    if ( ! field.help_content && ! field.description ) {
        mappedField.description = undefined as any;
    }

    return mappedField;
};

const FieldRenderer = () => {
    return null;
};

export default FieldRenderer;
