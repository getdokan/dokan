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
import { fieldValueForProduct } from '../utils';
import { FlatFormItem, VariationType } from '../types';

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
    formItems: FlatFormItem[];
}

const FormContext = createContext< FormContextType | undefined >( undefined );

interface FormProviderProps {
    children: React.ReactNode;
    formItems: FlatFormItem[];
    productId: number;
    vendorEarning: number;
    variations: VariationType[];
    onSubmit: ( data: Record< string, any > ) => Promise< any >;
    validator?: (
        formItems: FlatFormItem[],
        values: Record< string, any >
    ) => Record< string, string >;
}

export const FormProvider = ( {
    children,
    formItems,
    productId,
    vendorEarning,
    variations = [],
    onSubmit,
    validator,
}: FormProviderProps ) => {
    const toast = useToast();
    const [ errors, setErrors ] = useState< Record< string, string > >( {} );

    const fields = useMemo( () => {
        return formItems
            .filter( ( i ) => i.type === 'field' )
            .map( ( item ) => {
                const field = { ...item, parent_id: item.parent_id };
                const config = getFieldConfig( field as any );
                if ( errors[ item.id ] ) {
                    return { ...config, error: errors[ item.id ] };
                }
                return config;
            } ) as any[];
    }, [ errors, formItems ] );

    const defaultData = useMemo( () => {
        const entries = formItems
            .filter( ( i ) => i.type === 'field' )
            .map( ( item ) => [ item.id, fieldValueForProduct( item ) ] );
        return Object.fromEntries( entries );
    }, [ formItems ] );

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
        const newErrors = validator( formItems, product );

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
            await onSubmit( product );
        } catch ( error: unknown ) {
            throw error;
        } finally {
            setIsLoading( false );
        }
    };

    const value = {
        product,
        errors,
        fields,
        formItems,
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
