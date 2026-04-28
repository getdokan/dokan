import { Card, useToast } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { DokanButton, DokanModal } from '@dokan/components';
import { UseVendorDueStatusReturn } from './Hooks/useVendorDueStatus';
import { UseAddToCartReturn } from './Hooks/useAddToCart';
import { formatPrice } from '@dokan/utilities';
import { decodeEntities } from '@wordpress/html-entities';

const Loader = () => (
    <Card>
        <Card.Header>
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        </Card.Header>
        <Card.Body>
            <div className="space-y-4">
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
        </Card.Body>
    </Card>
);

function ReverseWithdrawalBalance( {
    dueStatus,
    addToCartHook,
}: {
    dueStatus: UseVendorDueStatusReturn;
    addToCartHook: UseAddToCartReturn;
} ) {
    const toast = useToast();
    const [ isConfirm, setIsConfirm ] = useState( false );

    if ( ! dueStatus || dueStatus.isLoading ) {
        return <Loader />;
    }

    const data = dueStatus.data;
    if ( ! data ) {
        return null;
    }

    const handlePayNow = async () => {
        try {
            await addToCartHook.addToCart( data.payable_amount );
            // @ts-ignore
            const checkoutUrl = window.dokan?.reverse_withdrawal?.checkout_url;
            if ( checkoutUrl ) {
                window.location.href = checkoutUrl;
            }
        } catch ( err ) {
            toast( {
                type: 'error',
                title:
                    err instanceof Error
                        ? err.message
                        : __( 'Failed to process payment', 'dokan-lite' ),
            } );
        } finally {
            setIsConfirm( false );
        }
    };

    return (
        <>
            <Card className="dokan-layout">
                <Card.Header>
                    <Card.Title className="p-0 m-0">
                        { __( 'Reverse Withdrawal Balance', 'dokan-lite' ) }
                    </Card.Title>
                </Card.Header>
                <Card.Body>
                    <div className="flex flex-col md:flex-row! sm:items-center! justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="text-gray-700 flex gap-1">
                                <span>
                                    { __(
                                        'Reverse Pay Balance:',
                                        'dokan-lite'
                                    ) }
                                </span>
                                <span className="font-semibold">
                                    { data.balance < 0 ? '( ' : '' }
                                    <span className="inline-flex">
                                        { decodeEntities(
                                            formatPrice(
                                                Math.abs( data.balance )
                                            )
                                        ) }
                                    </span>
                                    { data.balance < 0 ? ' )' : '' }
                                </span>
                            </div>
                            { data.billing_type === 'by_amount' && (
                                <div className="text-gray-700 flex gap-1">
                                    <span>
                                        { __( 'Threshold:', 'dokan-lite' ) }
                                    </span>
                                    <span className="font-semibold">
                                        <span className="inline-flex">
                                            { decodeEntities(
                                                formatPrice( data.threshold )
                                            ) }
                                        </span>
                                    </span>
                                </div>
                            ) }
                            { data.billing_type === 'by_month' && (
                                <div className="text-gray-700 flex gap-1">
                                    <span>
                                        { __(
                                            'Payable Amount:',
                                            'dokan-lite'
                                        ) }
                                    </span>
                                    <span className="font-semibold">
                                        { data.payable_amount < 0 ? '( ' : '' }
                                        <span className="inline-flex">
                                            { decodeEntities(
                                                formatPrice(
                                                    Math.abs(
                                                        data.payable_amount
                                                    )
                                                )
                                            ) }
                                        </span>
                                        { data.payable_amount < 0 ? ' )' : '' }
                                    </span>
                                </div>
                            ) }
                        </div>
                        { data.payable_amount > 0 && (
                            <DokanButton
                                variant="primary"
                                label={ __( 'Pay Now', 'dokan-lite' ) }
                                onClick={ () => setIsConfirm( true ) }
                                loading={ addToCartHook.isLoading }
                            />
                        ) }
                    </div>
                </Card.Body>
            </Card>

            <DokanModal
                namespace="reverse-withdrawal-pay"
                isOpen={ isConfirm }
                onClose={ () => setIsConfirm( false ) }
                dialogTitle={ __( 'Reverse Withdrawal Payment', 'dokan-lite' ) }
                onConfirm={ handlePayNow }
                confirmationTitle={ __(
                    'Are you sure you want to pay this amount?',
                    'dokan-lite'
                ) }
                confirmationDescription={ data.formatted_payable_amount }
                confirmButtonText={ __( 'Pay Now', 'dokan-lite' ) }
                cancelButtonText={ __( 'Cancel', 'dokan-lite' ) }
                loading={ addToCartHook.isLoading }
            />
        </>
    );
}

export default ReverseWithdrawalBalance;
