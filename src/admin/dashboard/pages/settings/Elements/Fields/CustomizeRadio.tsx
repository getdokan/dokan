import { useState } from '@wordpress/element';
import { SettingsProps } from '../../types';
import { SettingsElementOption } from '../../../../../../stores/adminSettings/types';
import { DokanFieldLabel } from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';
import { dispatch } from '@wordpress/data';

export interface RadioOption {
    value: string | number;
    title: string;
    description?: string;
    icon?: JSX.Element;
    image?: string;
    preview?: JSX.Element;
}

export interface CustomizeRadioProps {
    options: RadioOption[];
    selectedValue: string | number;
    onChange: ( value: string | number ) => void;
    radio_variant?: 'simple' | 'card' | 'template';
    name?: string;
    className?: string;
    disabled?: boolean;
    radioVariant?: 'simple' | 'card' | 'template';
}

const RadioButton = ( {
    checked,
    disabled = false,
}: {
    checked: boolean;
    disabled?: boolean;
} ) => {
    let strokeColor = '#E9E9E9';
    if ( checked ) {
        strokeColor = '#7047EB';
    } else if ( disabled ) {
        strokeColor = '#E9E9E9';
    }

    return (
        <div className="relative w-[18px] h-[18px]">
            <svg
                className="block w-full h-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 18 18"
            >
                <circle
                    cx="9"
                    cy="9"
                    r="8.5"
                    stroke={ strokeColor }
                    strokeWidth="1"
                    fill="none"
                />
            </svg>
            { checked && (
                <div className="absolute inset-[22.222%]">
                    <svg
                        className="block w-full h-full"
                        fill="none"
                        preserveAspectRatio="none"
                        viewBox="0 0 10 10"
                    >
                        <circle cx="5" cy="5" fill="#7047EB" r="5" />
                    </svg>
                </div>
            ) }
        </div>
    );
};

const SimpleRadioOption = ( {
    option,
    isSelected,
    onSelect,
    disabled = false,
    name,
}: {
    option: RadioOption;
    isSelected: boolean;
    onSelect: () => void;
    disabled?: boolean;
    name?: string;
} ) => {
    const handleKeyDown = ( event: any ) => {
        if ( event.key === 'Enter' || event.key === ' ' ) {
            event.preventDefault();
            if ( ! disabled ) {
                onSelect();
            }
        }
    };

    const borderClass = isSelected
        ? 'border-[#7047EB] bg-white'
        : 'border-[#E9E9E9] bg-white hover:border-gray-300';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

    return (
        <div
            className={ `relative border rounded-[5px] p-[14px] cursor-pointer transition-colors ${ borderClass } ${ disabledClass }` }
            onClick={ ! disabled ? onSelect : undefined }
            onKeyDown={ handleKeyDown }
            role="radio"
            aria-checked={ isSelected }
            tabIndex={ 0 }
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="font-semibold text-[14px] text-[#25252D] leading-[1.3] mb-1">
                        { option.title }
                    </h3>
                    { option.description && (
                        <p className="font-normal text-[12px] text-[#788383] leading-[1.4]">
                            { option.description }
                        </p>
                    ) }
                </div>
                <div className="ml-4 flex-shrink-0">
                    <RadioButton checked={ isSelected } disabled={ disabled } />
                </div>
            </div>
            <input
                type="radio"
                name={ name }
                value={ option.value }
                checked={ isSelected }
                onChange={ onSelect }
                className="sr-only"
                disabled={ disabled }
            />
        </div>
    );
};

