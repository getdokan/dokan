import { __ } from '@wordpress/i18n';
import { Button, Modal } from '@wordpress/components';
import { useEditorContext } from '../context';
import type { Row } from '../types';

interface Props {
    row: Row;
    onClose: () => void;
}

// "Why is this off?": username and password follow WooCommerce's account settings.
export default function WooCommerceModal( { row, onClose }: Props ) {
    const { data } = useEditorContext();
    const isPassword = 'password' === row.id;
    // With the Checkout block, WooCommerce hides "Generate account login", so there's nothing to change.
    const noSetting = ! isPassword && data.woocommerce.usesCheckoutBlock;

    const title = isPassword
        ? __( 'Password isn’t asked', 'dokan-lite' )
        : __( 'Username isn’t asked', 'dokan-lite' );

    let body: string[];

    if ( isPassword ) {
        body = [
            __(
                'WooCommerce emails new users a link to set their password.',
                'dokan-lite'
            ),
            __(
                'To ask for one, turn off “Send password setup link” in WooCommerce → Accounts & Privacy.',
                'dokan-lite'
            ),
        ];
    } else if ( noSetting ) {
        body = [
            __(
                'WooCommerce creates the username from the email address.',
                'dokan-lite'
            ),
            __(
                'Your store uses the Checkout block, where WooCommerce has no setting to ask for a username.',
                'dokan-lite'
            ),
        ];
    } else {
        body = [
            __(
                'WooCommerce creates the username from the email address.',
                'dokan-lite'
            ),
            __(
                'To ask for one, turn off “Generate account login” in WooCommerce → Accounts & Privacy.',
                'dokan-lite'
            ),
        ];
    }

    return (
        <Modal title={ title } onRequestClose={ onClose } size="small">
            { body.map( ( text ) => (
                <p key={ text }>{ text }</p>
            ) ) }
            <p className="dokan-vreg-editor__muted">
                { __(
                    'You can edit its label once WooCommerce asks for it.',
                    'dokan-lite'
                ) }
            </p>
            <div className="dokan-vreg-editor__modal-actions">
                <Button variant="tertiary" onClick={ onClose }>
                    { __( 'Close', 'dokan-lite' ) }
                </Button>
                { ! noSetting && (
                    <Button
                        variant="primary"
                        href={ data.woocommerce.settingsUrl }
                        target="_blank"
                        icon="external"
                        iconPosition="right"
                    >
                        { __( 'Open WooCommerce settings', 'dokan-lite' ) }
                    </Button>
                ) }
            </div>
        </Modal>
    );
}
