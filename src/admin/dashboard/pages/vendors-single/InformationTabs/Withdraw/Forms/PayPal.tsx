import { SimpleInput } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import FormModal from '../FormModal';
import { useEffect, useState } from '@wordpress/element';

interface PayPalData {
    email?: string;
}

interface PayPalProps {
    isOpen: boolean;
    setIsOpen: ( openStatus: boolean ) => void;
    connected: boolean;
    data: PayPalData | null;
    loading: boolean;
    saveData: ( value: Record< string, unknown > ) => void;
}

function PayPal( {
    isOpen,
    setIsOpen,
    connected,
    data,
    loading,
    saveData,
}: PayPalProps ) {
    const [ value, setValue ] = useState< string >( '' );
    const [ errors, setErrors ] = useState< string[] >( [] );

    const handleConfirm = () => {
        const newErrors: string[] = [];

        if ( ! value.trim() ) {
            setErrors( [ __( 'Email is required', 'dokan-lite' ) ] );
        } else {
            setErrors( newErrors );
            saveData( { ...( data ?? {} ), email: value } );
        }
    };

    useEffect( () => {
        if ( data && typeof data === 'object' ) {
            setValue( data?.email ?? '' );
        }
    }, [ data ] );

    return (
        <div>
            <FormModal
                title={
                    connected
                        ? __( 'Manage PayPal Details', 'dokan-lite' )
                        : __( 'Add PayPal Details', 'dokan-lite' )
                }
                isOpen={ isOpen }
                setIsOpen={ setIsOpen }
                isSaving={ loading }
                onConfirm={ handleConfirm }
            >
                <div>
                    <SimpleInput
                        label={ __( 'PayPal Email', 'dokan-lite' ) }
                        input={ {
                            type: 'text',
                            placeholder: __(
                                'e.g. abc@gmail.com',
                                'dokan-lite'
                            ),
                        } }
                        value={ value }
                        onChange={ ( e ) =>
                            setValue( ( e?.target?.value ?? '' ) as string )
                        }
                        errors={ errors }
                    />
                </div>
            </FormModal>
        </div>
    );
}

export default PayPal;
