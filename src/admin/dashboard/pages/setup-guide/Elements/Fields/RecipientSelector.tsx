import { useEffect, useState } from 'react';
import SelectorCard from './SelectorCard';
import AdminIcon from '../../components/icons/AdminIcon';
import VendorIcon from '../../components/icons/VendorIcon';

/**
 * RecipientSelector Component
 *
 * A visual selector component that displays icon-based selection cards
 *
 * @param {Object}   props               - Component props
 * @param {string}   props.selectedValue - Currently selected value
 * @param {Function} props.onChange      - Change handler function
 * @param {string}   props.title         - Title of the selector
 * @param {string}   props.description   - Description text
 * @param {Array}    props.options       - Optional options array from backend
 * @param {string}   props.name          - Field name
 * @param {string}   props.default       - Default value
 * @return {JSX.Element} RecipientSelector component
 */
const RecipientSelector = ( {
    selectedValue,
    onChange,
    title,
    description,
    options = [
        { value: 'admin', title: 'Admin' },
        { value: 'vendor', title: 'Vendor' },
    ],
    name = 'recipient_selector',
    default: defaultValue = 'admin',
} ) => {
    // Initialize state with selectedValue or defaultValue
    const [ selected, setSelected ] = useState( selectedValue || defaultValue );

    // Update local state when selectedValue prop changes
    useEffect( () => {
        if ( selectedValue !== undefined ) {
            setSelected( selectedValue );
        }
    }, [ selectedValue ] );

    // Handle selection change
    const handleChange = ( value ) => {
        setSelected( value );
        if ( onChange ) {
            onChange( value );
        }
    };

    // Render the appropriate icon based on value and selection state
    const renderIcon = ( value ) => {
        const isSelected = selected === value;

        if ( value === 'admin' ) {
            return <AdminIcon selected={ isSelected } />;
        } else if ( value === 'vendor' ) {
            return <VendorIcon selected={ isSelected } />;
        }

        return null;
    };

    return (
        <div className="mb-3">
            <div className="mb-3">
                <h2 className="text-base leading-6 font-semibold text-gray-900">
                    { title }
                </h2>
                <p className="mt-1.5 text-sm text-[#828282] mb-2">
                    { description }
                </p>
            </div>
            <div className="flex flex-wrap gap-4">
                { options.map( ( option ) => (
                    <SelectorCard
                        key={ option.value }
                        value={ option.value }
                        title={ option.title }
                        selected={ selected === option.value }
                        onChange={ handleChange }
                        icon={ renderIcon( option.value ) }
                    />
                ) ) }
            </div>

            { /* Hidden input for form submission */ }
            <input type="hidden" name={ name } value={ selected } />
        </div>
    );
};

export default RecipientSelector;
