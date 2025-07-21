import {
    DokanFieldLabel,
    DokanRadioCapsule as BaseRadioCapsule,
} from '../../../../../../components/fields';

export default function DokanRadioCapsule( { element, onValueChange } ) {
    return (
        <div className="flex justify-between w-full p-5 ">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                tooltip={ element.tooltip }
            />
            <BaseRadioCapsule
                options={
                    element.options?.map( ( option ) => ( {
                        value: option.value,
                        title: option.title,
                    } ) ) || []
                }
                selected={ element.value || '' }
                onChange={ ( val ) =>
                    onValueChange( { ...element, value: val } )
                }
            />
        </div>
    );
}
