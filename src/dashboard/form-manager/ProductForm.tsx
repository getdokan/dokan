import { DataForm } from '@wordpress/dataviews';
import { useCallback, useMemo, useState } from '@wordpress/element';
import { getFieldConfig } from './components/FieldRenderer';
import layout, { sections } from './layout';

const ProductForm = () => {
    // 1. Calculate initialData first
    const initialData = useMemo( () => {
        const entries = sections.flatMap( ( section ) =>
            section.fields.map( ( field ) => [ field.id, field.value || '' ] )
        );
        return Object.fromEntries( entries );
    }, [] );

    // 2. State
    const [ product, setProduct ] = useState< any >( {
        ...initialData,
    } );

    // 3. Stable onChange
    const onChange = useCallback( ( newData: Record< string, any > ) => {
        setProduct( ( prev: any ) => ( { ...prev, ...newData } ) );
    }, [] );

    // 4. Fields and Layout
    const { fields, formLayout } = useMemo( () => {
        const allFields: any = sections.flatMap( ( section ) =>
            section.fields.map( ( field ) => getFieldConfig( field, section ) )
        );

        return {
            fields: allFields,
            formLayout: layout as any,
        };
    }, [] );

    // eslint-disable-next-line no-console
    console.log( { 'Form Layout:': formLayout, fields } );

    return (
        <div className="dokan-product-form-manager dokan-layout">
            <DataForm
                data={ product }
                fields={ fields }
                form={ formLayout }
                onChange={ onChange }
            />
        </div>
    );
};
export default ProductForm;
