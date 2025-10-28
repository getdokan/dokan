import { useEffect, useState } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { dispatch } from '@wordpress/data';
import { VendorAsyncSelect, DokanModal } from '@dokan/components';
import { Home, Plus, Package } from 'lucide-react';

type SelectOption = { label: string; value: string };

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAdded?: () => void;
}

const AddAdvertisementModal = ( { isOpen, onClose, onAdded }: Props ) => {
    const [ selectedVendor, setSelectedVendor ] = useState< SelectOption | null >( null );
    const [ selectedProduct, setSelectedProduct ] = useState< SelectOption | null >( null );
    const [ vendors, setVendors ] = useState< SelectOption[] >( [] );
    const [ products, setProducts ] = useState< SelectOption[] >( [] );
    const [ isLoadingVendors, setIsLoadingVendors ] = useState( false );
    const [ isLoadingProducts, setIsLoadingProducts ] = useState( false );
    const [ reverseWithdrawalEntry, setReverseWithdrawalEntry ] = useState( false );
    const [ loading, setLoading ] = useState( false );

    useEffect( () => {
        // prefetch some vendors when modal opens
        if ( isOpen ) {
            fetchStores();
        }
        // reset when modal is closed
        if ( ! isOpen ) {
            setSelectedVendor( null );
            setSelectedProduct( null );
            setProducts( [] );
            setVendors( [] );
            setReverseWithdrawalEntry( false );
            setLoading( false );
        }
    }, [ isOpen ] );

    const fetchStores = async ( search = '' ) => {
        setIsLoadingVendors( true );
        try {
            const resp = ( await apiFetch( {
                path: addQueryArgs( '/dokan/v1/stores', {
                    per_page: 20,
                    paged: 1,
                    search,
                } ),
            } ) ) as any[];
            const mapped = resp.map( ( s: any ) => ( { 
                label: s.store_name, 
                value: s.id.toString() 
            } ) );
            setVendors( mapped );
        } catch ( e ) {
            console.error( 'fetchStores error', e );
            setVendors( [] );
        } finally {
            setIsLoadingVendors( false );
        }
    };

    const fetchProducts = async ( vendorId?: string | number, search = '' ) => {
        if ( ! vendorId ) {
            setProducts( [] );
            return;
        }
        setIsLoadingProducts( true );
        try {
            const vid = typeof vendorId === 'string' ? parseInt( vendorId, 10 ) : vendorId;
            // Use the same endpoint structure as Vue component
            const resp = ( await apiFetch( {
                path: addQueryArgs( '/dokan/v1/products', {
                    per_page: 20,
                    paged: 1,
                    id: vid,
                    search,
                    post_status: 'publish',
                } ),
            } ) ) as any[];
            
            // Map products with proper field names matching Vue component
            const mapped = resp.map( ( p: any ) => ( { 
                label: p.name || p.title || p.product_title || p.post_title || '', 
                value: ( p.id || p.ID || p.post_id || '' ).toString() 
            } ) );
            setProducts( mapped );
        } catch ( e ) {
            console.error( 'fetchProducts error', e );
            setProducts( [] );
        } finally {
            setIsLoadingProducts( false );
        }
    };

    const handleAdd = async () => {
        if ( ! selectedVendor || ! selectedProduct ) {
            ( dispatch( 'core/notices' ) as any ).createErrorNotice( 
                __( 'Please select both store and product', 'dokan' ) 
            );
            return;
        }

        setLoading( true );
        try {
            const response = await apiFetch( {
                path: '/dokan/v1/product_adv/create',
                method: 'POST',
                data: {
                    product_id: parseInt( selectedProduct.value, 10 ),
                    vendor_id: parseInt( selectedVendor.value, 10 ),
                    reverse_withdrawal_entry: reverseWithdrawalEntry,
                },
            } );

            // Show success message
            ( dispatch( 'core/notices' ) as any ).createSuccessNotice( 
                __( 'Advertisement added successfully', 'dokan' ) 
            );
            
            // Reset product selection only (keep vendor selected like Vue does)
            setSelectedProduct( null );
            
            // Trigger callback
            if ( onAdded ) onAdded();
            
            // Close modal
            onClose();
            
            return response;
        } catch ( error: any ) {
            console.error( 'AddAdvertisement error', error );
            
            // Extract error message
            let message = '';
            if ( error && error.message ) {
                message = error.message;
            } else if ( error && error.data && error.data.message ) {
                message = error.data.message;
            } else if ( error && typeof error === 'object' && error.responseJSON ) {
                // Handle jQuery-style error format
                if ( error.responseJSON.message ) {
                    message = error.responseJSON.message;
                } else if ( error.responseJSON.data && error.responseJSON.data.message ) {
                    message = error.responseJSON.data.message;
                }
            } else {
                message = __( 'Unable to add advertisement. Please try again.', 'dokan' );
            }

            ( dispatch( 'core/notices' ) as any ).createErrorNotice( message );
        } finally {
            setLoading( false );
        }
    };

    const handleVendorChange = ( vendor: SelectOption | null ) => {
        setSelectedVendor( vendor );
        setSelectedProduct( null ); // Reset product when vendor changes
        setProducts( [] ); // Clear products list
        if ( vendor ) {
            fetchProducts( vendor.value );
        }
    };

    const handleProductInputChange = ( input: string ) => {
        if ( input && selectedVendor ) {
            fetchProducts( selectedVendor.value, input );
        }
    };

    return (
        <DokanModal
            isOpen={ isOpen }
            namespace="add-new-advertisement"
            onClose={ onClose }
            onConfirm={ handleAdd }
            dialogTitle={ __( 'Add New Advertisement', 'dokan' ) }
            confirmButtonText={ __( 'Add New', 'dokan' ) }
            confirmButtonVariant="primary"
            isConfirmDisabled={ ! selectedVendor || ! selectedProduct || loading }
            dialogIcon={ (
                <div className="flex items-center justify-center flex-shrink-0 w-14 h-14 bg-blue-50 border border-blue-50 rounded-full">
                    <Plus size={ 24 } className="text-blue-600" />
                </div>
            ) }
        >
            <div className="space-y-6 p-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        { __( 'Select Store', 'dokan' ) }
                    </label>
                    <VendorAsyncSelect
                        key="add-vendor-select"
                        icon={ <Home size={ 16 } /> }
                        value={ selectedVendor }
                        onChange={ handleVendorChange }
                        onInputChange={ ( input: string ) => {
                            if ( input ) fetchStores( input );
                        } }
                        options={ vendors }
                        placeholder={ __( 'Filter by store', 'dokan' ) }
                        isClearable
                        isLoading={ isLoadingVendors }
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        { __( 'Select Product', 'dokan' ) }
                    </label>
                    <VendorAsyncSelect
                        key={ `add-product-select-${ selectedVendor?.value || 'none' }` }
                        icon={ <Package size={ 16 } /> }
                        value={ selectedProduct }
                        onChange={ ( product: SelectOption | null ) => setSelectedProduct( product ) }
                        onInputChange={ handleProductInputChange }
                        options={ products }
                        placeholder={ __( 'Filter by product', 'dokan' ) }
                        isClearable
                        isDisabled={ ! selectedVendor }
                        isLoading={ isLoadingProducts }
                    />
                </div>

                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700">
                        <input 
                            type="checkbox" 
                            checked={ reverseWithdrawalEntry } 
                            onChange={ ( e ) => setReverseWithdrawalEntry( e.target.checked ) } 
                            className="mr-2 rounded" 
                        />
                        { __( 'Add Reverse Withdrawal Entry?', 'dokan' ) }
                    </label>
                </div>
            </div>
        </DokanModal>
    );
};

export default AddAdvertisementModal;