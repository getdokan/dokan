import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Spinner,
} from '@wedevs/plugin-ui';
import { Vendor } from '../../../../definitions/dokan-vendor';

export type UserSwitchingStatus = 'active' | 'inactive' | 'not_installed';

const PLUGIN_PAGE_URL = 'https://wordpress.org/plugins/user-switching/';

type Props = {
    vendor: Vendor | null;
    status: UserSwitchingStatus;
    onClose: ( activated: boolean ) => void;
};

// Installs or activates User Switching through the WordPress plugins API, then switches to the vendor.
const SwitchToVendorDialog = ( { vendor, status, onClose }: Props ) => {
    const [ isBusy, setIsBusy ] = useState( false );
    const [ isActivated, setIsActivated ] = useState( false );
    const [ error, setError ] = useState( '' );

    const isInstall = status === 'not_installed';

    const close = () => {
        onClose( isActivated );
        setIsActivated( false );
        setError( '' );
    };

    const enableUserSwitching = async () => {
        if ( isInstall ) {
            try {
                await apiFetch( {
                    path: '/wp/v2/plugins',
                    method: 'POST',
                    data: { slug: 'user-switching', status: 'active' },
                } );

                return;
            } catch ( e: any ) {
                // Already installed since the page loaded, so only the activation is left.
                if ( e?.code !== 'folder_exists' ) {
                    throw e;
                }
            }
        }

        await apiFetch( {
            path: '/wp/v2/plugins/user-switching/user-switching',
            method: 'POST',
            data: { status: 'active' },
        } );
    };

    const handleConfirm = async () => {
        setIsBusy( true );
        setError( '' );

        try {
            await enableUserSwitching();
        } catch ( e ) {
            setError(
                isInstall
                    ? __(
                          'User Switching could not be installed on this site. You can install it yourself from its plugin page.',
                          'dokan-lite'
                      )
                    : __(
                          'User Switching could not be activated. You can activate it from the Plugins screen.',
                          'dokan-lite'
                      )
            );
            setIsBusy( false );

            return;
        }

        // The switch link carries a nonce from User Switching, so it only exists once the plugin is active.
        const store = await apiFetch< Vendor >( {
            path: `/dokan/v1/stores/${ vendor?.id }`,
        } ).catch( () => null );

        if ( store?.switch_url ) {
            window.location.href = store.switch_url;

            return;
        }

        setIsActivated( true );
        setError(
            __(
                'User Switching is now active, but you are not allowed to switch to this vendor.',
                'dokan-lite'
            )
        );
        setIsBusy( false );
    };

    let confirmLabel = isInstall
        ? __( 'Install and switch', 'dokan-lite' )
        : __( 'Activate and switch', 'dokan-lite' );

    if ( isBusy ) {
        confirmLabel = isInstall
            ? __( 'Installing…', 'dokan-lite' )
            : __( 'Activating…', 'dokan-lite' );
    }

    return (
        <AlertDialog
            open={ !! vendor }
            onOpenChange={ ( open: boolean ) => {
                if ( ! open && ! isBusy ) {
                    close();
                }
            } }
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        { __( 'Switch to vendor', 'dokan-lite' ) }
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        { isInstall
                            ? __(
                                  'Switching to a vendor uses the free User Switching plugin. Install it?',
                                  'dokan-lite'
                              )
                            : __(
                                  'Switching to a vendor uses the free User Switching plugin. Activate it?',
                                  'dokan-lite'
                              ) }
                    </AlertDialogDescription>
                </AlertDialogHeader>

                { error && (
                    <p className="text-sm text-red-500">
                        { error }{ ' ' }
                        { isInstall && ! isActivated && (
                            <a
                                href={ PLUGIN_PAGE_URL }
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                { __( 'Get User Switching', 'dokan-lite' ) }
                            </a>
                        ) }
                    </p>
                ) }

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={ isBusy } onClick={ close }>
                        { isActivated
                            ? __( 'Close', 'dokan-lite' )
                            : __( 'Cancel', 'dokan-lite' ) }
                    </AlertDialogCancel>
                    { ! isActivated && (
                        <AlertDialogAction
                            disabled={ isBusy }
                            onClick={ handleConfirm }
                        >
                            { isBusy && <Spinner /> }
                            { confirmLabel }
                        </AlertDialogAction>
                    ) }
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default SwitchToVendorDialog;
