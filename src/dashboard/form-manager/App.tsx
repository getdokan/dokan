import { DataForm } from '@wordpress/dataviews';
import { useCallback, useMemo, useState } from '@wordpress/element';
import { getFieldConfig } from './components/FieldRenderer';
import { Section } from './types';
import useLayouts from './useLayouts';
const sections = ( window as any ).dokanFormManager.sections as Section[];

const App = () => {
    // Stable onChange
    const onChange = useCallback( ( newData: Record< string, any > ) => {
        setProduct( ( prev: any ) => ( { ...prev, ...newData } ) );
    }, [] );

    // Fields and Layout
    const fields = useMemo( () => {
        return sections.flatMap( ( section ) => {
            return section.fields.map( ( field ) => getFieldConfig( field ) );
        } ) as any[];
    }, [] );

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
    }, [] );

    const [ product, setProduct ] = useState< any >( initialData );
    const { formLayouts } = useLayouts( sections, fields, product );

    // eslint-disable-next-line no-console
    console.log( { formLayouts, fields, product } );

    return (
        <div className="dokan-product-form-manager dokan-layout">
            <DataForm
                data={ product }
                fields={ fields }
                form={ { fields: formLayouts } }
                onChange={ onChange }
            />
        </div>
    );
};
export default App;
