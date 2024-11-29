import {
    Button,
    Card,
    Modal,
    SimpleInput,
    SimpleSelect,
} from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import PriceHtml from '../../Components/PriceHtml';
import { UseBalanceReturn } from './Hooks/useBalance';
import { useState } from '@wordpress/element';
import '../../Definitions/window-types';

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
function Balance( { bodyData }: { bodyData: UseBalanceReturn } ) {
    const [ isOpen, setIsOpen ] = useState( false );
    const currencySymbol = window?.accounting?.settings?.currency?.symbol ?? '';

    if (
        ! bodyData ||
        ! bodyData.hasOwnProperty( 'isLoading' ) ||
        bodyData.isLoading
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
                    <div className="">
                        <SimpleSelect
                            label={ __( 'Withdraw amount', 'dokan' ) }
                            value={ {} }
                            onChange={ ( e ) => {
                                console.log( e );
                            } }
                            options={ [
                                {
                                    value: 'paypal',
                                    label: 'Paypal',
                                },
                                {
                                    value: 'stripe',
                                    label: 'Stripe',
                                },
                            ] }
                        />
                    </div>
                    <div className="mt-3">
                        <SimpleInput
                            label={ __( 'Withdraw amount', 'dokan' ) }
                            className="pl-12"
                            addOnLeft={ currencySymbol }
                            value={ '' }
                            onChange={ ( e ) => {
                                console.log( e );
                            } }
                            input={ {
                                id: 'withdraw-amount',
                                name: 'withdraw-amount',
                                type: 'text',
                                placeholder: __( 'Enter amount', 'dokan' ),
                                disabled: false,
                            } }
                        />
                    </div>
                    <div className="mt-3">
                        <SimpleInput
                            label={ __( 'Withdraw charge', 'dokan' ) }
                            className="pl-12"
                            addOnLeft={ currencySymbol }
                            value={ '200' }
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
                            value={ '100' }
                            input={ {
                                id: 'receivable-amount',
                                name: 'receivable-amount',
                                type: 'text',
                                placeholder: '',
                                disabled: true,
                            } }
                        />
                    </div>
                </Modal.Content>
                <Modal.Footer className="border-t">
                    { /*<Button*/ }
                    { /*    color="primary"*/ }
                    { /*    disabled={ isSaving }*/ }
                    { /*    loading={ isSaving }*/ }
                    { /*    onClick={ handleSave }*/ }
                    { /*>*/ }
                    { /*    { isSaving*/ }
                    { /*        ? __( 'Saving…', 'dokan' )*/ }
                    { /*        : __( 'Save', 'dokan' ) }*/ }
                    { /*</Button>*/ }
                    <div className="flex flex-row gap-3">
                        <Button
                            color="secondary"
                            className="bg-gray-50 hover:bg-gray-100"
                            onClick={ () => setIsOpen( false ) }
                        >
                            { __( 'Close', 'dokan' ) }
                        </Button>
                        <Button
                            color="secondary"
                            className="bg-dokan-btn hover:bg-dokan-btn-hover dokan-"
                            onClick={ () => setIsOpen( false ) }
                        >
                            { __( 'Submit request', 'dokan' ) }
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default Balance;
