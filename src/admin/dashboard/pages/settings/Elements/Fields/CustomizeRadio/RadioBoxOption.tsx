import React from '@wordpress/element';
import { RadioOptionProps } from './types';
import parse from 'html-react-parser';

const RadioBoxOption = ( {
    option,
    isSelected,
    onSelect,
    disabled = false,
    name,
}: RadioOptionProps ) => {
    const handleKeyDown = ( event ) => {
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

    // Determine radio button stroke color based on state
    let radioStrokeColor = '#E9E9E9';
    if ( isSelected ) {
        radioStrokeColor = '#7047EB';
    } else if ( disabled ) {
        radioStrokeColor = '#D1D5DB';
    }

    return (
        <button
            type="button"
            className={ `border rounded-md p-2 flex flex-col justify-between gap-3 items-start h-[6rem] w-40 transition-colors ${ borderClass } ${ disabledClass }` }
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
                <div className="flex items-center justify-center w-[18px] h-[18px]">
                    <svg
                        className="w-full h-full"
                        viewBox="0 0 18 18"
                        fill="none"
                    >
                        <circle
                            cx="9"
                            cy="9"
                            r="8"
                            stroke={ radioStrokeColor }
                            strokeWidth="1"
                            fill="none"
                        />
                        { isSelected && (
                            <circle cx="9" cy="9" r="4" fill="#7047EB" />
                        ) }
                    </svg>
                </div>
            </div>
            <span className="text-sm font-semibold text-[#25252D]">
                { typeof option.title === 'string' && parse( option.title ) }
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
