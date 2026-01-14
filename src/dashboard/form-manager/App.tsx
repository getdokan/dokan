import { DokanToaster, useToast } from '@getdokan/dokan-ui';
import { DokanButton } from '@src/components';
import { DataForm } from '@wordpress/dataviews';
import { useCallback, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { getFieldConfig } from './components/FieldRenderer';
import useLayouts from './hooks/useLayouts';
import { Section } from './types';
const sections = ( window as any ).dokanFormManager.sections as Section[];

const App = () => {
    const toast = useToast();
    const [ isNewProduct ] = useState(
        ( document.getElementById( 'dokan_new_product' ) as any )?.value
    );
    const [ productId ] = useState(
        ( document.getElementById( 'dokan_product_id' ) as any )?.value
    );
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
                if ( field.field_type === 'checkbox' ) {
                    return [
                        field.id,
                        field.value === 'yes' ||
                            field.value === 'on' ||
                            field.value === true,
                    ];
                }
                return [ field.id, field.value || '' ];
            } );
        } );
        return Object.fromEntries( entries );
    }, [] );

    const [ product, setProduct ] = useState< any >( {
        ...initialData,
        id: Number( productId ),
    } );
    const { formLayouts } = useLayouts( sections, fields, product );
    const [ isLoading, setIsLoading ] = useState( false );

    // Stable onChange
    const onChange = useCallback( ( newData: Record< string, any > ) => {
        setProduct( ( prev: any ) => ( { ...prev, ...newData } ) );
    }, [] );

    const submitHandler = async ( e: any ) => {
        e.preventDefault();
        setIsLoading( true );

        try {
            // @ts-ignore
            const response = await window.wp.ajax.post(
                'dokan_save_product_data',
                {
                    ...product,
                    // @ts-ignore
                    _nonce: window.dokanFormManager.form_manager_nonce,
                }
            );
            if ( response.message ) {
                toast( {
                    type: 'success',
                    title: response.message,
                } );
            }
        } catch ( error: any ) {
            toast( {
                type: 'error',
                title: error.message || __( 'An error occurred', 'dokan-lite' ),
            } );
        } finally {
            setIsLoading( false );
        }
    };

    return (
        <div className="dokan-product-form-manager dokan-layout">
            <form onSubmit={ submitHandler }>
                <div className="flex justify-between mb-4">
                    <div className="text-2xl font-semibold ">
                        { Number( isNewProduct )
                            ? __( 'New Product', 'dokan-lite' )
                            : __( 'Edit Product', 'dokan-lite' ) }
                    </div>
                    <DokanButton
                        type="submit"
                        variant="secondary"
                        loading={ isLoading }
                        disabled={ isLoading }
                        label={
                            Number( isNewProduct )
                                ? __( 'Save Changes', 'dokan-lite' )
                                : __( 'Update Product', 'dokan-lite' )
                        }
                    />
                </div>
                <DataForm
                    data={ product }
                    fields={ fields }
                    form={ { fields: formLayouts } }
                    onChange={ onChange }
                />
            </form>
            <DokanToaster />
        </div>
    );
};
export default App;
