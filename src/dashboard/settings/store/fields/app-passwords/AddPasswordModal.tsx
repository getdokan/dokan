import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Input } from '@wedevs/plugin-ui';
import { DokanModal } from '@dokan/components';
import { RequiredMark } from '../shared';
import { messageOf } from './utils';

type Props = {
    fieldId: string;
    onCreate: ( name: string ) => Promise< void >;
    onClose: () => void;
};

// Asks for the one thing WordPress needs to create an application password: its name.
const AddPasswordModal = ( { fieldId, onCreate, onClose }: Props ) => {
    const [ name, setName ] = useState( '' );
    const [ creating, setCreating ] = useState( false );
    const [ createError, setCreateError ] = useState( '' );
    const nameInput = useRef< HTMLInputElement >( null );

    // The modal asks one thing, so the vendor can type the name straight away.
    useEffect( () => {
        nameInput.current?.focus();
    }, [] );

    // The modal's confirm: a rejection keeps the modal open with the reason in it.
    const create = async () => {
        const trimmed = name.trim();

        if ( ! trimmed || creating ) {
            return;
        }

        setCreating( true );
        setCreateError( '' );

        try {
            await onCreate( trimmed );
        } catch ( error ) {
            setCreateError(
                messageOf(
                    error,
                    __(
                        'Could not create the application password.',
                        'dokan-lite'
                    )
                )
            );
            throw error;
        } finally {
            setCreating( false );
        }
    };

    // Enter in the name input adds the password, like the modal's own button.
    const createFromKeyboard = async () => {
        try {
            await create();
            onClose();
        } catch ( error ) {
            // The modal stays open and shows the reason.
        }
    };

    return (
        <DokanModal
            isOpen
            namespace="dokan-vendor-app-password-add"
            className="w-87.5! sm:w-155! sm:max-w-155!"
            onClose={ onClose }
            onConfirm={ create }
            loading={ creating }
            dialogTitle={ __( 'Add Application Password', 'dokan-lite' ) }
            confirmButtonText={ __( 'Add', 'dokan-lite' ) }
            cancelButtonText={ __( 'Cancel', 'dokan-lite' ) }
            confirmButtonDisabled={ '' === name.trim() }
            dialogContent={
                <div className="dokan-location-form flex flex-col gap-4">
                    <label
                        htmlFor={ `${ fieldId }-name` }
                        className="flex flex-col gap-1 text-sm text-gray-700"
                    >
                        <span>
                            { __(
                                'New Application Password Name',
                                'dokan-lite'
                            ) }{ ' ' }
                            <RequiredMark />
                        </span>
                        <Input
                            ref={ nameInput }
                            id={ `${ fieldId }-name` }
                            type="text"
                            autoComplete="off"
                            className="min-h-[42px]"
                            placeholder={ __( 'e.g. Claude', 'dokan-lite' ) }
                            value={ name }
                            disabled={ creating }
                            onChange={ ( event ) => {
                                setName( event.target.value );
                                setCreateError( '' );
                            } }
                            onKeyDown={ ( event ) => {
                                if ( 'Enter' === event.key ) {
                                    event.preventDefault();
                                    createFromKeyboard();
                                }
                            } }
                        />
                        <span className="text-xs text-gray-500">
                            { __(
                                'Name it after the assistant that will use it, so you know which one to revoke later.',
                                'dokan-lite'
                            ) }
                        </span>
                    </label>
                    { createError && (
                        <span role="alert" className="text-sm text-red-600">
                            { createError }
                        </span>
                    ) }
                </div>
            }
        />
    );
};

export default AddPasswordModal;
