import { SimpleInput } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import FormModal from '@dokan/admin/dashboard/pages/vendors-single/InformationTabs/Withdraw/FormModal';
import { useEffect, useState } from "@wordpress/element";

function Skrill( { isOpen, setIsOpen, connected, data, loading, saveData } ) {
    const [ value, setValue ] = useState( '' );
    const [ errors, setErrors ] = useState( [] );

    const handleConfirm = () => {
        const newErrors: string[] = [];

        if ( ! value.trim() ) {
            setErrors( [ __( 'Email is required', 'dokan-lite' ) ] );
        } else {
            setErrors( newErrors );
            saveData( { ...data, email: value } );
        }
    };

    useEffect( () => {
        if ( data && typeof data === 'object' ) {
            // @ts-ignore
            setValue( data?.email ?? '' );
        }
    }, [ data ] );

    return (
        <div>
            <FormModal
                title={
                    connected
                        ? __( 'Manage Skrill Details', 'dokan' )
                        : __( 'Add Skrill Details', 'dokan' )
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
                                'ex- abc@gmail.com',
                                'dokan-lite'
                            ),
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

export default Skrill;
