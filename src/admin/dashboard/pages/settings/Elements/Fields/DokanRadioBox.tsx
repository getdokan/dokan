import { DokanFieldLabel } from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';
import { dispatch } from '@wordpress/data';

export default function DokanRadioBox( { element } ) {
    if ( ! element.display ) {
        return null;
    }
    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };
    const selected = element.value || element?.default;
    return (
        <div className="flex flex-col gap-2 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <div className="flex flex-wrap gap-4 mt-4">
                { element.options?.map( ( option ) => {
                    const isSelected = selected === option.value;
                    return (
                        <button
                            key={ option.value }
                            type="button"
                            className={ `relative border rounded-md p-3 flex flex-col gap-3 items-start w-36 transition-colors ${
                                isSelected
                                    ? 'border-[#7047EB]'
                                    : 'border-[#E9E9E9] hover:border-gray-300'
                            }` }
                            onClick={ () =>
                                onValueChange( {
                                    ...element,
                                    value: option.value,
                                } )
                            }
                        >
                            <div
                                className={ `p-3 border rounded-lg flex items-center justify-center ${
                                    isSelected
                                        ? 'bg-[#F1EDFD] border-[#E5E0F2]'
                                        : 'bg-[#F8F9F8] border-[#E9E9E9]'
                                }` }
                            >
                                { option.icon }
                            </div>
                            <span className="text-sm font-semibold text-[#25252D]">
                                { option.title || option.value }
                            </span>
                            <div className="absolute top-1 right-1 text-purple-600">
                                { isSelected ? (
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                    >
                                        <circle
                                            cx="8"
                                            cy="8"
                                            r="8"
                                            fill="#7047EB"
                                        />
                                        <path
                                            d="M6.5 10.5L4 8L4.5 7.5L6.5 9.5L11.5 4.5L12 5L6.5 10.5Z"
                                            fill="white"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                    >
                                        <circle
                                            cx="8"
                                            cy="8"
                                            r="7.5"
                                            stroke="#E9E9E9"
                                            fill="white"
                                        />
                                    </svg>
                                ) }
                            </div>
                        </button>
                    );
                } ) }
            </div>
        </div>
    );
}
