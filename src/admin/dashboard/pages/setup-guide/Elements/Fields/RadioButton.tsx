import { useState } from '@wordpress/element';
import { SettingsProps } from '../../StepSettings';

const RadioButton = ( { element, onValueChange }: SettingsProps ) => {
    // Initialize state with selectedValue or default

    const [ selected, setSelected ] = useState(
        element.value || element.default
    );

    // Handle selection change
    const handleChange = ( newValue ) => {
        setSelected( newValue );
        const { value } = element;
        onValueChange( {
            ...element,
            value: newValue,
        } );
    };
    return (
        <div className=" flex justify-between items-center p-4 w-full ">
            <div className="flex-col flex gap-1 w-[70%]">
                <h2 className="text-sm leading-6 font-semibold text-gray-900">
                    { element?.title }
                </h2>
                <p className=" text-sm font-normal text-[#828282]">
                    { element?.description }
                </p>
            </div>
            <div className="flex ">
                { element?.options?.map( ( option, index ) => (
                    <button
                        key={ option.value }
                        type="button"
                        className={ `px-6 py-2  text-sm font-semibold  border
                         ${ index === 0 ? 'rounded-l-md' : 'rounded-r-md' }
                         ${
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
            <input type="hidden" name={ element?.id } value={ selected } />
        </div>
    );
};

export default RadioButton;
