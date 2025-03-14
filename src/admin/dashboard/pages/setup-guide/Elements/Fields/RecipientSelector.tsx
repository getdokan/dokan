import { useState } from '@wordpress/element';
import SelectorCard from './SelectorCard';
import AdminIcon from '../../components/icons/AdminIcon';
import VendorIcon from '../../components/icons/VendorIcon';

const RecipientSelector = ( { element, onValueChange } ) => {
    const {
        title,
        description,
        default: defaultValue,
        options,
        value: selectedValue,
    } = element;

    const [ selected, setSelected ] = useState( selectedValue || defaultValue );

    // Handle selection change
    const handleChange = ( newValue ) => {
        setSelected( newValue );
        console.log( 'Selected value:', newValue );
        onValueChange( {
            ...element,
            selectedValue: newValue,
        } );
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
                { options?.map( ( option ) => (
                    <SelectorCard
                        key={ option.value }
                        value={ option.value }
                        title={ option.title }
                        selected={ selected === option.value }
                        onChange={ handleChange }
                        icon={ renderIcon( option?.value ) }
                    />
                ) ) }
            </div>

            { /* Hidden input for form submission */ }
            <input type="hidden" name={ element.id } value={ selected } />
        </div>
    );
};

export default RecipientSelector;
