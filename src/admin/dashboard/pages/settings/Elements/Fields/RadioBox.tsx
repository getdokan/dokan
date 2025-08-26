import { dispatch } from '@wordpress/data';
import React, { useState } from '@wordpress/element';
import { DokanFieldLabel } from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';
import { SettingsProps } from '../../types';

const SelectorCard = ( {
    value,
    title,
    selected,
    onChange,
    icon,
}: {
    value: string | number;
    title: string;
    selected: boolean;
    onChange: ( value: string | number ) => void;
    icon?: any;
} ) => {
    const handleClick = () => {
        onChange( value );
    };

    return (
        <button
            className={ `relative border rounded-md p-3 flex flex-col gap-3 items-start w-36 transition-colors ${
                selected
                    ? 'border-[#7047EB]'
                    : 'border-[#E9E9E9] hover:border-gray-300'
            }` }
            onClick={ handleClick }
        >
            <div
                className={ `p-3 border rounded-lg flex items-center justify-center ${
                    selected
                        ? 'bg-[#F1EDFD] border-[#E5E0F2]'
                        : 'bg-[#F8F9F8] border-[#E9E9E9]'
                }` }
            >
                { icon }
            </div>
            <span className="text-sm font-semibold text-[#25252D]">
                { title || value }
            </span>
            <div className="absolute top-1 right-1 text-purple-600">
                { selected ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="8" fill="#7047EB" />
                        <path
                            d="M6.5 10.5L4 8L4.5 7.5L6.5 9.5L11.5 4.5L12 5L6.5 10.5Z"
                            fill="white"
                        />
                    </svg>
                ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle
                            cx="8"
                            cy="8"
                            r="7.5"
                            stroke="#E9E9E9"
                            fill="white"
                        />
                    </svg>
                ) }
            </div>
        </button>
    );
};

const RadioBox = ( { element }: SettingsProps ) => {
    const [ selected, setSelected ] = useState(
        element?.value || element?.default
    );

    if ( ! element.display ) {
        return null;
    }

    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    const handleChange = ( newValue: string | number ) => {
        setSelected( newValue );
        onValueChange( {
            ...element,
            value: newValue,
        } );
    };

    const renderIcon = ( value: string | number ) => {
        const isSelected = selected === value;

        if ( element?.icon ) {
            return element.icon;
        }

        // Default icons for admin/seller
        if ( value === 'admin' ) {
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                        fill={ isSelected ? '#7047EB' : '#6B7280' }
                    />
                </svg>
            );
        } else if ( value === 'seller' ) {
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                        fill={ isSelected ? '#7047EB' : '#6B7280' }
                    />
                </svg>
            );
        }

        return null;
    };

    return (
        <div className="p-4">
            <DokanFieldLabel
                title={ element.title || '' }
                titleFontWeight="light"
                helperText={ element.description }
                imageUrl={ element?.image_url }
            />
            <div className="flex flex-wrap gap-4 mt-4">
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
    );
};

export default RadioBox;