const CardRadioOption = ( {
    option,
    isSelected,
    onSelect,
    disabled = false,
    name,
}: {
    option: RadioOption;
    isSelected: boolean;
    onSelect: () => void;
    disabled?: boolean;
    name?: string;
} ) => {
    const handleKeyDown = ( event: any ) => {
        if ( event.key === 'Enter' || event.key === ' ' ) {
            event.preventDefault();
            if ( ! disabled ) {
                onSelect();
            }
        }
    };

    const borderClass = isSelected
        ? 'border-[#7047EB] bg-white'
        : 'border-[#D3D3D3] bg-white hover:border-gray-300';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

    return (
        <div
            className={ `relative border rounded-[4px] cursor-pointer transition-colors overflow-hidden ${ borderClass } ${ disabledClass }` }
            onClick={ ! disabled ? onSelect : undefined }
            onKeyDown={ handleKeyDown }
            role="radio"
            aria-checked={ isSelected }
            tabIndex={ 0 }
        >
            <div className="flex items-center justify-between p-[14px] border-b border-[#D3D3D3]">
                <span className="font-semibold text-[14px] text-[#25252D]">
                    { option.title }
                </span>
                <RadioButton checked={ isSelected } disabled={ disabled } />
            </div>

            { option.preview && (
                <div className="bg-[#F3F3F3]">
                    <img
                        src={ option.image }
                        alt={ option.title }
                        className="w-full h-auto"
                    />
                </div>
            ) }

            <input
                type="radio"
                name={ name }
                value={ option.value }
                checked={ isSelected }
                onChange={ onSelect }
                className="sr-only"
                disabled={ disabled }
            />
        </div>
    );
};

const CustomizeRadioCore = ( {
    options,
    selectedValue,
    onChange,
    radioVariant = 'simple',
    name = 'customize-radio',
    className = '',
    disabled = false,
}: CustomizeRadioProps ) => {
    const handleSelect = ( value: string | number ) => {
        if ( ! disabled ) {
            onChange( value );
        }
    };

    let baseClassName = 'grid grid-cols-1 gap-4';
    // eslint-disable-next-line camelcase
    if ( radioVariant === 'simple' ) {
        baseClassName = 'grid grid-cols-2 gap-4';
    } else if ( radioVariant === 'card' ) {
        baseClassName = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
    }

    return (
        <div className={ `${ baseClassName } ${ className }` }>
            { options.map( ( option ) => {
                const isSelected = option.value === selectedValue;

                if ( radioVariant === 'card' || radioVariant === 'template' ) {
                    return (
                        <CardRadioOption
                            key={ option.value }
                            option={ option }
                            isSelected={ isSelected }
                            onSelect={ () => handleSelect( option.value ) }
                            disabled={ disabled }
                            name={ name }
                        />
                    );
                }

                return (
                    <SimpleRadioOption
                        key={ option.value }
                        option={ option }
                        isSelected={ isSelected }
                        onSelect={ () => handleSelect( option.value ) }
                        disabled={ disabled }
                        name={ name }
                    />
                );
            } ) }
        </div>
    );
};

// Settings wrapper component
const CustomizeRadio = ( { element }: SettingsProps ) => {
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

    // Transform element options to RadioOption format
    const transformedOptions: RadioOption[] =
        element?.options?.map( ( option: SettingsElementOption ) => ( {
            value: option.value,
            title: option.title,
            description: option.description,
            icon: option.icon ? (
                <div dangerouslySetInnerHTML={ { __html: option.icon } } />
            ) : undefined,
            image: option.image,
            preview: option.preview ? (
                <div dangerouslySetInnerHTML={ { __html: option.preview } } />
            ) : undefined,
        } ) ) || [];

    return (
        <div className="p-4">
            <DokanFieldLabel
                title={ element.title || '' }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <div className="mt-4">
                <CustomizeRadioCore
                    options={ transformedOptions }
                    selectedValue={ ( selected as string | number ) || '' }
                    onChange={ handleChange }
                    radioVariant={
                        ( element?.radio_variant as
                            | 'simple'
                            | 'card'
                            | 'template' ) || 'simple'
                    }
                    name={ element?.id }
                    className={ element?.css_class || '' }
                    disabled={ element?.disabled || false }
                />
            </div>
        </div>
    );
};

export default CustomizeRadio;
