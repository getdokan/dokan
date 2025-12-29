import { FormField, Section } from '../types';
import { DokanButton, MediaUploader, RichText } from './../../../components';

export const CustomField = ( {
    label,
    children,
}: {
    label: string | React.ReactNode;
    children: React.ReactNode;
} ) => {
    return (
        <div className="flex flex-col gap-1">
            <div className="uppercase">{ label }</div>
            { children }
        </div>
    );
};

const TextareaEdit = ( { data, field, onChange }: any ) => (
    <CustomField label={ field.label }>
        <RichText
            placeholder={ field.placeholder }
            value={ data[ field.id ] }
            onChange={ ( value: string ) =>
                onChange( { [ field.id ]: value } )
            }
        />
    </CustomField>
);

const ImageEdit = ( { data, field, onChange }: any ) => {
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

export const getFieldConfig = ( field: FormField, section: Section ) => {
    const mappedField = {
        ...field,
        label: <span dangerouslySetInnerHTML={ { __html: field.title } } />,
        description: (
            <span
                dangerouslySetInnerHTML={ {
                    __html: field.help_content || field.description,
                } }
            />
        ),
        placeholder: field.placeholder,
        required: field.required,
        type: field.field_type, // default type, will be updated below
    };

    // Map Input Types
    switch ( field.field_type ) {
        case 'textarea':
            mappedField.type = 'text';
            mappedField.Edit = TextareaEdit;
            break;
        case 'checkbox':
            mappedField.type = 'boolean';
            mappedField.Edit = 'checkbox';
            break;
        case 'integer':
        case 'number':
            mappedField.type = 'integer';
            break;
        case 'date':
        case 'datetime':
            mappedField.type = 'datetime';
            break;
        case 'select':
            mappedField.type = field.id.endsWith( '_ids' ) ? 'array' : 'text';
            const elements = Array.isArray( field.options )
                ? field.options.map( ( opt: any ) => ( {
                      label: opt.label,
                      value: opt.value,
                  } ) )
                : Object.entries( field.options ).map(
                      ( [ value, label ] ) => ( {
                          label,
                          value,
                      } )
                  );
            mappedField.elements = elements;
            mappedField.Edit = elements.length > 0 ? 'select' : 'text';
            break;
        case 'image':
        case 'gallery':
            mappedField.type = 'integer';
            mappedField.Edit = ImageEdit;
            break;
        default:
            mappedField.type = 'text';
    }

    // Handle Visibility/Dependency
    mappedField.isVisible = () => {
        if ( ! field.visibility ) {
            return false;
        }
        if ( field.dependency_condition ) {
            const {
                field: depField,
                operator,
                value,
            } = field.dependency_condition;
            const depsField = section.fields.find( ( f ) => f.id === depField );
            if ( depsField ) {
                if ( operator === 'equal' ) {
                    return depsField.visibility === value;
                }
                if ( operator === 'not_equal' ) {
                    return depsField.visibility !== value;
                }
            }
        }
        return true;
    };

    return mappedField;
};

const FieldRenderer = () => {
    return null;
};

export default FieldRenderer;
