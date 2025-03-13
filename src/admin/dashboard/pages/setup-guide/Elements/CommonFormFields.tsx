// Reusable section component
import SelectorCard from './Fields/SelectorCard';
import DokanToggleSwitch from './Fields/DokanToggleSwitch';
import RadioButton from './Fields/RadioButton';
import { useState } from '@wordpress/element';
import CurrencyInput from './Fields/CurrencyInput';
import DokanCheckboxGroup from './Fields/DokanCheckboxGroup';

const SettingSection = ( { title, description, children } ) => {
    return (
        <div className="mb-8">
            { /*<h2 className="text-lg font-medium mb-2">{title}</h2>*/ }
            { /*<p className="text-gray-600 mb-4">{description}</p>*/ }
            { children }
        </div>
    );
};

// Reusable recipient selector component
const RecipientSelector = ( {
    type,
    selectedValue,
    onChange,
    title,
    description,
} ) => {
    const adminIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
            />
        </svg>
    );

    const vendorIcon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
    );

    return (
        <SettingSection title={ title } description={ description }>
            <div className="flex gap-4">
                <SelectorCard
                    type={ type }
                    value="admin"
                    selected={ selectedValue === 'admin' }
                    onChange={ onChange }
                    icon={ adminIcon }
                />
                <SelectorCard
                    type={ type }
                    value="vendor"
                    selected={ selectedValue === 'vendor' }
                    onChange={ onChange }
                    icon={ vendorIcon }
                />
            </div>
        </SettingSection>
    );
};

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
            <SettingSection
                title="Vendors can change Order Status"
                description="Allow vendors to update order statuses (processing, completed, etc.) for their products"
            >
                <DokanToggleSwitch
                    enabled={ vendorChangeOrderStatus }
                    onChange={ () =>
                        setVendorChangeOrderStatus( ! vendorChangeOrderStatus )
                    }
                />
            </SettingSection>

            <RadioButton />
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
