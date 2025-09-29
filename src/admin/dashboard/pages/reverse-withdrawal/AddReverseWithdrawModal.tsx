import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { DokanModal, DokanButton } from '@dokan/components';
import { VendorAsyncSelect, ProductAsyncSelect, OrderAsyncSelect } from '@src/components';
import { Box, ShoppingBag, CreditCard, Info } from 'lucide-react';

const AddReverseWithdrawModal = ({ open, onClose }) => {
    const [transectionType, setTransectionType] = useState<
        'manual_product' | 'manual_order' | 'other'
    >('manual_product');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [withdrawalType, setWithdrawalType] = useState<'debit' | 'credit'>('debit');
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [withdrawalNote, setWithdrawalNote] = useState('');
    const [vendorsData, setVendorsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleConfirm = async () => {
        const newErrors = {};
        if (!vendorsData?.value) {
            newErrors.vendorId = true;
        }

        if (transectionType === 'manual_product' && !selectedProduct?.value) {
            newErrors.trId = true;
        }

        if (transectionType === 'manual_order' && !selectedOrder?.value) {
            newErrors.trId = true;
        }

        if (!withdrawalAmount) {
            newErrors.withdrawalAmount = true;
        }

        if (!withdrawalNote) {
            newErrors.withdrawalNote = true;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        let trn_id = 0;
        if (transectionType === 'manual_product') {
            trn_id = selectedProduct.value;
        } else if (transectionType === 'manual_order') {
            trn_id = selectedOrder.value;
        }

        const debit = withdrawalType === 'debit' ? String(withdrawalAmount) : '0';
        const credit = withdrawalType === 'credit' ? String(withdrawalAmount) : '0';

        const payload = {
            trn_id,
            trn_type: transectionType,
            vendor_id: vendorsData.value,
            note: withdrawalNote,
            debit,
            credit,
        };

        setLoading(true);
        try {
            const response = await apiFetch({
                path: 'dokan/v1/reverse-withdrawal/transactions',
                method: 'POST',
                data: payload,
            });

            resetForm();
            onClose();
            console.log('Reverse withdrawal created successfully:', response);
        } catch (error) {
            console.error('Error saving reverse withdrawal:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTransectionType('manual_product');
        setSelectedProduct(null);
        setSelectedOrder(null);
        setWithdrawalType('debit');
        setWithdrawalAmount('');
        setWithdrawalNote('');
        setVendorsData(null);
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleVendorChange = (vendor: any) => {
        setVendorsData(vendor);
        setSelectedProduct(null);
        setSelectedOrder(null);
    };

    const handleTransactionTypeChange = (type: 'manual_product' | 'manual_order' | 'other') => {
        setTransectionType(type);
        setSelectedProduct(null);
        setSelectedOrder(null);
    };

    const handleWithdrawalTypeChange = (type: 'debit' | 'credit') => {
        setWithdrawalType(type);
    };

    const modalContent = (
        <div className="space-y-5 p-5 sm:p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-220px)] sm:max-h-[calc(90vh-200px)]">
            <div>
                <VendorAsyncSelect
                    prefetch
                    value={vendorsData}
                    onChange={handleVendorChange}
                    isClearable
                    label={__('Select Vendor', 'dokan-lite')}
                    placeholder={__('Search', 'dokan-lite')}
                />
                {errors.vendorId && (
                    <span className="text-red-500 text-sm mt-1 block">
                        {__('Please select a vendor', 'dokan-lite')}
                    </span>
                )}
            </div>

            <div>
                <h3 className="text-base font-medium mb-3">
                    {__('Transaction Type', 'dokan-lite')}
                </h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                        { label: __('Product', 'dokan-lite'), value: 'manual_product', icon: Box },
                        { label: __('Order', 'dokan-lite'), value: 'manual_order', icon: ShoppingBag },
                        { label: __('Other', 'dokan-lite'), value: 'other', icon: CreditCard },
                    ].map((item) => (
                        <DokanButton
                            key={item.value}
                            onClick={() => handleTransactionTypeChange(item.value as 'manual_product' | 'manual_order' | 'other')}
                            variant={transectionType === item.value ? 'primary' : 'secondary'}
                            className="w-full px-4 py-2.5 flex items-center justify-center"
                        >
                            {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                            {item.label}
                        </DokanButton>
                    ))}
                </div>
            </div>

            {transectionType === 'manual_product' && (
                <div>
                    <h3 className="text-base font-medium mb-3">
                        {__('Select Product', 'dokan-lite')}
                    </h3>
                    <ProductAsyncSelect
                        value={selectedProduct}
                        onChange={setSelectedProduct}
                        placeholder={__('Search', 'dokan-lite')}
                        isClearable
                        prefetch
                        extraQuery={{
                            ...(vendorsData?.value ? { id: vendorsData.value } : {}),
                            post_status: 'publish',
                        }}
                        noOptionsMessage={() =>
                            !vendorsData
                                ? __('Please select a vendor first', 'dokan-lite')
                                : __('No products found', 'dokan-lite')
                        }
                    />
                    {errors.trId && (
                        <span className="text-red-500 text-sm mt-1 block">
                            {__('Please select a product', 'dokan-lite')}
                        </span>
                    )}
                </div>
            )}

            {transectionType === 'manual_order' && (
                <div>
                    <h3 className="text-base font-medium mb-3">
                        {__('Select Order', 'dokan-lite')}
                    </h3>
                    <OrderAsyncSelect
                        value={selectedOrder}
                        onChange={setSelectedOrder}
                        placeholder={__('Search order', 'dokan-lite')}
                        isClearable
                        prefetch
                        endpoint='dokan/v1/orders'
                        isDisabled={!vendorsData}
                        extraQuery={{
                            ...(vendorsData?.value && { seller_id: vendorsData.value }),
                        }}
                        mapOption={(order) => ({
                            value: order.id,
                            label: `Order #${order.id}${order.total ? ` - $${order.total}` : ''}`,
                            raw: order,
                        })}
                        noOptionsMessage={() =>
                            !vendorsData
                                ? __('Please select a vendor first', 'dokan-lite')
                                : __('No orders found', 'dokan-lite')
                        }
                    />
                    {errors.trId && (
                        <span className="text-red-500 text-sm mt-1 block">
                            {__('Please select an order', 'dokan-lite')}
                        </span>
                    )}
                </div>
            )}

            <div>
                <h3 className="text-base font-medium mb-3">
                    {__('Withdrawal Balance Type', 'dokan-lite')}
                    <span
                        title={__(
                            'Adjust Balance by Creating a New Reverse Withdrawal Entry',
                            'dokan-lite'
                        )}
                        className="text-gray-400 cursor-pointer ml-1"
                    >
                        <Info className="w-4 h-4 inline-block" />
                    </span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { label: __('Debit', 'dokan-lite'), value: 'debit' },
                        { label: __('Credit', 'dokan-lite'), value: 'credit' },
                    ].map((item) => (
                        <DokanButton
                            key={item.value}
                            onClick={() => handleWithdrawalTypeChange(item.value as 'debit' | 'credit')}
                            variant={withdrawalType === item.value ? 'primary' : 'secondary'}
                            className="w-full px-4 py-2.5"
                        >
                            {item.label}
                        </DokanButton>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-base font-medium mb-3">
                    {__('Reverse Withdrawal Amount', 'dokan-lite')}
                    <span 
                        title={__('Enter the amount for the reverse withdrawal', 'dokan-lite')} 
                        className="text-gray-400 cursor-pointer ml-1"
                    >
                        <Info className="w-4 h-4 inline-block" />
                    </span>
                </h3>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base font-medium">
                        $
                    </span>
                    <input
                        type="number"
                        placeholder={__('Enter amount', 'dokan-lite')}
                        className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2.5 text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        min="0"
                        step="0.01"
                    />
                </div>
                {errors.withdrawalAmount && (
                    <span className="text-red-500 text-sm mt-1 block">
                        {__('Kindly provide the withdrawal amount', 'dokan-lite')}
                    </span>
                )}
            </div>

            <div>
                <h3 className="text-base font-medium mb-3">
                    {__('Notes', 'dokan-lite')}
                </h3>
                <textarea
                    placeholder={__('Write reverse withdrawal note', 'dokan-lite')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 min-h-[100px] text-base focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none resize-none"
                    value={withdrawalNote}
                    onChange={(e) => setWithdrawalNote(e.target.value)}
                />
                {errors.withdrawalNote && (
                    <span className="text-red-500 text-sm mt-1 block">
                        {__('Please write reverse withdrawal note', 'dokan-lite')}
                    </span>
                )}
            </div>
        </div>
    );

    return (
        <DokanModal
            isOpen={open}
            onClose={handleClose}
            onConfirm={handleConfirm}
            namespace="add-reverse-withdrawal"
            className={`w-full sm:w-[620px] max-w-[95%] h-[${transectionType === 'other' ? '718px' : '818px'}] max-h-[96vh] flex flex-col`}
            dialogTitle={__('Add New Reverse Withdrawal', 'dokan-lite')}
            dialogContent={modalContent}
            confirmButtonText={__('Add New', 'dokan-lite')}
            cancelButtonText={__('Cancel', 'dokan-lite')}
            confirmButtonVariant="primary"
            loading={loading}
        />
    );
};

export default AddReverseWithdrawModal;