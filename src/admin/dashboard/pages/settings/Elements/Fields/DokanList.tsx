import { DokanFieldLabel, List } from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';
import { dispatch } from '@wordpress/data';

export default function DokanListField( { element } ) {
    if ( ! element.display ) {
        return null;
    }

    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <List
                items={ element.items || [] }
                onSelect={ ( item, idx ) =>
                    onValueChange( {
                        ...element,
                        value: item,
                        selectedIndex: idx,
                    } )
                }
            />
        </div>
    );
}
