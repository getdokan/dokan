import { useEffect, useState } from '@wordpress/element';

const RadioButton = (
    {
        element: {
            title,
            description,
            selectedValue,
            name = 'radio_button',
            default: defaultValue = 'hide',
            value,
        },
    },
    onValueChange
) => {
    // Initialize state with selectedValue or defaultValue
    const [ selected, setSelected ] = useState( selectedValue || defaultValue );

    // Update local state when selectedValue prop changes
    useEffect( () => {
        if ( selectedValue !== undefined ) {
            setSelected( selectedValue );
        }
    }, [ selectedValue ] );

    // Handle selection change
    const handleChange = ( value ) => {
        setSelected( value );
    };

    return (
        <div className="border border-[#E9E9E9] flex justify-between items-center p-4 w-full rounded-md">
            <div className="">
                <h2 className="text-base leading-6 font-semibold text-gray-900">
                    { title }
                </h2>
                <p className="mt-1.5 text-sm text-[#828282]">{ description }</p>
            </div>
            <div className="flex">
                { /* Hide button */ }
                <button
                    type="button"
                    className={ `px-6 py-2 text-sm font-semibold rounded-l-md border ${
                        selected === 'hide'
                            ? 'bg-[#7047EB] border-[#7047EB] text-white'
                            : 'bg-white text-gray-800 border-gray-200'
                    }` }
                    onClick={ () => handleChange( 'hide' ) }
                    aria-pressed={ selected === 'hide' }
                >
                    Hide
                </button>

                { /* Show button */ }
                <button
                    type="button"
                    className={ `px-6 py-2 text-sm font-semibold rounded-r-md border ${
                        selected === 'show'
                            ? 'bg-[#7047EB] border-[#7047EB] text-white'
                            : 'bg-white text-gray-800 border-gray-200'
                    }` }
                    onClick={ () => handleChange( 'show' ) }
                    aria-pressed={ selected === 'show' }
                >
                    Show
                </button>
            </div>

            { /* Hidden input for form submission */ }
            <input type="hidden" name={ name } value={ selected } />
        </div>
    );
};

export default RadioButton;
