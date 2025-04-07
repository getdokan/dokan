import { useState, RawHTML } from '@wordpress/element';
import SelectorCard from './SelectorCard';
import AdminIcon from '../../components/icons/AdminIcon';
import VendorIcon from '../../components/icons/VendorIcon';
import { SettingsProps } from '../../StepSettings';

const RadioBox = ( { element, onValueChange }: SettingsProps ) => {
    const [ selected, setSelected ] = useState(
        element?.value || element?.default
    );

    // Handle selection change
    const handleChange = ( newValue ) => {
        setSelected( newValue );
        onValueChange( {
            ...element,
            value: newValue,
        } );
    };

    // Render the appropriate icon based on value and selection state
    const renderIcon = ( value ) => {
        const isSelected = selected === value;

        if ( element?.icon ) {
            return element.icon;
        }

        if ( value === 'admin' ) {
            return <AdminIcon selected={ isSelected } />;
        } else if ( value === 'seller' ) {
            return <VendorIcon selected={ isSelected } />;
        }

        return null;
    };

    if ( ! element.display ) {
        return <></>;
    }

    return (
        <div id={ element.hook_key } className="w-full ">
            <div className="p-4 flex flex-col gap-y-4 ">
                <div className="flex-col flex gap-1">
                    <h2 className="@sm:text-sm @md:text-base leading-6 font-semibold text-gray-900">
                        <RawHTML>{ element?.title }</RawHTML>
                    </h2>
                    <p className="text-xs md:text-sm font-normal text-[#828282]">
                        <RawHTML>{ element?.description }</RawHTML>
                    </p>
                </div>
                <div className="flex flex-wrap gap-4 @md:gap-6">
                    { element?.options?.map( ( option ) => (
                        <SelectorCard
                            key={ option?.value }
                            value={ option?.value }
                            title={ option?.title }
                            onChange={ handleChange }
                            icon={ renderIcon( option?.value ) }
                            selected={ selected === option?.value }
                        />
                    ) ) }
                </div>
            </div>
        </div>
    );
};

export default RadioBox;
