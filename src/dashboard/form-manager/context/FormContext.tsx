import { useToast } from '@getdokan/dokan-ui';
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { getFieldConfig } from '../components/FieldRenderer';
import { formDataFactory } from '../factories';
import { Section } from '../types';

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
    sections: Section[];
}

const FormContext = createContext< FormContextType | undefined >( undefined );

interface FormProviderProps {
    children: React.ReactNode;
    sections: Section[];
    productId: number;
    vendorEarning: number;
    variations?: any[];
    onSubmit: ( data: Record< string, any > ) => Promise< any >;
    validator?: (
        sections: Section[],
        values: Record< string, any >
    ) => Record< string, string >;
}

export const FormProvider = ( {
    children,
    sections,
    productId,
    vendorEarning,
    variations = [],
    onSubmit,
    validator,
}: FormProviderProps ) => {
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
    }, [ errors, sections ] );

    const defaultData = useMemo(
        () => formDataFactory.create( sections ),
        [ sections ]
    );

    const [ product, setProduct ] = useState< Record< string, any > >( {
        ...defaultData,
        id: productId,
        vendor_earning: vendorEarning,
        variations: variations,
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
        if ( ! validator ) {
            return true;
        }
        const newErrors = validator( sections, product );

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
            e.stopPropagation();
        }

        // Validation
        if ( ! validateForm() ) {
            return;
        }
        setIsLoading( true );

        try {
            const response = await onSubmit( product );

            if ( response.data.message ) {
                toast( {
                    type: 'success',
                    title: response.data.message,
                } );
            }
        } catch ( error: unknown ) {
            const err = error as Error | { message?: string };
            toast( {
                type: 'error',
                title: err.message || __( 'An error occurred', 'dokan-lite' ),
            } );
            // eslint-disable-next-line no-console
            console.error( 'Error submitting form:', error );
        } finally {
            setIsLoading( false );
        }
    };

    const value = {
        product,
        errors,
        fields,
        sections,
        setProduct,
        setErrors,
        isLoading,
        onChange,
        submitHandler,
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
