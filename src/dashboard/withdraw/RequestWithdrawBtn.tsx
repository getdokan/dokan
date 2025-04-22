import { __, sprintf } from '@wordpress/i18n';
import {
    Modal,
    SimpleAlert,
    SimpleInput,
    SearchableSelect,
    useToast,
} from '@getdokan/dokan-ui';
import { DokanButton, DokanAlert, DokanMaskInput } from "@dokan/components";
import { RawHTML, useEffect, useState } from '@wordpress/element';
import '../../definitions/window-types';
import { useWithdraw } from './Hooks/useWithdraw';
import { useDebounceCallback } from 'usehooks-ts';
import { useCharge } from './Hooks/useCharge';
import { UseWithdrawSettingsReturn } from './Hooks/useWithdrawSettings';
import { UseWithdrawRequestsReturn } from './Hooks/useWithdrawRequests';
import { formatNumber } from '@dokan/utilities';
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
    const currencySymbol = window?.dokanFrontend?.currency?.symbol ?? '';
    const withdrawHook = useWithdraw();
    const toast = useToast();
    const [ withdrawMethod, setWithdrawMethod ] = useState( '' );
    const { fetchCharge, isLoading, data } = useCharge();
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

    const unformatNumber = ( value ) => {
        if ( value === '' ) {
            return value;
        }
        return window.accounting.unformat(
            value,
            window?.dokanFrontend?.currency.decimal
        );
    };

    function calculateWithdrawCharge( method, value ) {
        fetchCharge( method, value );
    }

    const getRecivableFormated = () => {
        if ( ! withdrawAmount ) {
            return formatNumber( 0 );
        }

        return formatNumber( data?.receivable ?? 0 );
    };
    const getChargeFormated = () => {
        let chargeText = '';
        if ( ! withdrawAmount ) {
            return formatNumber( 0 );
        }

        const fixed = data?.charge_data?.fixed
            ? Number( data?.charge_data?.fixed )
            : '';
        const percentage = data?.charge_data?.percentage
            ? Number( data?.charge_data?.percentage )
            : '';

        if ( fixed ) {
            chargeText += formatNumber( fixed );
        }

        if ( percentage ) {
            chargeText += chargeText ? ' + ' : '';
            chargeText += `${ percentage }%`;
            chargeText += ` = ${ formatNumber( data?.charge ) }`;
        }

        if ( ! chargeText ) {
            chargeText = formatNumber( data?.charge );
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
                title: __( 'Withdraw amount is required', 'dokan' ),
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
                    title: __( 'Withdraw request created.', 'dokan' ),
                    type: 'success',
                } );

                withdrawRequests.refresh();
            } )
            .catch( ( err ) => {
                let message = __( 'Failed to create withdraw.', 'dokan' );

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

    function handleWithdrawAmount( value ) {
        if ( ! value ) {
            value = 0;
        }
        setWithdrawAmount( value );
        calculateWithdrawCharge( withdrawMethod, unformatNumber( value ) );
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

    const WithdrawRequestForm = () => {
        return (
            <>
                { hasPaymentMethods ? (
                    <>
                        <div>
                            <SearchableSelect
                                label={ __( 'Withdraw method', 'dokan' ) }
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
                            <DokanMaskInput
                                namespace="withdraw-request"
                                label={ __( 'Withdraw amount', 'dokan' ) }
                                value={ withdrawAmount }
                                onChange={ ( e ) => {
                                    debouncedWithdrawAmount( e.target.value );
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
                                label={ __( 'Withdraw charge', 'dokan' ) }
                                className="pl-12"
                                addOnLeft={ currencySymbol }
                                value={
                                    isLoading
                                        ? __( 'Calculating…', 'dokan' )
                                        : getChargeFormated()
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
                                label={ __( 'Receivable amount', 'dokan' ) }
                                className="pl-12"
                                addOnLeft={ currencySymbol }
                                value={
                                    isLoading
                                        ? __( 'Calculating…', 'dokan' )
                                        : getRecivableFormated()
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
                { __( 'Request Withdraw', 'dokan' ) }
            </DokanButton>

            <Modal
                className="max-w-2xl dokan-withdraw-style-reset dokan-layout"
                isOpen={ isOpen }
                onClose={ () => setIsOpen( false ) }
                showXButton={ false }
            >
                <Modal.Title className="border-b">
                    { __( 'Send Withdraw Request', 'dokan' ) }
                </Modal.Title>
                <Modal.Content className="">
                    <ModalContect />
                </Modal.Content>
                <Modal.Footer className="border-t">
                    <div className="flex flex-row gap-3">
                        <DokanButton
                            onClick={ () => setIsOpen( false ) }
                            variant="secondary"
                        >
                            { __( 'Close', 'dokan' ) }
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
                                        ? __( 'Creating…', 'dokan' )
                                        : __( 'Submit request', 'dokan' ) }
                                </DokanButton>
                            ) }
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default RequestWithdrawBtn;
