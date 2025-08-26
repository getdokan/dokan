import { RadioOptionProps } from './types';

const RadioBoxOption: React.FC< RadioOptionProps > = ( {
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
        ? 'border-[#7047EB]'
        : 'border-[#E9E9E9] hover:border-gray-300';
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

    let strokeColor = '#E9E9E9';
    if ( isSelected ) {
        strokeColor = '#7047EB';
    } else if ( disabled ) {
        strokeColor = '#E9E9E9';
    }

    return (
        <button
            type="button"
            className={ `border rounded-md p-3 flex flex-col gap-3 items-start w-40 transition-colors ${ borderClass } ${ disabledClass }` }
            onClick={ ! disabled ? onSelect : undefined }
            onKeyDown={ handleKeyDown }
            disabled={ disabled }
        >
            <div className="flex items-center justify-between w-full">
                <div>
                    { option.icon ? (
                        <div className="max-w-20">
                            <img
                                src={ option.icon as unknown as string }
                                alt={ option.title }
                                className="w-full h-full object-contain"
                            />
                        </div>
                    ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="#6B7280"
                                    strokeWidth="2"
                                    fill="none"
                                />
                            </svg>
                        </div>
                    ) }
                </div>
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
                    { isSelected && (
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
            </div>
            <span className="text-sm font-semibold text-[#25252D]">
                { option.title || option.value }
            </span>
            <input
                type="radio"
                name={ name }
                value={ option.value }
                checked={ isSelected }
                onChange={ onSelect }
                className="sr-only"
                disabled={ disabled }
            />
        </button>
    );
};

export default RadioBoxOption;
