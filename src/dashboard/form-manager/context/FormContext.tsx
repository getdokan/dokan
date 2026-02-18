import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useToast } from '@getdokan/dokan-ui';
import { getFieldConfig } from '../components/FieldRenderer';
import { fieldValueForProduct } from '../utils';
import { FlatFormItem, VariationType } from '../types';
import apiFetch from '@wordpress/api-fetch';

interface FormContextType {
    product: Record< string, any >;
    setProduct: React.Dispatch< React.SetStateAction< Record< string, any > > >;
    fields: any[];
    onChange: ( newData: Record< string, any > ) => void;
    formItems: FlatFormItem[];
    submitHandler: ( e: React.FormEvent< HTMLFormElement > ) => Promise< void >;
    isLoading: boolean;
}

const FormContext = createContext< FormContextType | undefined >( undefined );

interface FormProviderProps {
    children: React.ReactNode;
    formItems: FlatFormItem[];
    productId: number;
    vendorEarning: number;
    variations?: VariationType[];
}
const transformPayload = ( product: Record< string, any > ) => {
    const copy = { ...product };
    Object.keys( copy ).forEach( ( key ) => {
        if ( copy[ key ] === '' ) {
            delete copy[ key ];
        }
    } );
    return copy;
};

export const FormProvider = ( {
    children,
    formItems,
    productId,
    vendorEarning,
    variations = [],
}: FormProviderProps ) => {
    const toast = useToast();
    const [ isLoading, setIsLoading ] = useState( false );
    const fields = useMemo( () => {
        return formItems
            .filter( ( i ) => i.type === 'field' )
            .map( ( item ) => {
                const field = { ...item };
                return getFieldConfig( field as any );
            } );
    }, [ formItems ] );

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

    const onChange = useCallback( ( newData: Record< string, any > ) => {
        setProduct( ( prev ) => ( { ...prev, ...newData } ) );
    }, [] );


    const submitHandler = async ( e: React.FormEvent< HTMLFormElement > ) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            setIsLoading( true );
            await apiFetch( {
                path: `dokan/v3/products/${ productId ? productId : '' }`,
                method: productId ? 'PUT' : 'POST',
                data: transformPayload( { ...product } ),
            } );
            toast( {
                type: 'success',
                title: __( 'Product saved successfully.', 'dokan-lite' ),
            } );
        } catch ( err: any ) {
            toast( {
                type: 'error',
                title:
                    err.message || __( 'Error saving product.', 'dokan-lite' ),
            } );
            throw err;
        } finally {
            setIsLoading( false );
        }
    };

    const value = {
        product,
        fields,
        formItems,
        setProduct,
        onChange,
        submitHandler,
        isLoading,
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
