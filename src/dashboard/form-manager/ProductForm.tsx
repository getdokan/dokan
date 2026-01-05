import { DataForm } from '@wordpress/dataviews';
import { useCallback, useMemo, useState } from '@wordpress/element';
import { getFieldConfig, processLayout } from './components/FieldRenderer';
import useLayout from './useLayout';

const ProductForm = () => {
    const { fields: layoutFields, sections } = useLayout();
    // 1. Calculate initialData first
    const initialData = useMemo( () => {
        const entries = sections.flatMap( ( section ) => {
            return section.fields.map( ( field ) => {
                if ( field.id === 'image_id' && field.value ) {
                    return [ field.id, field.value.id ];
                }
                if (
                    field.id === 'gallery_image_ids' &&
                    Array.isArray( field.value )
                ) {
                    return [
                        field.id,
                        field.value.map( ( img: any ) => img.id ),
                    ];
                }
                return [ field.id, field.value || '' ];
            } );
        } );
        return Object.fromEntries( entries );
    }, [ sections ] );

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
            ...layoutFields,
            fields: processLayout( layoutFields ),
        };

        return {
            fields: allFields,
            formLayout: processedLayout as any,
        };
    }, [ sections, layoutFields ] );

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
