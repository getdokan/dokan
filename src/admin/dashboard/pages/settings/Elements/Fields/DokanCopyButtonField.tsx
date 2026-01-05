import { CopyField, FieldLabel } from '@wedevs/plugin-ui';

export default function DokanCopyButtonField( { element, onValueChange } ) {
    if ( ! element.display ) {
        return null;
    }

    return (
        <div className="grid grid-cols-6 p-4 gap-4 w-full">
            { ( element.title || element.description ) && (
                <div className="md:col-span-2 col-span-6">
                    <FieldLabel
                        title={ element.title }
                        description={ element.description }
                        tooltip={ element.help_text || element.helper_text }
                        imageUrl={ element?.image_url }
                        htmlFor={ element.id }
                        isBold={ true }
                    />
                </div>
            ) }
            <div className={ element.title ? 'md:col-span-4 col-span-6' : 'col-span-6' }>
                <CopyField
                    id={ element.id }
                    value={ element.value as string }
                    placeholder={ element.placeholder as string }
                    disabled={ element.disabled }
                />
            </div>
        </div>
    );
}
