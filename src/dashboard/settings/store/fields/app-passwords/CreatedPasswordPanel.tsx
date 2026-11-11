import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { DokanButton, DokanTooltip } from '@dokan/components';
import { Check, Copy, Eye, EyeOff } from 'lucide-react';
import CopyIcon, { fieldIconClass, useCopy } from './CopyIcon';
import { basicToken, type CreatedPassword } from './utils';

type Props = {
    created: CreatedPassword;
    username: string;
    onDismiss: () => void;
};

// The one place a new password and its token can be read: WordPress keeps only a hash, so neither can be shown again.
const CreatedPasswordPanel = ( { created, username, onDismiss }: Props ) => {
    // The password stays blurred until the vendor asks to see it: it is copied far more often than read.
    const [ revealed, setRevealed ] = useState( false );
    // Built in the browser from the password WordPress has just handed over; nothing keeps it, so it leaves with the panel.
    const tokenCopy = useCopy( basicToken( username, created.password ) );

    return (
        <div className="px-4 pb-4">
            <div
                role="status"
                className="flex flex-col gap-3 rounded-md border border-green-200 bg-green-50 px-4 py-3"
            >
                <span className="text-sm text-gray-900">
                    { sprintf(
                        /* translators: %s: application password name */
                        __( 'Your new password for %s is:', 'dokan-lite' ),
                        created.name
                    ) }
                </span>
                <div className="relative w-full">
                    <code className="dokan-vendor-app-password-value block min-h-9 w-full rounded-md border border-gray-300 bg-white py-2 pr-16 pl-3 font-mono text-sm break-all text-gray-900">
                        <span
                            className={
                                revealed ? 'select-all' : 'blur-sm select-none'
                            }
                        >
                            { created.password }
                        </span>
                    </code>
                    <span className="absolute inset-y-0 right-3 flex items-center gap-3">
                        <DokanTooltip
                            content={
                                revealed
                                    ? __( 'Hide the password', 'dokan-lite' )
                                    : __( 'Show the password', 'dokan-lite' )
                            }
                        >
                            <button
                                type="button"
                                className={ fieldIconClass }
                                aria-label={
                                    revealed
                                        ? __(
                                              'Hide the password',
                                              'dokan-lite'
                                          )
                                        : __(
                                              'Show the password',
                                              'dokan-lite'
                                          )
                                }
                                aria-pressed={ revealed }
                                onClick={ () =>
                                    setRevealed( ( shown ) => ! shown )
                                }
                            >
                                { revealed ? (
                                    <EyeOff size={ 16 } />
                                ) : (
                                    <Eye size={ 16 } />
                                ) }
                            </button>
                        </DokanTooltip>
                        <CopyIcon
                            text={ created.password }
                            label={ __( 'Copy the password', 'dokan-lite' ) }
                        />
                    </span>
                </div>
                <span className="text-xs text-gray-600">
                    { __(
                        'Save it in a secure location, or copy the token for your assistant. Neither can be shown again, here or anywhere else.',
                        'dokan-lite'
                    ) }
                </span>
                { /* The panel's two actions as the dashboard's standard button pair: the main one filled, the way out outlined. */ }
                <div className="flex flex-wrap items-center gap-2">
                    <DokanTooltip
                        content={ __(
                            'Base64 of username:password. Send it as "Authorization: Basic <token>".',
                            'dokan-lite'
                        ) }
                    >
                        <span className="inline-flex">
                            <DokanButton
                                type="button"
                                variant="primary"
                                onClick={ tokenCopy.copy }
                            >
                                { tokenCopy.copied ? (
                                    <Check size={ 16 } />
                                ) : (
                                    <Copy size={ 16 } />
                                ) }
                                { tokenCopy.copied
                                    ? __( 'Copied', 'dokan-lite' )
                                    : __( 'Copy Token', 'dokan-lite' ) }
                            </DokanButton>
                        </span>
                    </DokanTooltip>
                    <DokanButton
                        type="button"
                        variant="secondary"
                        onClick={ onDismiss }
                    >
                        { __( 'Dismiss', 'dokan-lite' ) }
                    </DokanButton>
                </div>
            </div>
        </div>
    );
};

export default CreatedPasswordPanel;
