import CardRadioOption from './CardRadioOption';
import RadioBoxOption from './RadioBoxOption';
import SimpleRadioOption from './SimpleRadioOption';
import { CustomizeRadioProps } from './types';

const CustomizeRadioCore: React.FC< CustomizeRadioProps > = ( {
    options,
    selectedValue,
    onChange,
    radioVariant = 'simple',
    name = 'customize-radio',
    className = '',
    disabled = false,
    divider = true,
} ) => {
    const handleSelect = ( value: string | number ) => {
        if ( ! disabled ) {
            onChange( value );
        }
    };

    let baseClassName = 'grid grid-cols-1 gap-4';
    // eslint-disable-next-line camelcase
    if ( radioVariant === 'simple' ) {
        baseClassName = 'grid grid-cols-2 gap-4';
    } else if ( radioVariant === 'card' || radioVariant === 'template' ) {
        baseClassName = 'grid grid-cols-1 md:!grid-cols-2 lg:grid-cols-3 gap-4';
    } else if ( radioVariant === 'radio_box' ) {
        baseClassName = 'flex flex-wrap gap-4';
    }
    return (
        <div className={ `${ baseClassName } ${ className }` }>
            { options.map( ( option ) => {
                const isSelected = option.value === selectedValue;

                if ( radioVariant === 'radio_box' ) {
                    return (
                        <RadioBoxOption
                            key={ option.value }
                            option={ option }
                            isSelected={ isSelected }
                            onSelect={ () => handleSelect( option.value ) }
                            disabled={ disabled }
                            name={ name }
                        />
                    );
                }

                if ( radioVariant === 'card' || radioVariant === 'template' ) {
                    return (
                        <CardRadioOption
                            key={ option.value }
                            option={ option }
                            isSelected={ isSelected }
                            onSelect={ () => handleSelect( option.value ) }
                            disabled={ disabled }
                            name={ name }
                            divider={ divider }
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

export default CustomizeRadioCore;
