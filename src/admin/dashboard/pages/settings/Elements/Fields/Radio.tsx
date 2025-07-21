import { useState } from '@wordpress/element';
import { SettingsProps } from '../../types';
import { DokanFieldLabel } from '../../../../../../components/fields';

const Radio = ( { element, onValueChange }: SettingsProps ) => {
    const [ selected, setSelected ] = useState(
        element.value || element.default
    );

    if ( ! element.display ) {
        return null;
    }

    const handleChange = ( newValue: string | number ) => {
        setSelected( newValue );
        onValueChange( {
            ...element,
            value: newValue,
        } );
    };

    return (
        <div className="p-4">
            <DokanFieldLabel
                title={ element.title || '' }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <div className="flex items-center gap-4 mt-2">
                { element?.options?.map( ( option, index ) => (
                    <button
                        key={ option?.value }
                        type="button"
                        className={ `px-6 py-2 text-sm font-semibold border transition-colors
                         ${ index === 0 ? 'rounded-l-md' : 'rounded-r-md' }
                         ${
                             selected === option?.value
                                 ? 'bg-[#7047EB] border-[#7047EB] text-white'
                                 : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
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
