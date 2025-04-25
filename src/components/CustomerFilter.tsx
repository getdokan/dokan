import { AsyncSearchableSelect } from '@getdokan/dokan-ui';
import { useCustomerSearch } from '@dokan/hooks';
import { useState } from '@wordpress/element';
import { debounce } from '@wordpress/compose';
import { __ } from "@wordpress/i18n";

const CustomerFilter = ( props ) => {
    const customerHook = useCustomerSearch();
    const [ searchedCustomer, setSearchedCustomer ] = useState( [] );

    const getValue = () => {
        if ( ! props?.value?.value ) {
            return '';
        }

        const found = searchedCustomer.find( ( customer ) => {
            return Number( customer.value ) === Number( props?.value.value );
        } );

        if ( found ) {
            return found;
        } else if ( props?.value?.value && props?.value?.label ) {
            setSearchedCustomer( ( prevState ) => {
                return [ ...prevState, { ...props?.value } ];
            } );

            return props?.value;
        }

        return '';
    };

    const handleCustomrSearch = debounce(
        async ( inputValue: string, callback ) => {
            try {
                if ( ! inputValue ) {
                    return;
                }
                const searchResults =
                    await customerHook.searchCustomers( inputValue );
                const resultData = searchResults.map( ( customer ) => {
                    return {
                        label: customer.name,
                        value: customer.id,
                    };
                } );

                setSearchedCustomer( resultData );
                callback( resultData );
            } catch ( error ) {
                console.error( 'Search failed:', error );
            }
        },
        500
    );

    return (
        <AsyncSearchableSelect
            { ...props }
            value={ getValue() }
            defaultOptions={ searchedCustomer }
            loadOptions={ handleCustomrSearch }
            noOptionsMessage={ () => __( 'No options', 'dokan-lite' ) }
        />
    );
};

export default CustomerFilter;
