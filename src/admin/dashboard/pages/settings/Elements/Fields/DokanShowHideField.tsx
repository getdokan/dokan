import { ShowHideField } from '../../../../../../components/fields';
import DokanFieldLabel from '../../../../../../components/fields/DokanFieldLabel';

export default function DokanShowHideField( { element } ) {
    if ( ! element.display ) {
        return null;
    }

    return (
        <div className="flex p-4 gap-2 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                tooltip={ element.helper_text }
            />

            <div className="flex items-center gap-4 w-full">
                <div className="flex-1">
                    <ShowHideField
                        value={ element.value }
                        label={ element.title }
                        tooltip={ element.tooltip }
                        disabled={ element.disabled }
                        helperText={ element.description }
                        placeholder={ element.placeholder }
                        onChange={ ( value ) =>
                            element.onChange( {
                                ...element,
                                value,
                            } )
                        }
                    />
                </div>
            </div>
        </div>
    );
}
