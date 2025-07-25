import React from 'react';
import { DokanFieldLabel, List } from '../../../../../../components/fields';

export default function DokanListField( { element, onValueChange } ) {
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
