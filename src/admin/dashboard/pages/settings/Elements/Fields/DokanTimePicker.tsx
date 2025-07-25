import {
    DokanFieldLabel,
    DokanTimePicker,
} from '../../../../../../components/fields';

export default function DokanTimePickerField( { element, onValueChange } ) {
    return (
        <div className="flex flex-col gap-2 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <DokanTimePicker
                value={ element.value }
                onChange={ ( val ) =>
                    onValueChange( { ...element, value: val } )
                }
                className="w-full"
            />
        </div>
    );
}
