import {
    DokanCheckboxGroup as BaseCheckboxGroup,
    DokanFieldLabel,
} from '../../../../../../components/fields';

export default function DokanCheckboxGroup( { element, onValueChange } ) {
    return (
        <div className="flex flex-col gap-2 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <BaseCheckboxGroup
                name={ element.id }
                label={ element.title }
                helpText={ element.description }
                options={
                    element.options?.map( ( option ) => ( {
                        label: option.title,
                        value: option.value,
                    } ) ) || []
                }
                defaultValue={ element.value || [] }
                onChange={ ( values ) =>
                    onValueChange( { ...element, value: values } )
                }
            />
        </div>
    );
}
