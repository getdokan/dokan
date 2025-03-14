import { useState } from '@wordpress/element';

const RadioButton = ( { element, onValueChange } ) => {
    // Initialize state with selectedValue or default
    const {
        title,
        description,
        name = 'radio_button',
        default,
        value,
        options,
    } = element;
    const [ selected, setSelected ] = useState( default );

    // Handle selection change
    const handleChange = ( newValue ) => {
        setSelected( newValue );
        console.log( 'Selected value:', newValue );
        onValueChange( {
            ...element,
            value: newValue,
        } );
    };
    return (
        <div className="border border-[#E9E9E9] flex justify-between items-center p-4 w-full ">
            <div className="">
                <h2 className="text-base leading-6 font-semibold text-gray-900">
                    { title }
                </h2>
                <p className="mt-1.5 text-sm text-[#828282]">{ description }</p>
            </div>
            <div className="flex">
                { options?.map( ( option ) => (
                    <button
                        key={ option.value }
                        type="button"
                        className={ `px-6 py-2 text-sm font-semibold  border ${
                            selected === option.value
                                ? 'bg-[#7047EB] border-[#7047EB] text-white'
                                : 'bg-white text-gray-800 border-gray-200'
                        }` }
                        onClick={ () => handleChange( option.value ) }
                        aria-pressed={ selected === option.value }
                    >
                        { option.title }
                    </button>
                ) ) }
            </div>

            { /* Hidden input for form submission */ }
            <input type="hidden" name={ name } value={ selected } />
        </div>
    );
};

export default RadioButton;
