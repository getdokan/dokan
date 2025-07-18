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
                    <span
                        className="flex justify-center items-center"
                        key={ selectedMethod }
                    >
                        <Paypal />
                    </span>
                );
            case 'dokan-paypal-marketplace':
                return (
                    <span
                        className="flex justify-center items-center"
                        key={ selectedMethod }
                    >
                        <DPaypal />
                    </span>
                );
            case 'dokan_stripe_express':
                return (
                    <span
                        className="flex justify-center items-center"
                        key={ selectedMethod }
                    >
                        <Stripe />
                    </span>
                );
            case 'dokan-stripe-connect':
                return (
                    <span
                        className="flex justify-center items-center"
                        key={ selectedMethod }
                    >
                        <DStripe />
                    </span>
                );
            case 'bank':
                return (
                    <span
                        className="flex justify-center items-center"
                        key={ selectedMethod }
                    >
                        <Bank />
                    </span>
                );
            case 'skrill':
                return (
                    <span
                        className="flex justify-center items-center"
                        key={ selectedMethod }
                    >
                        <Skrill />
                    </span>
                );
            case 'dokan_razorpay':
                return (
                    <span
                        className="flex justify-center items-center"
                        key={ selectedMethod }
                    >
                        <Razorpay />
                    </span>
                );
            case 'dokan_mangopay':
                return (
                    <span
                        className="flex justify-center items-center"
                        key={ selectedMethod }
                    >
                        <MangopayNew />
                    </span>
                );
            case 'dokan_custom':
                return (
                    <span
                        className="flex justify-center items-center"
                        key={ selectedMethod }
                    >
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

    const getPaymentMethodDescription = ( method ) => {
        if ( connected ) {
            return settings?.connected_methods[ method ]?.description ?? '';
        }
        return settings?.disconnected_methods[ method ]?.description ?? '';
    };

    return (
        <div className={ className }>
            <div className="flex flex-row pt-3 pb-3 pl-6 pr-6">
                <div className="w-[40%] flex flex-col gap-2">
                    <p className="text-sm font-semibold">
                        { getPaymentMethodTitle( method ) }
                    </p>
                    <p>{ getPaymentMethodDescription( method ) }</p>
                </div>
                <div className="flex flex-row w-[60%]">
                    <div className="flex justify-center w-1/2">
                        { getPaymentIcon( method ) }
                    </div>
                    <div className="flex justify-end w-1/2">
                        <MethodAction
                            connected={ connected }
                            method={ method }
                            settings={ settings }
                            vendor={ vendor }
                        />
                    </div>
                    { /*<div className="flex justify-end w-1/3">*/ }
                    { /*    { connected && (*/ }
                    { /*        <ToggleSwitch*/ }
                    { /*            checked={ toggleEnabled }*/ }
                    { /*            onChange={ setToggleEnabled }*/ }
                    { /*        />*/ }
                    { /*    ) }*/ }
                    { /*</div>*/ }
                </div>
            </div>
        </div>
    );
}

export default WithdrawPaymentRow;
