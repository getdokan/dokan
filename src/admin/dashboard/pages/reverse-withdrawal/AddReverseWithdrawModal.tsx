import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
    DokanModal,
    DokanButton,
    DokanPriceInput,
    VendorAsyncSelect,
    ProductAsyncSelect,
    OrderAsyncSelect,
} from '@src/components';
import { Box, ShoppingBag, CreditCard, Info } from 'lucide-react';
import { useState } from '@wordpress/element';
import { twMerge } from 'tailwind-merge';
// import { formatNumber, formatPrice } from '@dokan/utilities';
import { useDebounceCallback } from 'usehooks-ts';

const AddReverseWithdrawModal = ( {
    open,
    onClose,
    onCreated,
}: {
    open: boolean;
    onClose: () => void;
    onCreated?: ( args?: any ) => void;
} ) => {
    const [ transectionType, setTransectionType ] = useState<
        'manual_product' | 'manual_order' | 'other'
    >( 'manual_product' );
    const [ selectedProduct, setSelectedProduct ] = useState( null );
    const [ selectedOrder, setSelectedOrder ] = useState( null );
    const [ withdrawalType, setWithdrawalType ] = useState<
        'debit' | 'credit'
    >( 'debit' );
    const [ withdrawalAmount, setWithdrawalAmount ] = useState( '' );
    const [ withdrawalAmountRaw, setWithdrawalAmountRaw ] = useState( '' );
    const [ withdrawalNote, setWithdrawalNote ] = useState( '' );
    const [ vendorsData, setVendorsData ] = useState( null );
    const [ loading, setLoading ] = useState( false );
    const [ errors, setErrors ] = useState( {} );

    // Compute if there are any validation errors
    const hasValidationErrors =
        ! vendorsData?.value ||
        ( transectionType === 'manual_product' && ! selectedProduct?.value ) ||
        ( transectionType === 'manual_order' && ! selectedOrder?.value ) ||
        ! withdrawalAmountRaw ||
        ! withdrawalNote;

    const handleConfirm = async () => {
        const newErrors = {};
        if ( ! vendorsData?.value ) {
            newErrors.vendorId = true;
        }

        if (
            transectionType === 'manual_product' &&
            ! selectedProduct?.value
        ) {
            newErrors.trId = true;
        }

        if ( transectionType === 'manual_order' && ! selectedOrder?.value ) {
            newErrors.trId = true;
        }

        if ( ! withdrawalAmountRaw ) {
            newErrors.withdrawalAmount = true;
        }

        if ( ! withdrawalNote ) {
            newErrors.withdrawalNote = true;
        }

        if ( Object.keys( newErrors ).length > 0 ) {
            setErrors( newErrors );
            return;
        }

        setErrors( {} );

        // Determine related transaction id (product/order) in camelCase for lint compliance
        let trnId = 0;
        if ( transectionType === 'manual_product' ) {
            trnId = selectedProduct.value;
        } else if ( transectionType === 'manual_order' ) {
            trnId = selectedOrder.value;
        }

        const debit =
            withdrawalType === 'debit' ? String( withdrawalAmountRaw ) : '0';
        const credit =
            withdrawalType === 'credit' ? String( withdrawalAmountRaw ) : '0';

        const payload = {
            // use snake_case keys to match API contract
            trn_id: trnId,
            trn_type: transectionType,
            vendor_id: vendorsData.value,
            note: withdrawalNote,
            debit,
            credit,
        };

        setLoading( true );
        try {
            await apiFetch( {
                path: 'dokan/v1/reverse-withdrawal/transactions',
                method: 'POST',
                data: payload,
            } );

            onCreated( { payload } );
            resetForm();
            onClose();
        } catch ( error ) {
            // Show console error for debugging purposes.
            console.log(
                'Something went wrong while creating reverse withdrawal.'
            );
            throw error;
        } finally {
            setLoading( false );
        }
    };

    const resetForm = () => {
        setTransectionType( 'manual_product' );
        setSelectedProduct( null );
        setSelectedOrder( null );
        setWithdrawalType( 'debit' );
        setWithdrawalAmount( '' );
        setWithdrawalAmountRaw( '' );
        setWithdrawalNote( '' );
        setVendorsData( null );
        setErrors( {} );
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleVendorChange = ( vendor: any ) => {
        setVendorsData( vendor );
        setSelectedProduct( null );
        setSelectedOrder( null );
    };

    const handleTransactionTypeChange = (
        type: 'manual_product' | 'manual_order' | 'other'
    ) => {
        setTransectionType( type );
        setSelectedProduct( null );
        setSelectedOrder( null );
    };

    const handleWithdrawalTypeChange = ( type: 'debit' | 'credit' ) => {
        setWithdrawalType( type );
    };

    const handleWithdrawAmount = ( value, unformattedValue ) => {
        setWithdrawalAmount( value );
        setWithdrawalAmountRaw( unformattedValue );
    };

    const debouncedWithdrawAmount = useDebounceCallback(
        handleWithdrawAmount,
        500
    );

    const modalContent = (
        <div className="space-y-7 px-4 py-2 sm:p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-220px)] sm:max-h-[calc(90vh-200px)]">
            <div className="space-y-2.5">
                { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                <label className="text-[#25252D] font-medium text-sm mb-2">
                    { __( 'Select Vendor', 'dokan-lite' ) }
                </label>
                <VendorAsyncSelect
                    prefetch
                    isClearable
                    value={ vendorsData }
                    onChange={ handleVendorChange }
                    placeholder={ __( 'Search', 'dokan-lite' ) }
                    className={ 'mt-2.5! shadow-none' }
                />
                { errors.vendorId && (
                    <span className="text-red-500 text-sm mt-1 block">
                        { __( 'Please select a vendor', 'dokan-lite' ) }
                    </span>
                ) }
            </div>

            <div className="space-y-2.5">
                { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                <label className="text-[#25252D] font-medium text-sm">
                    { __( 'Transaction Type', 'dokan-lite' ) }
                </label>
                <div className="flex rounded! overflow-hidden w-fit mt-2.5">
                    { [
                        {
                            label: __( 'Product', 'dokan-lite' ),
                            value: 'manual_product',
                            icon: Box,
                        },
                        {
                            label: __( 'Order', 'dokan-lite' ),
                            value: 'manual_order',
                            icon: ShoppingBag,
                        },
                        {
                            label: __( 'Other', 'dokan-lite' ),
                            value: 'other',
                            icon: CreditCard,
                        },
                    ].map( ( item ) => (
                        <DokanButton
                            key={ item.value }
                            onClick={ () =>
                                handleTransactionTypeChange(
                                    item.value as
                                        | 'manual_product'
                                        | 'manual_order'
                                        | 'other'
                                )
                            }
                            variant={
                                transectionType === item.value
                                    ? 'primary'
                                    : 'secondary'
                            }
                            className="w-fit min-w-32 px-5 py-2.5 flex items-center justify-center rounded-none! focus:outline-none! focus:ring-0! focus:ring-offset-0! focus:ring-transparent! gap-2.5"
                        >
                            { item.icon && (
                                <item.icon
                                    strokeWidth={ 3 }
                                    className={ twMerge(
                                        'w-4 h-4 text-[#828282]',
                                        transectionType === item.value &&
                                            'text-white'
                                    ) }
                                />
                            ) }
                            <span
                                className={ twMerge(
                                    'text-sm font-semibold text-black',
                                    transectionType === item.value &&
                                        'text-white'
                                ) }
                            >
                                { item.label }
                            </span>
                        </DokanButton>
                    ) ) }
                </div>
            </div>

            { transectionType === 'manual_product' && (
                <div className="space-y-2.5">
                    { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                    <label className="text-[#25252D] font-medium text-sm">
                        { __( 'Select Product', 'dokan-lite' ) }
                    </label>
                    <ProductAsyncSelect
                        value={ selectedProduct }
                        onChange={ setSelectedProduct }
                        placeholder={ __( 'Search', 'dokan-lite' ) }
                        isClearable
                        prefetch
                        extraQuery={ {
                            ...( vendorsData?.value && {
                                author: vendorsData.value,
                            } ),
                            post_status: 'publish',
                        } }
                        disabled={ ! vendorsData }
                        className={ '!rounded-lg !mt-2.5 shadow-none' }
                        noOptionsMessage={ () =>
                            ! vendorsData
                                ? __(
                                      'Please select a vendor first',
                                      'dokan-lite'
                                  )
                                : __( 'No products found', 'dokan-lite' )
                        }
                    />
                    { errors.trId && (
                        <span className="text-red-500 text-sm mt-1 block">
                            { __( 'Please select a product', 'dokan-lite' ) }
                        </span>
                    ) }
                </div>
            ) }

            { transectionType === 'manual_order' && (
                <div className="space-y-2.5">
                    { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                    <label className="text-[#25252D] font-medium text-sm">
                        { __( 'Select Order', 'dokan-lite' ) }
                    </label>
                    <OrderAsyncSelect
                        value={ selectedOrder }
                        onChange={ setSelectedOrder }
                        placeholder={ __( 'Search order', 'dokan-lite' ) }
                        isClearable
                        prefetch
                        endpoint="dokan/v1/orders"
                        disabled={ ! vendorsData }
                        className={ '!rounded-lg !mt-2.5 shadow-none' }
                        extraQuery={ {
                            ...( vendorsData?.value && {
                                seller_id: vendorsData.value,
                            } ),
                        } }
                        mapOption={ ( order ) => ( {
                            value: order.id,
                            label: `Order #${ order.id }${
                                order.total ? ` - $${ order.total }` : ''
                            }`,
                            raw: order,
                        } ) }
                        noOptionsMessage={ () =>
                            ! vendorsData
                                ? __(
                                      'Please select a vendor first',
                                      'dokan-lite'
                                  )
                                : __( 'No orders found', 'dokan-lite' )
                        }
                    />
                    { errors.trId && (
                        <span className="text-red-500 text-sm mt-1 block">
                            { __( 'Please select an order', 'dokan-lite' ) }
                        </span>
                    ) }
                </div>
            ) }

            <div className="space-y-2.5">
                { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                <label className="text-[#25252D] font-medium text-sm flex items-center gap-2.5">
                    { __( 'Withdrawal Balance Type', 'dokan-lite' ) }
                    <div className="relative group">
                        <Info
                            size={ 16 }
                            className="text-gray-400 cursor-help"
                        />
                        <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                            { __(
                                'Adjust Balance by Creating a New Reverse Withdrawal Entry',
                                'dokan-lite'
                            ) }
                        </div>
                    </div>
                </label>
                <div className="flex flex-col sm:flex-row! rounded-md overflow-hidden w-fit">
                    { [
                        { label: __( 'Debit', 'dokan-lite' ), value: 'debit' },
                        {
                            label: __( 'Credit', 'dokan-lite' ),
                            value: 'credit',
                        },
                    ].map( ( item ) => (
                        <DokanButton
                            key={ item.value }
                            onClick={ () =>
                                handleWithdrawalTypeChange(
                                    item.value as 'debit' | 'credit'
                                )
                            }
                            variant={
                                withdrawalType === item.value
                                    ? 'primary'
                                    : 'secondary'
                            }
                            className="w-fit min-w-32 px-5 py-2.5 flex items-center justify-center !rounded-none focus:!outline-none focus:!ring-0 focus:!ring-offset-0 focus:!ring-transparent gap-2.5"
                        >
                            <span
                                className={ twMerge(
                                    'text-sm font-semibold text-black',
                                    withdrawalType === item.value &&
                                        'text-white'
                                ) }
                            >
                                { item.label }
                            </span>
                        </DokanButton>
                    ) ) }
                </div>
            </div>

            <div className="space-y-2.5">
                { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                <label className="text-[#25252D] font-medium text-sm flex items-center gap-2.5">
                    { __( 'Reverse Withdrawal Amount', 'dokan-lite' ) }
                    <div className="relative group">
                        <Info
                            size={ 16 }
                            className="text-gray-400 cursor-help"
                        />
                        <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                            { __(
                                'Enter the amount for the reverse withdrawal',
                                'dokan-lite'
                            ) }
                        </div>
                    </div>
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base font-medium">
                        $
                    </span>
                    <DokanPriceInput
                        label={ '' }
                        namespace="reverse-withdrawal-amount"
                        value={ withdrawalAmount }
                        onChange={ ( value, unformattedValue ) =>
                            debouncedWithdrawAmount( value, unformattedValue )
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:!outline-none"
                        input={ {
                            id: 'withdraw-amount',
                            name: 'withdraw-amount',
                            placeholder: __( 'Enter amount', 'dokan-lite' ),
                        } }
                    />
                </div>
                { errors.withdrawalAmount && (
                    <span className="text-red-500 text-sm mt-1 block">
                        { __(
                            'Kindly provide the withdrawal amount',
                            'dokan-lite'
                        ) }
                    </span>
                ) }
            </div>

            <div className="space-y-2.5">
                { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                <label className="text-[#25252D] font-medium text-sm">
                    { __( 'Notes', 'dokan-lite' ) }
                </label>
                <textarea
                    placeholder={ __(
                        'Write reverse withdrawal note',
                        'dokan-lite'
                    ) }
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 min-h-[100px] text-sm focus:!outline-none resize-none mt-2.5"
                    value={ withdrawalNote }
                    onChange={ ( e ) => setWithdrawalNote( e.target.value ) }
                />
                { errors.withdrawalNote && (
                    <span className="text-red-500 text-sm mt-1 block">
                        { __(
                            'Please write reverse withdrawal note',
                            'dokan-lite'
                        ) }
                    </span>
                ) }
            </div>
        </div>
    );

    return (
        <DokanModal
            isOpen={ open }
            onClose={ handleClose }
            onConfirm={ handleConfirm }
            namespace="add-reverse-withdrawal"
            className={ `!w-[350px] sm:!w-[620px] flex flex-col` }
            dialogTitle={ __( 'Add New Reverse Withdrawal', 'dokan-lite' ) }
            dialogContent={ modalContent }
            confirmButtonText={ __( 'Add New', 'dokan-lite' ) }
            cancelButtonText={ __( 'Cancel', 'dokan-lite' ) }
            confirmButtonVariant="primary"
            loading={ loading }
            confirmButtonDisabled={ hasValidationErrors }
        />
    );
};

export default AddReverseWithdrawModal; // Exporting the AddReverseWithdrawModal component
