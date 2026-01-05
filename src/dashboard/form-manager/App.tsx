import { DataForm } from '@wordpress/dataviews';
import { useCallback, useMemo, useState } from '@wordpress/element';
import { getFieldConfig, processLayout } from './components/FieldRenderer';
import useLayout from './useLayout';

const App = () => {
    const { fields: layoutFields, sections, initialData } = useLayout();
    // 1. State
    const [ product, setProduct ] = useState< any >( {
        ...initialData,
    } );

    // 2. Stable onChange
    const onChange = useCallback( ( newData: Record< string, any > ) => {
        setProduct( ( prev: any ) => ( { ...prev, ...newData } ) );
    }, [] );

    // 3. Fields and Layout
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
export default App;
