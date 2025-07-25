import {
    DokanCheckboxGroup as BaseCheckboxGroup,
    DokanFieldLabel,
} from '../../../../../../components/fields';
import { twMerge } from 'tailwind-merge';

export default function DokanCheckboxGroup( {
    element,
    onValueChange,
    className,
} ) {
    return (
        <div className={ twMerge( 'flex flex-col gap-2 w-full', className ) }>
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
