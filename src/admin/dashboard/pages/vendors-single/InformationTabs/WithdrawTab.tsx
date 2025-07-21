import { Vendor, VendorStats } from '@dokan/definitions/dokan-vendors';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Card } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import WithdrawTabSkeleton from '@dokan/admin/dashboard/pages/vendors-single/InformationTabs/WithdrawTabSkeleton';
import Badge from '@dokan/components/Badge';
import WithdrawPaymentRow from '@dokan/admin/dashboard/pages/vendors-single/InformationTabs/Withdraw/WithdrawPaymentRow';
import { addQueryArgs } from '@wordpress/url';
import Alert from "@dokan/components/Alert";

interface WithdrawTabProps {
    vendor: Vendor;
    vendorStats: VendorStats | null;
}

const WithdrawTab = ( { vendor }: WithdrawTabProps ) => {
    const [ settings, setSettings ] = useState< any >( {} );
    const [ isLoading, setIsLoading ] = useState( true );

    const getPrintableMethods = ( connected = true ) => {
        if ( ! settings ) {
            return [];
        }

        const connectedMethods = Object.keys(
            settings?.connected_methods || {}
        );
        const disconnectedMethods = Object.keys(
            settings?.disconnected_methods || {}
        );

        const activeMethods = Object.keys(
            settings?.active_payment_methods || {}
        );

        const methods = connected ? connectedMethods : disconnectedMethods;

        return activeMethods.filter( ( method: string ) => {
            return methods.includes( method );
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
        if ( methods.length === 0 ) {
            const message = connected
                ? __( 'No connected payment methods found' )
                : __( 'No disconnected payment methods found' );
            return (
                <div>
                    <Alert label={ message } variant="info"/>
                </div>
            );
        }
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
                            className="border-b last:border-b-0"
                        />
                    );
                } ) }
            </div>
        );
    };

    useEffect( () => {
        apiFetch( {
            path: addQueryArgs( 'dokan/v1/settings', {
                vendor_id: vendor?.id,
            } ),
        } )
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
