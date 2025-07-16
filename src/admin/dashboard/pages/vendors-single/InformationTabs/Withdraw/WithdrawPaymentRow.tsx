import { __ } from '@wordpress/i18n';
import { ToggleSwitch } from '@getdokan/dokan-ui';
import Paypal from '@dokan/admin/dashboard/icons/payments/Paypal';
import DPaypal from '@dokan/admin/dashboard/icons/payments/DPaypal';
import Stripe from '@dokan/admin/dashboard/icons/payments/Stripe';
import DStripe from '@dokan/admin/dashboard/icons/payments/DStripe';
import Bank from '@dokan/admin/dashboard/icons/payments/Bank';
import Skrill from '@dokan/admin/dashboard/icons/payments/Skrill';
import Razorpay from '@dokan/admin/dashboard/icons/payments/Razorpay';
import MangopayNew from '@dokan/admin/dashboard/icons/payments/MangopayNew';
import Custom from '@dokan/admin/dashboard/icons/payments/Custom';
import { useState } from '@wordpress/element';
import MethodAction from '@dokan/admin/dashboard/pages/vendors-single/InformationTabs/Withdraw/MethodAction';
import { Vendor } from '@dokan/definitions/dokan-vendors';

function WithdrawPaymentRow( {
    method,
    connected,
    settings,
    vendor,
    className = '',
}: {
    method: string;
    connected: boolean;
    settings: Record< any, any >;
    vendor: Vendor;
    className?: string;
} ) {
    const [ toggleEnabled, setToggleEnabled ] = useState( false );
    const getPaymentIcon = ( selectedMethod: string ) => {
        switch ( selectedMethod ) {
            case 'paypal':
                return (
                    <span key={ selectedMethod }>
                        <Paypal />
                    </span>
                );
            case 'dokan-paypal-marketplace':
                return (
                    <span key={ selectedMethod }>
                        <DPaypal />
                    </span>
                );
            case 'dokan_stripe_express':
                return (
                    <span key={ selectedMethod }>
                        <Stripe />
                    </span>
                );
            case 'dokan-stripe-connect':
                return (
                    <span key={ selectedMethod }>
                        <DStripe />
                    </span>
                );
            case 'bank':
                return (
                    <span key={ selectedMethod }>
                        <Bank />
                    </span>
                );
            case 'skrill':
                return (
                    <span key={ selectedMethod }>
                        <Skrill />
                    </span>
                );
            case 'dokan_razorpay':
                return (
                    <span key={ selectedMethod }>
                        <Razorpay />
                    </span>
                );
            case 'dokan_mangopay':
                return (
                    <span key={ selectedMethod }>
                        <MangopayNew />
                    </span>
                );
            case 'dokan_custom':
                return (
                    <span key={ selectedMethod }>
                        <Custom />
                    </span>
                );
            default:
                return '';
        }
    };
    const getPaymentMethodTitle = ( selectedMethod: string ) => {
        if ( selectedMethod === 'dokan_custom' ) {
            return (
                vendor?.payment?.dokan_custom?.withdraw_method_name ||
                __( 'Custom', 'dokan-lite' )
            );
        }

        return settings.withdraw_options[ selectedMethod ];
    };

    return (
        <div className={ className }>
            <div className="flex flex-row pt-3 pb-3 pl-6 pr-6">
                <div className="w-[40%] flex justify-start items-center text-sm font-semibold">
                    { getPaymentMethodTitle( method ) }
                </div>
                <div className="flex flex-row w-[60%]">
                    <div className="flex justify-center w-1/3">
                        { getPaymentIcon( method ) }
                    </div>
                    <div className="flex justify-end w-1/3">
                        <MethodAction
                            connected={ connected }
                            method={ method }
                            settings={ settings }
                            vendor={ vendor }
                        />
                    </div>
                    <div className="flex justify-end w-1/3">
                        { connected && (
                            <ToggleSwitch
                                checked={ toggleEnabled }
                                onChange={ setToggleEnabled }
                            />
                        ) }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WithdrawPaymentRow;
