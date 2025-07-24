import { SettingsProps } from '../../types';
import AlertIcon from '../../../../icons/AlertIcon';
import { DokanSwitch } from '../../../../../../components/fields';
import { __ } from '@wordpress/i18n';

const DataClearField = ( { element, onValueChange }: SettingsProps ) => {
    return (
        <div
            className={
                'w-full flex justify-between items-center bg-[#E64E6112] p-5'
            }
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
