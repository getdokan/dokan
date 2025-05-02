import { __, sprintf } from '@wordpress/i18n';
import {
    Modal,
    SimpleAlert,
    SimpleInput,
    SearchableSelect,
    useToast,
} from '@getdokan/dokan-ui';
import { DokanButton, DokanAlert, DokanPriceInput } from '@dokan/components';
import { RawHTML, useEffect, useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import '../../definitions/window-types';
import { useWithdraw } from './Hooks/useWithdraw';
import { useDebounceCallback } from 'usehooks-ts';
import { useCharge } from './Hooks/useCharge';
import { UseWithdrawSettingsReturn } from './Hooks/useWithdrawSettings';
import { UseWithdrawRequestsReturn } from './Hooks/useWithdrawRequests';
import { formatPrice, unformatNumber } from '@dokan/utilities';
import { UseBalanceReturn } from './Hooks/useBalance';

function RequestWithdrawBtn( {
    settings,
    withdrawRequests,
    balanceData,
}: {
    settings: UseWithdrawSettingsReturn;
    withdrawRequests: UseWithdrawRequestsReturn;
    balanceData: UseBalanceReturn;
} ) {
    const [ isOpen, setIsOpen ] = useState( false );
    const [ withdrawAmount, setWithdrawAmount ] = useState( '' );
    const withdrawHook = useWithdraw();
    const toast = useToast();
    const [ withdrawMethod, setWithdrawMethod ] = useState( '' );
    const { fetchCharge, isLoading, data, error } = useCharge();
    const hasWithdrawRequests =
        withdrawRequests?.data &&
        Array.isArray( withdrawRequests?.data ) &&
        withdrawRequests?.data?.length > 0;
    const hasPaymentMethods =
        settings?.data?.payment_methods &&
        Array.isArray( settings?.data?.payment_methods ) &&
        settings?.data?.payment_methods.length > 0;
    const hasSuffcientBalance =
        Number( balanceData?.data?.current_balance ) >=
        Number( balanceData?.data?.withdraw_limit );

    function calculateWithdrawCharge( method, value ) {
        fetchCharge( method, value );
    }

    const getRecivableFormated = () => {
        if ( ! withdrawAmount ) {
            return formatPrice( 0 );
        }

        return formatPrice( data?.receivable ?? 0 );
    };
    const getChargeFormated = () => {
        let chargeText = '';
        if ( ! withdrawAmount ) {
            return formatPrice( 0 );
        }

        const fixed = data?.charge_data?.fixed
            ? Number( data?.charge_data?.fixed )
            : '';
        const percentage = data?.charge_data?.percentage
            ? Number( data?.charge_data?.percentage )
            : '';

        if ( fixed ) {
            chargeText += formatPrice( fixed );
        }

        if ( percentage ) {
            chargeText += chargeText ? ' + ' : '';
            chargeText += `${ percentage }%`;
            chargeText += ` = ${ formatPrice( data?.charge ) }`;
        }

        if ( ! chargeText ) {
            chargeText = formatPrice( data?.charge ).toString();
        }

        return chargeText;
    };
    const handleCreateWithdraw = () => {
        const payload = {
            method: withdrawMethod,
            amount: unformatNumber( withdrawAmount ),
        };

        if ( ! payload.amount ) {
            toast( {
                title: __( 'Withdraw amount is required', 'dokan-lite' ),
                type: 'error',
            } );
            return;
        }

        // Call the createWithdraw function here
        withdrawHook
            .createWithdraw( payload )
            .then( () => {
                setIsOpen( false );
                toast( {
                    title: __( 'Withdraw request created.', 'dokan-lite' ),
                    type: 'success',
                } );

                withdrawRequests.refresh();
            } )
            .catch( ( err ) => {
                let message = __( 'Failed to create withdraw.', 'dokan-lite' );

                if ( err?.message ) {
                    // @ts-ignore
                    message = <RawHTML>{ err?.message }</RawHTML>;
                }

                toast( {
                    title: message,
                    type: 'error',
                } );
            } );
    };

    function handleWithdrawAmount( rawValue, priceValue ) {
        setWithdrawAmount( rawValue );
        calculateWithdrawCharge( withdrawMethod, priceValue );
    }

    const debouncedWithdrawAmount = useDebounceCallback(
        handleWithdrawAmount,
        500
    );

    const getSelectValue = ( value: any ) => {
        return settings?.data?.payment_methods.find(
            ( item: Record< any, any > ) => {
                return item.value === value;
            }
        );
    };

    useEffect( () => {
        if ( error && error?.message && error?.message.length > 0 ) {
            toast( {
                title: error?.message,
                type: 'error',
            } );
        }
    }, [ error ] );

    const WithdrawRequestForm = () => {
        return (
            <>
                { hasPaymentMethods ? (
                    <>
                        <div>
                            <SearchableSelect
                                label={ __( 'Withdraw method', 'dokan-lite' ) }
                                value={ getSelectValue( withdrawMethod ) }
                                onChange={ ( e ) => {
                                    setWithdrawMethod( e.value );
                                    calculateWithdrawCharge(
                                        e.value,
                                        unformatNumber( withdrawAmount )
                                    );
                                } }
                                options={ settings?.data?.payment_methods }
                            />
                        </div>
                        <div className="mt-3">
                            <DokanPriceInput
                                namespace="withdraw-request"
                                label={ __( 'Withdraw amount', 'dokan' ) }
                                value={ withdrawAmount }
                                onChange={ (
                                    formatedValue,
                                    unformattedValue
                                ) => {
                                    debouncedWithdrawAmount(
                                        formatedValue,
                                        unformattedValue
                                    );
                                } }
                                input={ {
                                    id: 'withdraw-amount',
                                    name: 'withdraw-amount',
                                    placeholder: __( 'Enter amount', 'dokan' ),
                                } }
                            />
                        </div>
                        <div className="mt-3">
                            <SimpleInput
                                label={ __( 'Withdraw charge', 'dokan-lite' ) }
                                value={
                                    isLoading
                                        ? __( 'Calculating…', 'dokan-lite' )
                                        : decodeEntities(
                                              getChargeFormated() as string
                                          )
                                }
                                input={ {
                                    id: 'withdraw-charge',
                                    name: 'withdraw-charge',
                                    type: 'text',
                                    placeholder: '',
                                    disabled: true,
                                } }
                            />
                        </div>
                        <div className="mt-3">
                            <SimpleInput
                                label={ __(
                                    'Receivable amount',
                                    'dokan-lite'
                                ) }
                                value={
                                    isLoading
                                        ? __( 'Calculating…', 'dokan-lite' )
                                        : decodeEntities(
                                              getRecivableFormated() as string
                                          )
                                }
                                input={ {
                                    id: 'receivable-amount',
                                    name: 'receivable-amount',
                                    type: 'text',
                                    placeholder: '',
                                    disabled: true,
                                } }
                            />
                        </div>
                    </>
                ) : (
                    <DokanAlert
                        variant="warning"
                        label={ __(
                            'No payment methods found to submit a withdrawal request.',
                            'dokan-lite'
                        ) }
                    >
                        <div className="text-sm mt-1 font-light">
                            <RawHTML>
                                { sprintf(
                                    /* translators: %s: opening and closing anchor tags for "payment methods" link */
                                    __(
                                        'Please set up your %1$spayment methods%2$s first.',
                                        'dokan-lite'
                                    ),
                                    `<a href="${ window?.dokanFrontend?.withdraw?.paymentSettingUrl }" class="dokan-link">`,
                                    '</a>'
                                ) }
                            </RawHTML>
                        </div>
                    </DokanAlert>
                ) }
            </>
        );
    };

    useEffect( () => {
        if ( settings?.data?.payment_methods.length > 0 ) {
            setWithdrawMethod( settings?.data?.payment_methods[ 0 ].value );
        }
    }, [ settings ] );

    const ModalContect = () => {
        if ( hasWithdrawRequests ) {
            return (
                <SimpleAlert
                    type="danger"
                    color="red"
                    label={ __(
                        'You already have pending withdraw request(s). Please submit your request after approval or cancellation of your previous request.',
                        'dokan-lite'
                    ) }
                />
            );
        } else if ( ! hasSuffcientBalance ) {
            return (
                <SimpleAlert
                    type="danger"
                    color="red"
                    label={ __(
                        "You don't have sufficient balance for a withdraw request!",
                        'dokan-lite'
                    ) }
                />
            );
        }
        return <WithdrawRequestForm />;
    };

    return (
        <>
            <DokanButton onClick={ () => setIsOpen( true ) }>
                { __( 'Request Withdraw', 'dokan-lite' ) }
            </DokanButton>

            <Modal
                className="max-w-2xl dokan-withdraw-style-reset dokan-layout"
                isOpen={ isOpen }
                onClose={ () => setIsOpen( false ) }
                showXButton={ false }
            >
                <Modal.Title className="border-b">
                    { __( 'Send Withdraw Request', 'dokan-lite' ) }
                </Modal.Title>
                <Modal.Content className="">
                    <ModalContect />
                </Modal.Content>
                <Modal.Footer className="border-t">
                    <div className="flex flex-row gap-3 justify-end">
                        <DokanButton
                            onClick={ () => setIsOpen( false ) }
                            variant="secondary"
                        >
                            { __( 'Close', 'dokan-lite' ) }
                        </DokanButton>

                        { ! hasWithdrawRequests &&
                            hasSuffcientBalance &&
                            hasPaymentMethods && (
                                <DokanButton
                                    onClick={ handleCreateWithdraw }
                                    disabled={
                                        isLoading || withdrawHook?.isLoading
                                    }
                                    loading={ withdrawHook?.isLoading }
                                >
                                    { withdrawHook?.isLoading
                                        ? __( 'Creating…', 'dokan-lite' )
                                        : __( 'Submit request', 'dokan-lite' ) }
                                </DokanButton>
                            ) }
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default RequestWithdrawBtn;
