import React, { useState } from '@wordpress/element';
import { SettingsProps } from '../../StepSettings';

const Radio = ( { element, onValueChange }: SettingsProps ) => {
    const [ selected, setSelected ] = useState(
        element.value || element.default
    );

    if ( ! element.display ) {
        return <></>;
    }

    const handleChange = ( newValue ) => {
        setSelected( newValue );
        onValueChange( {
            ...element,
            value: newValue,
        } );
    };

    return (
        <div className=" grid grid-cols-12 p-4 gap-y-4 w-full @container/radio ">
            <div className=" col-span-12 @md/radio:col-span-8 ">
                <h2 className="text-sm leading-6 font-semibold text-gray-900">
                    { element?.title }
                </h2>
                <p className=" text-sm font-normal text-[#828282]">
                    { element?.description }
                </p>
            </div>
            <div className=" col-span-12 @md/radio:col-span-4 flex items-center @md/radio:justify-end">
                { element?.options?.map( ( option, index ) => (
                    <button
                        key={ option?.value }
                        type="button"
                        className={ `px-6 py-2  text-sm font-semibold  border
                         ${ index === 0 ? 'rounded-l-md' : 'rounded-r-md' }
                         ${
                             selected === option?.value
                                 ? 'bg-[#7047EB] border-[#7047EB] text-white'
                                 : 'bg-white text-gray-800 border-gray-200'
                         }` }
                        onClick={ () => handleChange( option?.value ) }
                        aria-pressed={ selected === option?.value }
                    >
                        { option?.title }
                    </button>
                ) ) }
            </div>
        </div>
    );
};

export default Radio;
