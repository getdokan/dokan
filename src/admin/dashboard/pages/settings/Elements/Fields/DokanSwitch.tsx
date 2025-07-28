import {
    DokanFieldLabel,
    DokanSwitch as BaseSwitch,
} from '../../../../../../components/fields';

export default function DokanSwitch( { element, onValueChange } ) {
    return (
        <div className="grid grid-cols-4 justify-between items-center flex-wrap gap-2 p-5 w-full">
            <div className="col-span-3">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                tooltip={ element.tooltip }
            />
            </div>
            <div className="col-span-1 flex justify-end">
            <BaseSwitch
                checked={ element.value === element.enable_state?.value }
                onChange={ ( checked ) =>
                    onValueChange( {
                        ...element,
                        value: checked
                            ? element.enable_state?.value
                            : element.disable_state?.value,
                    } )
                }
                label={ element.label }
                disabled={ element.disabled }
            />
            </div>
        </div>
    );
}
