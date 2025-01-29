import { __, sprintf } from '@wordpress/i18n';
import {
    Button,
    MaskedInput,
    Modal,
    SimpleAlert,
    SimpleInput,
    SimpleSelect,
    useToast,
} from '@getdokan/dokan-ui';
import { useEffect, useState } from '@wordpress/element';
import '../../Definitions/window-types';
import { useWithdraw } from './Hooks/useWithdraw';
import { useDebounceCallback } from 'usehooks-ts';
import { useCharge } from './Hooks/useCharge';
import { UseWithdrawSettingsReturn } from './Hooks/useWithdrawSettings';
import { UseWithdrawRequestsReturn } from './Hooks/useWithdrawRequests';
import { formatPrice } from '@/utilities';

function RequestWithdrawBtn( {
    settings,
    withdrawRequests,
}: {
    settings: UseWithdrawSettingsReturn;
    withdrawRequests: UseWithdrawRequestsReturn;
} ) {
    const [ isOpen, setIsOpen ] = useState( false );
    const [ withdrawAmount, setWithdrawAmount ] = useState( '' );
    const currencySymbol = window?.dokanFrontend?.dokanCurrency?.symbol ?? '';
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

    const unformatNumber = ( value ) => {
        if ( value === '' ) {
            return value;
        }
        return window.accounting.unformat(
            value,
            window?.dokanFrontend?.dokanCurrency.decimal
        );
    };

    function calculateWithdrawCharge( method, value ) {
        fetchCharge( method, value );
    }

    const getRecivableFormated = () => {
        if ( ! withdrawAmount ) {
            return formatPrice( '', '' );
        }

        return formatPrice( data?.receivable ?? '', '' );
    };
    const getChargeFormated = () => {
        let chargeText = '';
        if ( ! withdrawAmount ) {
            return formatPrice( '', '' );
        }

        const fixed = data?.charge_data?.fixed
            ? Number( data?.charge_data?.fixed )
            : '';
        const percentage = data?.charge_data?.percentage
            ? Number( data?.charge_data?.percentage )
            : '';

        if ( fixed ) {
            chargeText += formatPrice( fixed, '' );
        }

        if ( percentage ) {
            chargeText += chargeText ? ' + ' : '';
            chargeText += `${ percentage }%`;
            chargeText += ` = ${ formatPrice( data?.charge, '' ) }`;
        }

        if ( ! chargeText ) {
            chargeText = formatPrice( data?.charge, '' );
        }

        return chargeText;
    };
    const handleCreateWithdraw = () => {
        const payload = {
            method: withdrawMethod,
            amount: unformatNumber( withdrawAmount ),
        };

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
                toast( {
                    title:
                        err?.message ??
                        __( 'Failed to create withdraw.', 'dokan' ),
                    type: 'error',
                } );
                console.error( 'Error creating withdraw:', err );
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

    const withdrawRequestForm = () => {
        return (
            <>
                { hasPaymentMethods ? (
                    <>
                        <div>
                            <SimpleSelect
                                label={ __( 'Withdraw method', 'dokan' ) }
                                value={ withdrawMethod }
                                onChange={ ( e ) => {
                                    setWithdrawMethod( e.target.value );
                                    calculateWithdrawCharge(
                                        e.target.value,
                                        unformatNumber( withdrawAmount )
                                    );
                                } }
                                options={ settings?.data?.payment_methods }
                            />
                        </div>
                        <div className="mt-3">
                            <MaskedInput
                                label={ __( 'Withdraw amount', 'dokan' ) }
                                className="focus:border-none"
                                addOnLeft={ currencySymbol }
                                defaultValue={ withdrawAmount }
                                onChange={ ( e ) => {
                                    debouncedWithdrawAmount( e.target.value );
                                } }
                                maskRule={ {
                                    numeral: true,
                                    numeralDecimalMark:
                                        window?.dokanFrontend?.dokanCurrency
                                            ?.decimal ?? '.',
                                    delimiter:
                                        window?.dokanFrontend?.dokanCurrency
                                            ?.thousand ?? ',',
                                    numeralDecimalScale:
                                        window?.dokanFrontend?.dokanCurrency
                                            ?.precision ?? 2,
                                } }
                                input={ {
                                    id: 'withdraw-amount',
                                    name: 'withdraw-amount',
                                    type: 'text',
                                    placeholder: __( 'Enter amount', 'dokan' ),
                                    required: true,
                                    disabled: false,
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
                    <SimpleAlert type="warning" color="orange" label="">
                        <p
                            className="mb-2"
                            dangerouslySetInnerHTML={ {
                                __html: sprintf(
                                    /* translators: %s: opening and closing anchor tags for "payment methods" link */
                                    __(
                                        'No payment methods found to submit a withdrawal request. Please set up your %1$spayment methods%2$s first.',
                                        'dokan-lite'
                                    ),
                                    `<a href="${ window?.dokanFrontend?.dokanWithdraw?.paymentSettingUrl }" class="cursor-pointer text-dokan-primary">`,
                                    '</a>'
                                ),
                            } }
                        ></p>
                    </SimpleAlert>
                ) }
            </>
        );
    };

    useEffect( () => {
        if ( settings?.data?.payment_methods.length > 0 ) {
            setWithdrawMethod( settings?.data?.payment_methods[ 0 ].value );
        }
    }, [ settings ] );

    return (
        <>
            <Button
                color="gray"
                className="hover:bg-dokan-btn-hover dokan-btn-primary"
                onClick={ () => setIsOpen( true ) }
                label={ __( 'Request Withdraw', 'dokan' ) }
            />

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
                    { ! hasWithdrawRequests && withdrawRequestForm() }

                    { hasWithdrawRequests && (
                        <SimpleAlert
                            type="danger"
                            color="red"
                            label={ __(
                                'You already have pending withdraw request(s). Please submit your request after approval or cancellation of your previous request.',
                                'dokan-lite'
                            ) }
                        />
                    ) }
                </Modal.Content>
                <Modal.Footer className="border-t">
                    <div className="flex flex-row gap-3">
                        <Button
                            color="secondary"
                            className="bg-gray-50 hover:bg-gray-100"
                            onClick={ () => setIsOpen( false ) }
                            label={ __( 'Close', 'dokan' ) }
                        />

                        { ! hasWithdrawRequests && hasPaymentMethods && (
                            <Button
                                color="secondary"
                                className="bg-dokan-btn hover:bg-dokan-btn-hover text-white"
                                onClick={ handleCreateWithdraw }
                                disabled={
                                    isLoading || withdrawHook?.isLoading
                                }
                                loading={ isLoading || withdrawHook?.isLoading }
                                label={
                                    withdrawHook?.isLoading
                                        ? __( 'Creating…', 'dokan' )
                                        : __( 'Submit request', 'dokan' )
                                }
                            />
                        ) }
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default RequestWithdrawBtn;
