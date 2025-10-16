import { SimpleInput } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import FormModal from '../FormModal';
import { useEffect, useState } from '@wordpress/element';

interface SkrillData {
    email?: string;
}

interface SkrillProps {
    isOpen: boolean;
    setIsOpen: ( openStatus: boolean ) => void;
    connected: boolean;
    data: SkrillData | null;
    loading: boolean;
    saveData: ( value: Record< string, unknown > ) => void;
}

function Skrill( {
    isOpen,
    setIsOpen,
    connected,
    data,
    loading,
    saveData,
}: SkrillProps ) {
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
                        ? __( 'Manage Skrill Details', 'dokan-lite' )
                        : __( 'Add Skrill Details', 'dokan-lite' )
                }
                isOpen={ isOpen }
                setIsOpen={ setIsOpen }
                isSaving={ loading }
                onConfirm={ handleConfirm }
            >
                <div>
                    <SimpleInput
                        label={ __( 'Skrill Email', 'dokan-lite' ) }
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

export default Skrill;
