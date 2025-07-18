import { SimpleInput, SimpleRadio, TextArea } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import { twMerge } from 'tailwind-merge';
import FormModal from '@dokan/admin/dashboard/pages/vendors-single/InformationTabs/Withdraw/FormModal';
import { useEffect, useState } from '@wordpress/element';

interface Props {
    isOpen: boolean;
    setIsOpen: (value) => void;
    settings: Record< any, any >;
    connected: boolean;
    data: Record< string, any > | null;
    saveData: ( values: object ) => void;
    loading: boolean;
}

function Bank( {
    isOpen,
    setIsOpen,
    settings,
    connected,
    data,
    saveData,
    loading,
}: Props ) {
    const bankPaymentRequiredFields =
        ( settings?.bank_payment_required_fields as Record<
            string,
            string
        > ) ?? {};

    const [ values, setValues ] = useState( {
        ac_type: 'personal',
        ac_name: '',
        ac_number: '',
        routing_number: '',
        bank_name: '',
        bank_addr: '',
        iban: '',
        swift: '',
    } );
    const [ errors, setErrors ] = useState( {} );

    const isRequired = ( id: string ): boolean => {
        return bankPaymentRequiredFields.hasOwnProperty( id );
    };

    const handleConfirm = () => {
        const newErrors: Record< string, string > = {};

        Object.keys( bankPaymentRequiredFields ).forEach( ( key ) => {
            if ( ! values[ key ]?.trim() ) {
                newErrors[ key ] = bankPaymentRequiredFields[ key ];
            }
        } );

        setErrors( newErrors );

        // Optionally, prevent submit if errors exist
        if ( Object.keys( newErrors ).length > 0 ) {
            return;
        }

        saveData( values );
    };

    const getInputError = ( id: string ) => {
        return errors[ id ] ? [ errors[ id ] ] : [];
    };

    useEffect( () => {
        if ( data && typeof data === 'object' ) {
            // @ts-ignore
            setValues( data );
        }
    }, [ data ] );

    return (
        <div>
            <FormModal
                title={
                    connected
                        ? __( 'Manage Bank Details', 'dokan' )
                        : __( 'Add Bank Details', 'dokan' )
                }
                isOpen={ isOpen }
                setIsOpen={ setIsOpen }
                isSaving={ loading }
                onConfirm={ handleConfirm }
            >
                <div>
                    <SimpleRadio
                        label={ __( 'Account type', 'dokan-lite' ) }
                        options={ [
                            {
                                label: __( 'Personal', 'dokan-lite' ),
                                value: 'personal',
                            },
                            {
                                label: __( 'Business', 'dokan-lite' ),
                                value: 'business',
                            },
                        ] }
                        defaultValue={ 'personal' }
                        optionClass={ twMerge( 'flex flex-row' ) }
                        input={ {
                            id: 'ac_type',
                            required: isRequired( 'ac_type' ),
                        } }
                        value={ values.ac_type }
                        onChange={ ( e ) =>
                            setValues( { ...values, ac_type: e.target.value } )
                        }
                        errors={ getInputError( 'ac_type' ) }
                    />
                </div>
                <div>
                    <SimpleInput
                        label={ __( 'Account Holder', 'dokan-lite' ) }
                        input={ {
                            type: 'text',
                            placeholder: __( 'Account Holder', 'dokan-lite' ),
                            id: 'ac_name',
                            required: isRequired( 'ac_name' ),
                        } }
                        value={ values.ac_name }
                        onChange={ ( e ) =>
                            setValues( { ...values, ac_name: e.target.value } )
                        }
                        errors={ getInputError( 'ac_name' ) }
                    />
                </div>
                <div>
                    <SimpleInput
                        label={ __( 'Account Number', 'dokan-lite' ) }
                        input={ {
                            type: 'text',
                            placeholder: __( 'Account Number', 'dokan-lite' ),
                            id: 'ac_number',
                            required: isRequired( 'ac_number' ),
                        } }
                        value={ values.ac_number }
                        onChange={ ( e ) =>
                            setValues( {
                                ...values,
                                ac_number: e.target.value,
                            } )
                        }
                        errors={ getInputError( 'ac_number' ) }
                    />
                </div>
                <div>
                    <SimpleInput
                        label={ __( 'Routing Number', 'dokan-lite' ) }
                        input={ {
                            type: 'text',
                            placeholder: __( 'Routing Number', 'dokan-lite' ),
                            id: 'routing_number',
                            required: isRequired( 'routing_number' ),
                        } }
                        value={ values.routing_number }
                        onChange={ ( e ) =>
                            setValues( {
                                ...values,
                                routing_number: e.target.value,
                            } )
                        }
                        errors={ getInputError( 'routing_number' ) }
                    />
                </div>
                <div>
                    <SimpleInput
                        label={ __( 'Bank Name', 'dokan-lite' ) }
                        input={ {
                            type: 'text',
                            placeholder: __( 'Bank Name', 'dokan-lite' ),
                            id: 'bank_name',
                            required: isRequired( 'bank_name' ),
                        } }
                        value={ values.bank_name }
                        onChange={ ( e ) =>
                            setValues( {
                                ...values,
                                bank_name: e.target.value,
                            } )
                        }
                        errors={ getInputError( 'bank_name' ) }
                    />
                </div>
                <div>
                    <TextArea
                        label={ __( 'Bank Address', 'dokan-lite' ) }
                        input={ {
                            placeholder: __( 'Bank Address', 'dokan-lite' ),
                            id: 'bank_addr',
                            required: isRequired( 'bank_addr' ),
                        } }
                        value={ values.bank_addr }
                        onChange={ ( e ) =>
                            setValues( {
                                ...values,
                                bank_addr: e.target.value,
                            } )
                        }
                        errors={ getInputError( 'bank_addr' ) }
                    />
                </div>
                <div>
                    <SimpleInput
                        label={ __( 'Bank IBAN', 'dokan-lite' ) }
                        input={ {
                            type: 'text',
                            placeholder: __( 'Bank IBAN', 'dokan-lite' ),
                            id: 'iban',
                            required: isRequired( 'iban' ),
                        } }
                        value={ values.iban }
                        onChange={ ( e ) =>
                            setValues( { ...values, iban: e.target.value } )
                        }
                        errors={ getInputError( 'iban' ) }
                    />
                </div>
                <div>
                    <SimpleInput
                        label={ __( 'Bank Swift Code', 'dokan-lite' ) }
                        input={ {
                            type: 'text',
                            placeholder: __( 'Bank Swift Code', 'dokan-lite' ),
                            id: 'swift',
                            required: isRequired( 'swift' ),
                        } }
                        value={ values.swift }
                        onChange={ ( e ) =>
                            setValues( { ...values, swift: e.target.value } )
                        }
                        errors={ getInputError( 'swift' ) }
                    />
                </div>
            </FormModal>
        </div>
    );
}

export default Bank;
