// Reusable section component
import DokanToggleSwitch from './Fields/DokanToggleSwitch';
import RadioButton from './Fields/RadioButton';
import { useState } from '@wordpress/element';
import CurrencyInput from './Fields/CurrencyInput';
import DokanCheckboxGroup from './Fields/DokanCheckboxGroup';
import RecipientSelector from './Fields/RecipientSelector';

// Main shipping settings component that uses all the reusable components
const CommonFormFields = () => {
    const [ shippingRecipient, setShippingRecipient ] = useState( 'admin' );
    const [ productTaxRecipient, setProductTaxRecipient ] = useState( 'admin' );
    const [ shippingTaxRecipient, setShippingTaxRecipient ] =
        useState( 'admin' );
    const [ vendorChangeOrderStatus, setVendorChangeOrderStatus ] =
        useState( true );
    const [ newVendorSelling, setNewVendorSelling ] = useState( false );

    // Function to handle recipient selection
    const handleRecipientChange = ( type, value ) => {
        switch ( type ) {
            case 'shipping':
                setShippingRecipient( value );
                break;
            case 'productTax':
                setProductTaxRecipient( value );
                break;
            case 'shippingTax':
                setShippingTaxRecipient( value );
                break;
            default:
                break;
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Common Form Fields</h1>

            { /* Shipping Fee Recipient */ }
            <RecipientSelector
                type="shipping"
                selectedValue={ shippingRecipient }
                onChange={ handleRecipientChange }
                title="Shipping Fee Recipient"
                description="Choose who receives shipping charges - Admin keeps all shipping fees or Vendors receive fees for their products"
            />

            { /* Vendors can change Order Status */ }

            <DokanToggleSwitch
                title={ 'Vendors can change Order Status' }
                description={ 'Allow vendors to change order status' }
                enabled={ vendorChangeOrderStatus }
                onChange={ () =>
                    setVendorChangeOrderStatus( ! vendorChangeOrderStatus )
                }
            />

            <RadioButton
                title={ 'Vendors can change Order Status' }
                description={ 'Allow vendors to change order status' }
                selectedValue={ vendorChangeOrderStatus ? 'show' : 'hide' }
                onChange={ ( value ) => {
                    setVendorChangeOrderStatus( value === 'show' );
                } }
            />
            <CurrencyInput onChange={ () => {} } value={ 0 } />
            <DokanCheckboxGroup
                onChange={ () => {} }
                defaultValue={ [] }
                name={ 'test' }
                options={ [
                    {
                        label: 'Standard Rate',
                        value: 'standard',
                    },
                    {
                        label: 'Reduced Rate',
                        value: 'reduced',
                    },
                    {
                        label: 'Zero Rate',
                        value: 'zero',
                    },
                ] }
            />
            { /* Product Tax Recipient */ }
        </div>
    );
};

export default CommonFormFields;
