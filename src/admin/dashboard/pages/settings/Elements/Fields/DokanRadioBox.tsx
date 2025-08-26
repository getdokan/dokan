import { dispatch } from '@wordpress/data';
import { DokanFieldLabel } from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';

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
        <div className="flex flex-col gap-2 p-5 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                tooltip={ element.helper_text }
                imageUrl={ element?.image_url }
            />
            <div className="flex flex-wrap gap-4 mt-4">
                { element.options?.map( ( option ) => {
                    const isSelected = selected === option.value;
                    let strokeColor = '#E9E9E9';
                    if ( isSelected ) {
                        strokeColor = '#7047EB';
                    } else if ( element.disabled ) {
                        strokeColor = '#E9E9E9';
                    }
                    return (
                        <button
                            key={ option.value }
                            type="button"
                            className={ ` border rounded-md p-3 flex flex-col gap-3 items-start w-40 transition-colors ${
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
                                className={ `flex items-center justify-between` }
                            >
                                <div>
                                    <img
                                        src={ option.icon }
                                        alt={ option.title }
                                        className="max-w-20"
                                    />
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
                                                <circle
                                                    cx="5"
                                                    cy="5"
                                                    fill="#7047EB"
                                                    r="5"
                                                />
                                            </svg>
                                        </div>
                                    ) }
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-[#25252D]">
                                { option.title || option.value }
                            </span>
                        </button>
                    );
                } ) }
            </div>
        </div>
    );
}
