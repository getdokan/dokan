import { AsyncSearchableSelect } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import { useDebounceCallback } from 'usehooks-ts';
import { useCustomerSearch } from '@dokan/hooks';
import { useState } from '@wordpress/element';

const CustomerFilter = ( { id, selectedCustomer, setSelectedCustomer } ) => {
    const customerHook = useCustomerSearch();
    const [ searchedCustomer, setSearchedCustomer ] = useState( [] );

    const debounced = useDebounceCallback( async function ( {
        inputValue,
        callback,
    } ) {
        await handleCustomrSearch( inputValue, callback );
    }, 500 );

    const handleCustomrSearch = async ( inputValue: string, callback ) => {
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
    };

    const getValue = () => {
        if ( ! selectedCustomer?.value ) {
            return '';
        }

        const found = searchedCustomer.find( ( customer ) => {
            return (
                Number( customer.value ) === Number( selectedCustomer.value )
            );
        } );

        if ( found ) {
            return found;
        } else if ( selectedCustomer?.value && selectedCustomer?.label ) {
            setSearchedCustomer( ( prevState ) => {
                return [ ...prevState, { ...selectedCustomer } ];
            } );
            return setSelectedCustomer;
        }

        return '';
    };

    return (
        <div>
            <label htmlFor={ id }>
                { __( 'Filter By Registered Customer', 'dokan' ) }
            </label>
            <AsyncSearchableSelect
                id={ id }
                value={ getValue() }
                defaultOptions={ searchedCustomer }
                placeholder={ __( 'Search', 'dokan' ) }
                errors={ [] }
                onChange={ setSelectedCustomer }
                isMulti={ false }
                loadOptions={ (
                    inputValue: string,
                    callback: (
                        options: {
                            label: string;
                            value: string;
                        }[]
                    ) => void
                ) => {
                    debounced( {
                        inputValue,
                        callback,
                    } );
                } }
            />
        </div>
    );
};

export default CustomerFilter;
