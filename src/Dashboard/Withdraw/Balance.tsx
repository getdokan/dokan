import {
    Button,
    Card,
    Modal,
    SimpleInput,
    SimpleSelect,
    MaskedInput,
    useToast,
    SimpleAlert,
} from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import PriceHtml from '../../Components/PriceHtml';
import { UseBalanceReturn } from './Hooks/useBalance';
import { useEffect, useState } from '@wordpress/element';
import '../../Definitions/window-types';
import { useDebounceCallback } from 'usehooks-ts';
import { useCharge } from './Hooks/useCharge';
import { UseWithdrawSettingsReturn } from './Hooks/useWithdrawSettings';
import { useWithdraw } from './Hooks/useWithdraw';
import { UseWithdrawRequestsReturn } from './Hooks/useWithdrawRequests';

const Loader = () => {
    return (
        <Card>
            <Card.Header>
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
            </Card.Header>
            <Card.Body>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};
function Balance( {
    bodyData,
    settings,
    masterLoading,
    withdrawRequests,
}: {
    bodyData: UseBalanceReturn;
    settings: UseWithdrawSettingsReturn;
    masterLoading: boolean;
    withdrawRequests: UseWithdrawRequestsReturn;
} ) {
    const [ isOpen, setIsOpen ] = useState( false );
    const [ withdrawMethod, setWithdrawMethod ] = useState( '' );
    const [ withdrawAmount, setWithdrawAmount ] = useState( '' );

    const currencySymbol = window?.dokanCurrency?.symbol ?? '';
    const { fetchCharge, isLoading, data } = useCharge();
    const withdrawHook = useWithdraw();
    const toast = useToast();

    const unformatNumber = ( value ) => {
        if ( value === '' ) {
            return value;
        }
        return window.accounting.unformat(
            value,
            window.dokanCurrency.decimal
        );
    };

    const formatNumber = ( value ) => {
        if ( value === '' ) {
            return value;
        }
        return window.accounting.formatNumber(
            value,
            window.dokanCurrency.precision,
            window.dokanCurrency.thousand,
            window.dokanCurrency.decimal
        );
    };

    const formatMoney = ( money ) => {
        return window.accounting.formatMoney( money, {
            symbol: '',
            decimal: window.dokanCurrency.decimal,
            thousand: window.dokanCurrency.thousand,
            precision: window.dokanCurrency.precision,
            format: window.dokanCurrency.format,
        } );
    };

    function handleWithdrawAmount( value ) {
        if ( ! value ) {
            value = 0;
        }
        setWithdrawAmount( value );
        calculateWithdrawCharge( withdrawMethod, unformatNumber( value ) );
    }

    function calculateWithdrawCharge( method, value ) {
        fetchCharge( method, value );
    }

    const debouncedWithdrawAmount = useDebounceCallback(
        handleWithdrawAmount,
        500
    );

    const getRecivableFormated = () => {
        if ( ! withdrawAmount ) {
            return formatMoney( '' );
        }

        return formatMoney( data?.receivable ?? '' );
    };

    const getChargeFormated = () => {
        let chargeText = '';
        if ( ! withdrawAmount ) {
            return formatMoney( '' );
        }

        const fixed = data?.charge_data?.fixed
            ? Number( data?.charge_data?.fixed )
            : '';
        const percentage = data?.charge_data?.percentage
            ? Number( data?.charge_data?.percentage )
            : '';

        if ( fixed ) {
            chargeText += formatMoney( fixed );
        }

        if ( percentage ) {
            chargeText += chargeText ? ' + ' : '';
            chargeText += `${ percentage }%`;
            chargeText += ` = ${ formatMoney( data?.charge ) }`;
        }

        if ( ! chargeText ) {
            chargeText = formatMoney( data?.charge );
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

    useEffect( () => {
        if ( settings?.data?.payment_methods.length > 0 ) {
            setWithdrawMethod( settings?.data?.payment_methods[ 0 ].value );
        }
    }, [ settings ] );

    const hasWithdrawRequests =
        withdrawRequests?.data &&
        Array.isArray( withdrawRequests?.data ) &&
        withdrawRequests?.data?.length > 0;

    if (
        ! bodyData ||
        ! bodyData.hasOwnProperty( 'isLoading' ) ||
        bodyData.isLoading ||
        masterLoading
    ) {
        return <Loader />;
    }
    return (
        <>
            <Card className="dokan-withdraw-style-reset dokan-layout">
                <Card.Header>
                    <Card.Title className="p-0 m-0">
                        { __( 'Balance', 'dokan' ) }
                    </Card.Title>
                </Card.Header>
                <Card.Body>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="flex flex-col">
                            <div className="text-gray-700 mb-4 sm:mb-0 flex">
                                <span>{ __( 'Your Balance:', 'dokan' ) }</span>
                                &nbsp;
                                <span className="font-semibold">
                                    <PriceHtml
                                        price={
                                            bodyData?.data?.current_balance ??
                                            ''
                                        }
                                    />
                                </span>
                            </div>
                            <div className="text-gray-700 mb-4 sm:mb-0 flex">
                                <span>
                                    { __(
                                        'Minimum Withdraw Amount: ',
                                        'dokan'
                                    ) }
                                </span>
                                &nbsp;
                                <span className="font-semibold">
                                    <PriceHtml
                                        price={
                                            bodyData?.data?.withdraw_limit ?? ''
                                        }
                                    />
                                </span>
                            </div>
                        </div>
                        <Button
                            color="gray"
                            className="bg-dokan-btn hover:bg-dokan-btn-hover"
                            onClick={ () => setIsOpen( true ) }
                        >
                            { __( 'Request Withdraw', 'dokan' ) }
                        </Button>
                    </div>
                </Card.Body>
            </Card>

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
                    { ! hasWithdrawRequests && (
                        <>
                            <div className="">
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
                                        debouncedWithdrawAmount(
                                            e.target.value
                                        );
                                    } }
                                    maskRule={ {
                                        numeral: true,
                                        numeralDecimalMark:
                                            window?.dokanCurrency?.decimal ??
                                            '.',
                                        delimiter:
                                            window?.dokanCurrency?.thousand ??
                                            ',',
                                        numeralDecimalScale:
                                            window?.dokanCurrency?.precision ??
                                            2,
                                    } }
                                    input={ {
                                        id: 'withdraw-amount',
                                        name: 'withdraw-amount',
                                        type: 'text',
                                        placeholder: __(
                                            'Enter amount',
                                            'dokan'
                                        ),
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
                    ) }

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
                        >
                            { __( 'Close', 'dokan' ) }
                        </Button>

                        { ! hasWithdrawRequests && (
                            <Button
                                color="secondary"
                                className="bg-dokan-btn hover:bg-dokan-btn-hover text-white"
                                onClick={ handleCreateWithdraw }
                                disabled={
                                    isLoading || withdrawHook?.isLoading
                                }
                            >
                                { withdrawHook?.isLoading
                                    ? __( 'Creating…', 'dokan' )
                                    : __( 'Submit request', 'dokan' ) }
                            </Button>
                        ) }
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Balance;
