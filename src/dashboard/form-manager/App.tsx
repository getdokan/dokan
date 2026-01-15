import { DokanToaster, useToast } from '@getdokan/dokan-ui';
import { DokanButton } from '@src/components';
import { DataForm } from '@wordpress/dataviews';
import { useCallback, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { checkDependency, getFieldConfig } from './components/FieldRenderer';
import { formDataFactory } from './factories';
import useLayouts from './hooks/useLayouts';
import { Section } from './types';

// from localized script
const { sections } = ( window as any ).dokanFormManager as {
    sections: Section[];
    is_new_product: string;
    product_id: string;
    view_product_url: string;
};

const App = () => {
    const toast = useToast();
    const [ isNewProduct ] = useState(
        ( document.getElementById( 'dokan_new_product' ) as any )?.value
    );
    const [ productId ] = useState(
        ( document.getElementById( 'dokan_product_id' ) as any )?.value
    );

    const [ errors, setErrors ] = useState< Record< string, string > >( {} );

    // Fields and Layout
    const fields = useMemo( () => {
        return sections.flatMap( ( section ) => {
            return section.fields.map( ( field ) => {
                const config = getFieldConfig( field );
                if ( errors[ field.id ] ) {
                    return { ...config, error: errors[ field.id ] };
                }
                return config;
            } );
        } ) as any[];
    }, [ errors ] );

    const initialData = useMemo( () => formDataFactory.create( sections ), [] );

    const [ product, setProduct ] = useState< any >( {
        ...initialData,
        id: Number( productId ),
    } );
    const { formLayouts } = useLayouts( sections, fields, product );
    const [ isLoading, setIsLoading ] = useState( false );

    // Stable onChange
    const onChange = useCallback( ( newData: Record< string, any > ) => {
        setProduct( ( prev: any ) => ( { ...prev, ...newData } ) );

        // Clear error for the field being edited
        const changedFieldId = Object.keys( newData )[ 0 ];
        if ( changedFieldId ) {
            setErrors( ( prev ) => {
                if ( ! prev[ changedFieldId ] ) {
                    return prev;
                }
                const newErrs = { ...prev };
                delete newErrs[ changedFieldId ];
                return newErrs;
            } );
        }
    }, [] );

    const validateForm = () => {
        const newErrors: Record< string, string > = {};
        sections.forEach( ( section ) => {
            section.fields.forEach( ( field ) => {
                if ( ! field.required ) {
                    return;
                }
                // Check visibility
                if ( ! field.visibility ) {
                    return;
                }
                if (
                    ! checkDependency( field.dependency_condition, product )
                ) {
                    return;
                }

                const value = product[ field.id ];
                if (
                    ! value ||
                    ( Array.isArray( value ) && value.length === 0 )
                ) {
                    newErrors[ field.id ] = __(
                        'Please fill out this field.',
                        'dokan-lite'
                    );
                }
            } );
        } );

        if ( Object.keys( newErrors ).length > 0 ) {
            setErrors( newErrors );
            toast( {
                type: 'error',
                title: __(
                    'Please fill out all required fields.',
                    'dokan-lite'
                ),
            } );
            const firstErrorField = document.querySelector( '.is-invalid' );
            if ( firstErrorField ) {
                firstErrorField.scrollIntoView( {
                    behavior: 'smooth',
                    block: 'center',
                } );
            }
            return false;
        }
        setErrors( {} );
        return true;
    };

    const submitHandler = async ( e: any ) => {
        e.preventDefault();

        // Validation
        if ( ! validateForm() ) {
            return;
        }
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
