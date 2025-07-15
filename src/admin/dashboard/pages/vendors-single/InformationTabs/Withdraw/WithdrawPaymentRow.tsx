import { DokanButton } from "@dokan/components";
import { __ } from "@wordpress/i18n";
import { Plus, Settings } from "lucide-react";
import { ToggleSwitch } from "@getdokan/dokan-ui";
import Paypal from "@dokan/admin/dashboard/icons/payments/Paypal";
import DPaypal from "@dokan/admin/dashboard/icons/payments/DPaypal";
import Stripe from "@dokan/admin/dashboard/icons/payments/Stripe";
import DStripe from "@dokan/admin/dashboard/icons/payments/DStripe";
import Bank from "@dokan/admin/dashboard/icons/payments/Bank";
import Skrill from "@dokan/admin/dashboard/icons/payments/Skrill";
import Razorpay from "@dokan/admin/dashboard/icons/payments/Razorpay";
import MangopayNew from "@dokan/admin/dashboard/icons/payments/MangopayNew";
import Custom from "@dokan/admin/dashboard/icons/payments/Custom";

function WithdrawPaymentRow( { method, connected, settings, vendor } ) {

    const getPaymentIcon = ( method: string ) => {
        switch ( method ) {
            case 'paypal':
                return (
                    <span key={ method }>
                        <Paypal />
                    </span>
                );
            case 'dokan-paypal-marketplace':
                return (
                    <span key={ method }>
                        <DPaypal />
                    </span>
                );
            case 'dokan_stripe_express':
                return (
                    <span key={ method }>
                        <Stripe />
                    </span>
                );
            case 'dokan-stripe-connect':
                return (
                    <span key={ method }>
                        <DStripe />
                    </span>
                );
            case 'bank':
                return (
                    <span key={ method }>
                        <Bank />
                    </span>
                );
            case 'skrill':
                return (
                    <span key={ method }>
                        <Skrill />
                    </span>
                );
            case 'dokan_razorpay':
                return (
                    <span key={ method }>
                        <Razorpay />
                    </span>
                );
            case 'dokan_mangopay':
                return (
                    <span key={ method }>
                        <MangopayNew />
                    </span>
                );
            case 'dokan_custom':
                return (
                    <span key={ method }>
                        <Custom />
                    </span>
                );
            default:
                return '';
        }
    };
    const getPaymentMethodTitle = ( method: string ) => {
        if ( method === 'dokan_custom' ) {
            return (
                vendor?.payment?.dokan_custom?.withdraw_method_name ||
                __( 'Custom', 'dokan-lite' )
            );
        }

        return settings.withdraw_options[ method ];
    };

    return (
        <div
            className="flex flex-row p-6 border-b last:border-b-0"
        >
            <div className="w-[40%]">
                <p className="text-sm font-semibold">
                    { getPaymentMethodTitle( method ) }
                </p>
            </div>
            <div className="flex flex-row w-[60%]">
                <div className="flex justify-center w-1/3">
                    { getPaymentIcon( method ) }
                </div>
                <div className="flex justify-end w-1/3">
                    { connected ? (
                        <DokanButton
                            variant="secondary"
                            label={ __(
                                'Manege',
                                'dokan-lite'
                            ) }
                            icon={ () => (
                                <Settings size={ 15 } />
                            ) }
                            size="sm"
                            className="px-2 py-1 w-[80px] h-[26px]"
                        />
                    ) : (
                        <DokanButton
                            variant="secondary"
                            label={ __( 'Add', 'dokan-lite' ) }
                            icon={ () => <Plus size={ 15 } /> }
                            size="sm"
                            className="px-2 py-1 w-[80px] h-[26px]"
                        />
                    ) }
                </div>
                <div className="flex justify-end w-1/3">
                    { connected && (
                        <ToggleSwitch
                            checked={ false }
                            onChange={ () => {} }
                        />
                    ) }
                </div>
            </div>
        </div>
    );
}

export default WithdrawPaymentRow;
