import { Vendor, VendorStats } from '@dokan/definitions/dokan-vendors';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Card } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import Bank from '@dokan/admin/dashboard/icons/payments/Bank';
import DPaypal from '@dokan/admin/dashboard/icons/payments/DPaypal';
import Stripe from '@dokan/admin/dashboard/icons/payments/Stripe';
import DStripe from '@dokan/admin/dashboard/icons/payments/DStripe';
import Paypal from '@dokan/admin/dashboard/icons/payments/Paypal';
import Razorpay from '@dokan/admin/dashboard/icons/payments/Razorpay';
import PaymentBag from '@dokan/admin/dashboard/icons/payments/PaymentBag';
import MangopayNew from '@dokan/admin/dashboard/icons/payments/MangopayNew';
import SkrillNew from '@dokan/admin/dashboard/icons/payments/SkrillNew';
import WithdrawTabSkeleton from '@dokan/admin/dashboard/pages/vendors-single/InformationTabs/WithdrawTabSkeleton';

interface WithdrawTabProps {
    vendor: Vendor;
    vendorStats: VendorStats | null;
}

const WithdrawTab = ( { vendor, vendorStats }: WithdrawTabProps ) => {
    const [ settings, setSettings ] = useState< any >( {} );
    const [ isLoading, setIsLoading ] = useState( true );

    const getPaymentMethods = ( connected = true ) => {
        if ( ! settings || ! settings.active_payment_methods ) {
            return '';
        }

        const vendorConnedectedMethods = Object.keys( vendor?.payment || {} );
        const activeMethods = Object.keys(
            settings?.active_payment_methods || {}
        );

        return activeMethods
            .filter( ( method: string ) => {
                if ( connected ) {
                    return vendorConnedectedMethods.includes( method );
                }
                return ! vendorConnedectedMethods.includes( method );
            } )
            .map( ( method: string ) => {
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
                                <SkrillNew />
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
                            <span
                                key={ method }
                                className="payment-chip flex items-center pt-0 pl-[10px] pb-0 pr-[10px] bg-[#FFF2FF] rounded-[3px]"
                            >
                                <PaymentBag />
                                <span className="text-[#7C327C] text-[13px] font-[600] ml-[5px]">
                                    { vendor?.payment?.dokan_custom
                                        ?.withdraw_method_name ||
                                        __( 'Custom', 'dokan-lite' ) }
                                </span>
                            </span>
                        );
                    default:
                        return '';
                }
            } );
    };

    useEffect( () => {
        apiFetch( { path: 'dokan/v1/settings' } )
            .then( ( data ) => {
                setIsLoading( false );
                setSettings( data );
            } )
            .catch( () => {
                setIsLoading( false );
                setSettings( {} );
            } );
    }, [] );

    if ( isLoading ) {
        return <WithdrawTabSkeleton />;
    }

    return (
        <Card className="bg-white shadow p-6">
            <div>
                <div className="mb-2">
                    <h4 className="text-zinc-500 text-xs font-normal">
                        { __( 'Connected', 'dokan-lite' ) }
                    </h4>
                </div>
                <div>
                    <div className="text-[35px] flex flex-wrap gap-2">
                        { getPaymentMethods( true ) }
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <div className="mb-2">
                    <h4 className="text-zinc-500 text-xs font-normal">
                        { __( 'Not Connected', 'dokan-lite' ) }
                    </h4>
                </div>
                <div>
                    <div className="text-[35px] flex flex-wrap gap-2 grayscale">
                        { getPaymentMethods( false ) }
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default WithdrawTab;
