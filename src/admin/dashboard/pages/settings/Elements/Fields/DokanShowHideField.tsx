import { ShowHideField } from '../../../../../../components/fields';
import DokanFieldLabel from '../../../../../../components/fields/DokanFieldLabel';

export default function DokanShowHideField( { element } ) {
    if ( ! element.display ) {
        return null;
    }

    return (
        <div className="grid grid-cols-6 p-4 gap-4 w-full">
            <div className="md:col-span-2 col-span-6">
                <DokanFieldLabel
                    title={ element.title }
                    helperText={ element.description }
                    tooltip={ element.help_text }
                    titleFontWeight="bold"
                />
            </div>
            <div className="md:col-span-4 col-span-6">
                <ShowHideField
                    value={ element.value }
                    disabled={ element.disabled }
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
    );
}
