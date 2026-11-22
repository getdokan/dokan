import { __ } from '@wordpress/i18n';
import { Dashicon, SelectControl } from '@wordpress/components';
import { useEditorContext } from '../context';
import type { View } from '../types';

// Editor-only: which visitor the preview shows. The sidebar follows it.
export default function ViewingAs() {
    const { view, setView } = useEditorContext();

    return (
        <div className="dokan-vreg-editor__viewing-as">
            <Dashicon icon="visibility" size={ 18 } />
            <SelectControl
                __nextHasNoMarginBottom
                __next40pxDefaultSize
                label={ __( 'Viewing as', 'dokan-lite' ) }
                labelPosition="side"
                value={ view }
                options={ [
                    {
                        value: 'visitor',
                        label: __( 'New visitor', 'dokan-lite' ),
                    },
                    {
                        value: 'social',
                        label: __( 'Back from social login', 'dokan-lite' ),
                    },
                    {
                        value: 'customer',
                        label: __( 'Logged-in customer', 'dokan-lite' ),
                    },
                ] }
                onChange={ ( value ) => setView( value as View ) }
            />
        </div>
    );
}
