import { SettingsProps } from '../../types';
import AlertIcon from '../../../../icons/AlertIcon';
import { DokanSwitch } from '../../../../../../components/fields';
import { __ } from '@wordpress/i18n';
import settingsStore from '../../../../../../stores/adminSettings';
import { dispatch } from '@wordpress/data';

const DataClearField = ( { element }: SettingsProps ) => {
    if ( ! element.display ) {
        return null;
    }

    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };
    return (
        <div
            className={
                'w-full flex justify-between items-center bg-[#E64E6112] p-5'
            }
            id={ element.id }
        >
            <div className="flex flex-col">
                <div className="flex gap-2">
                    <span className="font-semibold text-sm text-red-800">
                        { element.title }
                    </span>
                    { /*    Alert button*/ }
                    <AlertIcon />
                </div>
                <span className="text-sm text-red-800">
                    { element.description ||
                        __(
                            'Permanently delete all data and database tables related to Dokan and Dokan Pro plugins once the plugins are deleted. This action cannot be undone.' +
                                '' +
                                '' +
                                '' +
                                '' +
                                ''
                        ) }
                </span>
            </div>
            <DokanSwitch
                checked={ element.value === true }
                onChange={ ( value ) => {
                    onValueChange( { ...element, value } );
                } }
                // class name for active state
                color="danger"
            />
        </div>
    );
};

export default DataClearField;

