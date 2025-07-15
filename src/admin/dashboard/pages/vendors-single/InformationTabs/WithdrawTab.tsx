import { Vendor, VendorStats } from '@dokan/definitions/dokan-vendors';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Card } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import WithdrawTabSkeleton from '@dokan/admin/dashboard/pages/vendors-single/InformationTabs/WithdrawTabSkeleton';
import Badge from '@dokan/components/Badge';
import WithdrawPaymentRow from '@dokan/admin/dashboard/pages/vendors-single/InformationTabs/Withdraw/WithdrawPaymentRow';

interface WithdrawTabProps {
    vendor: Vendor;
    vendorStats: VendorStats | null;
}

const WithdrawTab = ( { vendor }: WithdrawTabProps ) => {
    const [ settings, setSettings ] = useState< any >( {} );
    const [ isLoading, setIsLoading ] = useState( true );

    const getPrintableMethods = ( connected = true ) => {
        if ( ! settings || ! settings.active_payment_methods ) {
            return [];
        }

        const vendorConnedectedMethods = Object.keys( vendor?.payment || {} );
        const activeMethods = Object.keys(
            settings?.active_payment_methods || {}
        );

        return activeMethods.filter( ( method: string ) => {
            if ( connected ) {
                return vendorConnedectedMethods.includes( method );
            }
            return ! vendorConnedectedMethods.includes( method );
        } );
    };

    const paymentMethodsHtml = ( connected = true ) => {
        const methods = getPrintableMethods( connected );
        // const methods = [
        //     'paypal',
        //     'dokan-paypal-marketplace',
        //     'dokan_stripe_express',
        //     'dokan-stripe-connect',
        //     'bank',
        //     'skrill',
        //     'dokan_razorpay',
        //     'dokan_mangopay',
        //     'dokan_custom',
        // ];
        return (
            <div className="flex flex-col border rounded">
                { methods.map( ( method: string, index ) => {
                    return (
                        <WithdrawPaymentRow
                            key={ index }
                            method={ method }
                            connected={ connected }
                            settings={ settings }
                            vendor={ vendor }
                        />
                    );
                } ) }
            </div>
        );
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
                    <Badge
                        label={ __( 'Connected', 'dokan-lite' ) }
                        variant="success"
                    />
                </div>
                <div>{ paymentMethodsHtml( true ) }</div>
            </div>
            <div className="mt-6">
                <div className="mb-2">
                    <Badge
                        label={ __( 'Not Connected', 'dokan-lite' ) }
                        variant="secondary"
                        className="text-neutral-700 border-neutral-700"
                    />
                </div>
                <div>{ paymentMethodsHtml( false ) }</div>
            </div>
        </Card>
    );
};

export default WithdrawTab;
