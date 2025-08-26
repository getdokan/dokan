import RadioButton from './RadioButton';
import { RadioOptionProps } from './types';

const CardRadioOption: React.FC< RadioOptionProps > = ( {
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

            { option.image && (
                <div className="p-6">
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

export default CardRadioOption;
