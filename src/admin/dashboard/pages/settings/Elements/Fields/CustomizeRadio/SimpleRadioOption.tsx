import RadioButton from './RadioButton';
import { RadioOptionProps } from './types';

const SimpleRadioOption: React.FC< RadioOptionProps > = ( {
    option,
    isSelected,
    onSelect,
    disabled = false,
    name,
} ) => {
    const handleKeyDown = ( event: React.KeyboardEvent ) => {
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

export default SimpleRadioOption;
