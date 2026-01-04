import { DataForm } from '@wordpress/dataviews';
import { useCallback, useMemo, useState } from '@wordpress/element';
import { getFieldConfig, processLayout } from './components/FieldRenderer';
import layout, { sections } from './layout';

const ProductForm = () => {
    // 1. Calculate initialData first
    const initialData = useMemo( () => {
        const mappedValues = [ 'image_id', 'gallery_image_ids' ];
        const entries = sections.flatMap( ( section ) => {
            return section.fields.map( ( field ) => {
                if ( mappedValues.includes( field.id ) ) {
                    if ( field.value && Array.isArray( field.value ) ) {
                        return [
                            field.id,
                            field.value.map( ( img: any ) => img.id ),
                        ];
                    }
                }
                return [ field.id, field.value || '' ];
            } );
        } );
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
        const allFields: any = sections.flatMap( ( section ) => {
            return section.fields.map( ( field ) => getFieldConfig( field ) );
        } );

        const processedLayout = {
            ...layout,
            fields: processLayout( layout.fields ),
        };

        return {
            fields: allFields,
            formLayout: processedLayout as any,
        };
    }, [] );

    // eslint-disable-next-line no-console
    console.log( { 'Form Layout:': formLayout, fields, data: product } );

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
