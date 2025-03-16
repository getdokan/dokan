import { useState } from '@wordpress/element';
import SelectorCard from './SelectorCard';
import AdminIcon from '../../components/icons/AdminIcon';
import VendorIcon from '../../components/icons/VendorIcon';
import { SettingsProps } from '../../StepSettings';

const RecipientSelector = ( { element, onValueChange }: SettingsProps ) => {
    const { default: defaultValue } = element;
    const [ selected, setSelected ] = useState( defaultValue );

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
        <div className="p-4">
            <div className="flex-col flex gap-1 w-[70%]">
                <h2 className="text-sm leading-6 font-semibold text-gray-900">
                    { element?.title }
                </h2>
                <p className=" text-sm font-normal text-[#828282]">
                    { element?.description }
                </p>
            </div>
            <div className="flex flex-wrap gap-4">
                { element?.options?.map( ( option ) => (
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
        </div>
    );
};

export default RecipientSelector;
