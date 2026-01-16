import { useToast } from '@getdokan/dokan-ui';
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { checkDependency, getFieldConfig } from '../components/FieldRenderer';
import { formDataFactory } from '../factories';
import { Section } from '../types';

interface DokanFormManagerData {
    sections: Section[];
    is_new_product: string;
    product_id: string;
    view_product_url: string;
    form_manager_nonce: string;
    vendor_earning: number;
}

// from localized script
const { sections, ...formData } = (
    window as unknown as {
        dokanFormManager: DokanFormManagerData;
    }
 ).dokanFormManager;

interface FormContextType {
    product: Record< string, any >;
    setProduct: React.Dispatch< React.SetStateAction< Record< string, any > > >;
    errors: Record< string, string >;
    setErrors: React.Dispatch<
        React.SetStateAction< Record< string, string > >
    >;
    fields: any[];
    isLoading: boolean;
    submitHandler: ( e: React.FormEvent ) => Promise< void >;
    onChange: ( newData: Record< string, any > ) => void;
    isNewProduct: boolean;
    productUrl: string;
    sections: Section[];
}

const FormContext = createContext< FormContextType | undefined >( undefined );

export const FormProvider = ( { children }: { children: React.ReactNode } ) => {
    const toast = useToast();
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

    const [ product, setProduct ] = useState< Record< string, any > >( {
        ...initialData,
        id: Number( formData.product_id ),
        vendor_earning: formData.vendor_earning,
    } );

    const [ isLoading, setIsLoading ] = useState( false );

    // Stable onChange
    const onChange = useCallback( ( newData: Record< string, any > ) => {
        setProduct( ( prev ) => ( { ...prev, ...newData } ) );

        // Clear error for the field being edited
        const changedFieldId = Object.keys( newData )[ 0 ];
        if ( changedFieldId ) {
            setErrors( ( prev: any ) => {
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

    const submitHandler = async ( e: React.FormEvent ) => {
        if ( e && e.preventDefault ) {
            e.preventDefault();
        }

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
                    _nonce: formData.form_manager_nonce,
                }
            );
            if ( response.message ) {
                toast( {
                    type: 'success',
                    title: response.message,
                } );
            }
        } catch ( error: unknown ) {
            const err = error as Error | { message?: string };
            const errorMessage =
                ( err && 'message' in err ? err.message : '' ) ||
                __( 'An error occurred', 'dokan-lite' );
            toast( {
                type: 'error',
                title: errorMessage,
            } );
        } finally {
            setIsLoading( false );
        }
    };

    const isNewProduct = Boolean( formData.is_new_product );

    const value = {
        product,
        errors,
        fields,
        sections,
        isNewProduct,
        setProduct,
        setErrors,
        isLoading,
        submitHandler,
        onChange,
        productUrl: formData.view_product_url,
    };

    return (
        <FormContext.Provider value={ value }>
            { children }
        </FormContext.Provider>
    );
};

export const useFormContext = () => {
    const context = useContext( FormContext );
    if ( context === undefined ) {
        throw new Error( 'useFormContext must be used within a FormProvider' );
    }
    return context;
};
