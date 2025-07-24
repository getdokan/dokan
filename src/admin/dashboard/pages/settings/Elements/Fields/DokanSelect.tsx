import {
    DokanFieldLabel,
    DokanSelect as BaseDokanSelect,
} from '../../../../../../components/fields';

export default function DokanSelect( { element, onValueChange } ) {
    return (
        <div className="flex justify-between w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                wrapperClassNames={ 'flex-1' }
            />
            <BaseDokanSelect
                value={ element.value }
                onChange={ ( val ) =>
                    onValueChange( { ...element, value: val } )
                }
                options={
                    element.options?.map( ( option ) => ( {
                        label: option.title,
                        value: option.value,
                    } ) ) || []
                }
                disabled={ element.disabled }
            />
        </div>
    );
}
