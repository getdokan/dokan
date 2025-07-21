import {
    DokanFieldLabel,
    DokanSwitch as BaseSwitch,
} from '../../../../../../components/fields';

export default function DokanSwitch( { element, onValueChange } ) {
    return (
        <div className="flex justify-between items-center flex-wrap gap-2 p-5 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                tooltip={ element.tooltip }
            />
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
    );
}
