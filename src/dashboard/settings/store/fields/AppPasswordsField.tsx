import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { type SettingsElement } from '@wedevs/plugin-ui';
import { DokanModal } from '@dokan/components';
import { Info, Plus } from 'lucide-react';
import { editButtonClass } from './shared';
import AddPasswordModal from './app-passwords/AddPasswordModal';
import CreatedPasswordPanel from './app-passwords/CreatedPasswordPanel';
import PasswordsTable from './app-passwords/PasswordsTable';
import useAppPasswords from './app-passwords/useAppPasswords';
import { type AppPassword } from './app-passwords/utils';

// `vendor_app_passwords` variant: WordPress's application passwords on the Vendor Dashboard, because Vendors are not admitted to the profile screen in wp-admin.
const AppPasswordsField = ( { element }: { element: SettingsElement } ) => {
    const available = Boolean( element.available );
    const username = String( element.username ?? '' );

    const {
        rows,
        loading,
        listError,
        created,
        dismissCreated,
        create,
        revoke,
        revokeAll,
    } = useAppPasswords( available );

    const [ adding, setAdding ] = useState( false );
    const [ pendingRevoke, setPendingRevoke ] = useState< AppPassword | null >(
        null
    );
    const [ confirmingRevokeAll, setConfirmingRevokeAll ] = useState( false );

    const heading = (
        // Grows and wraps inside its own column, so a long description never pushes the add action off the title's line.
        <div className="flex min-w-64 flex-1 flex-col gap-1">
            <span className="text-sm font-semibold text-gray-900">
                { element.title }
            </span>
            { element.description && (
                <span className="text-xs text-gray-500">
                    { element.description }
                </span>
            ) }
        </div>
    );

    if ( ! available ) {
        return (
            <div className="dokan-vendor-app-passwords w-full">
                <div className="p-4">{ heading }</div>
                <div className="px-4 pb-4">
                    <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        <Info size={ 16 } className="mt-0.5 shrink-0" />
                        <span>
                            { String( element.unavailable_text ?? '' ) }
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        // Same anatomy as the vacation-history table: a padded header with the add action, then the grid flush in the card.
        <div
            className={ `dokan-vendor-app-passwords w-full ${
                rows.length > 1 ? '' : 'pb-2'
            }` }
        >
            <div className="flex w-full flex-wrap items-center justify-between gap-3 p-4">
                { heading }
                <button
                    type="button"
                    className={ `${ editButtonClass } shrink-0` }
                    onClick={ () => setAdding( true ) }
                >
                    <Plus size={ 14 } />
                    { __( 'Add Application Password', 'dokan-lite' ) }
                </button>
            </div>

            { /* Keyed by password, so each new one starts blurred again. */ }
            { created && (
                <CreatedPasswordPanel
                    key={ created.uuid }
                    created={ created }
                    username={ username }
                    onDismiss={ dismissCreated }
                />
            ) }

            <PasswordsTable
                rows={ rows }
                loading={ loading }
                error={ listError }
                onRevoke={ setPendingRevoke }
                onRevokeAll={ () => setConfirmingRevokeAll( true ) }
            />

            { adding && (
                <AddPasswordModal
                    fieldId={ String( element.id ) }
                    onCreate={ create }
                    onClose={ () => setAdding( false ) }
                />
            ) }

            { pendingRevoke && (
                <DokanModal
                    isOpen
                    namespace="dokan-vendor-app-password-revoke"
                    className="w-[350px]! sm:w-[480px]!"
                    onClose={ () => setPendingRevoke( null ) }
                    onConfirm={ () => revoke( pendingRevoke ) }
                    dialogTitle={ __(
                        'Revoke Application Password',
                        'dokan-lite'
                    ) }
                    confirmButtonVariant="danger"
                    confirmButtonText={ __( 'Yes, Revoke', 'dokan-lite' ) }
                    cancelButtonText={ __( 'Cancel', 'dokan-lite' ) }
                    confirmationTitle={ sprintf(
                        /* translators: %s: application password name */
                        __( 'Revoke "%s"?', 'dokan-lite' ),
                        pendingRevoke.name
                    ) }
                    confirmationDescription={ __(
                        'Whatever signs in with this password stops working at once. This action cannot be undone.',
                        'dokan-lite'
                    ) }
                />
            ) }

            { confirmingRevokeAll && (
                <DokanModal
                    isOpen
                    namespace="dokan-vendor-app-password-revoke-all"
                    className="w-[350px]! sm:w-[480px]!"
                    onClose={ () => setConfirmingRevokeAll( false ) }
                    onConfirm={ revokeAll }
                    dialogTitle={ __(
                        'Revoke All Application Passwords',
                        'dokan-lite'
                    ) }
                    confirmButtonVariant="danger"
                    confirmButtonText={ __( 'Yes, Revoke All', 'dokan-lite' ) }
                    cancelButtonText={ __( 'Cancel', 'dokan-lite' ) }
                    confirmationTitle={ __(
                        'Revoke every application password?',
                        'dokan-lite'
                    ) }
                    confirmationDescription={ __(
                        'Every assistant and app that signs in to your account with an application password stops working at once. This action cannot be undone.',
                        'dokan-lite'
                    ) }
                />
            ) }
        </div>
    );
};

export default AppPasswordsField;
