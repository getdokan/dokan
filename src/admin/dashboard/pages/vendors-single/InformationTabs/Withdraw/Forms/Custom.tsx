import { SimpleInput } from '@getdokan/dokan-ui';
import { __, sprintf } from '@wordpress/i18n';
import FormModal from '../FormModal';
import { useEffect, useState } from '@wordpress/element';

function Custom( {
    isOpen,
    setIsOpen,
    connected,
    name,
    type,
    data,
    loading,
    saveData,
}: {
    isOpen: boolean;
    setIsOpen: ( value ) => void;
    connected: boolean;
    name: string;
    type: string;
    data: object | null;
    loading: boolean;
    saveData: ( value ) => void;
} ) {
    const [ value, setValue ] = useState( '' );
    const [ errors, setErrors ] = useState( [] );

    const handleConfirm = () => {
        const newErrors: string[] = [];

        if ( ! value.trim() ) {
            setErrors( [ __( 'Input is required', 'dokan-lite' ) ] );
        } else {
            setErrors( newErrors );
            saveData( { ...data, value } );
        }
    };

    useEffect( () => {
        if ( data && typeof data === 'object' ) {
            // @ts-ignore
            setValue( data?.value ?? '' );
        }
    }, [ data ] );

    return (
        <div>
            <FormModal
                title={
                    connected
                        ? sprintf(
                              // translators: %s: name
                              __(
                                  'Manage Custom Payment Details ( %s )',
                                  'dokan'
                              ),
                              name
                          )
                        : sprintf(
                              // translators: %s: name
                              __(
                                  'Add Custom Payment Details ( %s )',
                                  'dokan'
                              ),
                              name
                          )
                }
                isOpen={ isOpen }
                setIsOpen={ setIsOpen }
                isSaving={ loading }
                onConfirm={ handleConfirm }
            >
                <div>
                    <SimpleInput
                        label={ type }
                        input={ {
                            type: 'text',
                            placeholder: __( 'Write here', 'dokan-lite' ),
                        } }
                        value={ value }
                        onChange={ ( e ) => setValue( e.target.value ) }
                        errors={ errors }
                    />
                </div>
            </FormModal>
        </div>
    );
}

export default Custom;
