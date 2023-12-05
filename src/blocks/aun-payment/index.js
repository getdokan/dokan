/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
const { registerPaymentMethod } = window.wc.wcBlocksRegistry;

const canMakePayment = ( { cartNeedsShipping, selectedShippingMethods } ) => {
  return true;
};


const options = {
  name: 'aun-payment',
  label: <strong>Aun Pay</strong>,
  content: <p>This is aun pay content.</p>,
  edit: <p>This is aun pay content.</p>,
  canMakePayment,
  ariaLabel: __(
    'Aun payment method',
    'dokan'
  ),
  supports: {
    // Use `false` as fallback values in case server provided configuration is missing.
    showSavedCards: true,
    showSaveOption: true,
  },
};

registerPaymentMethod( options );
