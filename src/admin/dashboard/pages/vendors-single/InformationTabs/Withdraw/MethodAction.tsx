import { __ } from '@wordpress/i18n';
import { DokanButton } from '@dokan/components';
import { Minus, Plus, Settings } from "lucide-react";
import { useState } from '@wordpress/element';
import Bank from './Forms/Bank';
import PayPal from './Forms/PayPal';
import Skrill from './Forms/Skrill';
import Custom from './Forms/Custom';
import { Vendor } from '@dokan/definitions/dokan-vendors';
import store from '@dokan/stores/vendors';
import { useDispatch } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

function MethodAction( {
    connected,
    settings,
    method,
    vendor,
}: {
    connected: boolean;
    settings: Record< any, any >;
    method: string;
    vendor: Vendor;
} ) {
    const [ isOpen, setIsOpen ] = useState( false );
    const { setVendor } = useDispatch( store );
    const [ loading, setLoading ] = useState( false );
    if (
        settings?.chargeable_methods &&
        ! Object.prototype.hasOwnProperty.call(
            settings.chargeable_methods,
            method
        )
    ) {
        return (
            <div className="flex justify-center items-center ml-3">
                <div className="flex justify-center items-center ml-3 px-2 py-1 !w-[80px] !h-[26px] !border-none hover:!bg-transparent !outline-none focus:!outline-none">
                    <Minus size={ 15 } />
                </div>
            </div>
        );
    }

    const getPaymentData = ( currentMethod: string ) => {
        const data = vendor?.payment[ currentMethod ];

        if ( ! data ) {
            return null;
        }

        return data;
    };

    const savePaymentData = async ( data, currentMethod ) => {
        const updatedVendor = {
            ...vendor,
            payment: {
                ...vendor?.payment,
                [ currentMethod ]: data,
            },
        };

        const vendorCopy = JSON.parse( JSON.stringify( vendor ) );

        setLoading( true );

        try {
            const savedVendor: Vendor = await apiFetch( {
                path: addQueryArgs( 'dokan/v1/settings', {
                    vendor_id: vendor?.id,
                } ),
                method: 'PUT',
                data: updatedVendor,
            } );

            await setVendor( savedVendor );

            setLoading( false );
            setIsOpen( false );
        } catch {
            await setVendor( vendorCopy );

            setLoading( false );
        }
    };

    const paymentForm = () => {
        switch ( method ) {
            case 'bank':
                return (
                    <Bank
                        isOpen={ isOpen }
                        setIsOpen={ setIsOpen }
                        settings={ settings }
                        connected={ connected }
                        data={ getPaymentData( method ) }
                        saveData={ ( values ) =>
                            savePaymentData( values, method )
                        }
                        loading={ loading }
                    />
                );

            case 'paypal':
                return (
                    <PayPal
                        isOpen={ isOpen }
                        setIsOpen={ setIsOpen }
                        connected={ connected }
                        data={ getPaymentData( method ) }
                        loading={ loading }
                        saveData={ ( values ) =>
                            savePaymentData( values, method )
                        }
                    />
                );

            case 'skrill':
                return (
                    <Skrill
                        isOpen={ isOpen }
                        setIsOpen={ setIsOpen }
                        connected={ connected }
                        data={ getPaymentData( method ) }
                        loading={ loading }
                        saveData={ ( values ) =>
                            savePaymentData( values, method )
                        }
                    />
                );

            case 'dokan_custom':
                return (
                    <Custom
                        isOpen={ isOpen }
                        setIsOpen={ setIsOpen }
                        connected={ connected }
                        name={
                            vendor?.payment?.dokan_custom
                                ?.withdraw_method_name ??
                            __( 'Custom', 'dokan-lite' )
                        }
                        type={
                            vendor?.payment?.dokan_custom
                                ?.withdraw_method_type ??
                            __( 'Custom', 'dokan-lite' )
                        }
                        data={ getPaymentData( method ) }
                        loading={ loading }
                        saveData={ ( values ) =>
                            savePaymentData( values, method )
                        }
                    />
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className="flex justify-center items-center">
                { connected ? (
                    <DokanButton
                        variant="secondary"
                        label={ __( 'Manage', 'dokan-lite' ) }
                        icon={ () => <Settings size={ 15 } /> }
                        size="sm"
                        className="px-2 py-1 w-[80px] h-[26px]"
                        onClick={ () => setIsOpen( true ) }
                    />
                ) : (
                    <DokanButton
                        variant="secondary"
                        label={ __( 'Add', 'dokan-lite' ) }
                        icon={ () => <Plus size={ 15 } /> }
                        size="sm"
                        className="px-2 py-1 w-[80px] h-[26px]"
                        onClick={ () => setIsOpen( true ) }
                    />
                ) }

                { paymentForm() }
            </div>
        </>
    );
}

export default MethodAction;
