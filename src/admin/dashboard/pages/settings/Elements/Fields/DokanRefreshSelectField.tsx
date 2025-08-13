import { SettingsElement } from '../../types';
import { twMerge } from 'tailwind-merge';
import {
    DokanFieldLabel,
    DokanSelect,
} from '../../../../../../components/fields';
import { __ } from '@wordpress/i18n';
import RefreshIcon from '../../../../../../components/Icons/RefreshIcon';
import { useState } from '@wordpress/element';
import settingsStore from '../../../../../../stores/adminSettings';
import { dispatch } from '@wordpress/data';

interface DokanRefreshSelectFieldProps extends SettingsElement {
    onRefresh?: () => void;
}

const DokanRefreshSelectField = ( {
    element,
    className,
}: {
    element: DokanRefreshSelectFieldProps;
    className?: string;
} ) => {
    const [ selectedProfile, setSelectedProfile ] = useState(
        element.value || element.default || ''
    );
    if ( ! element.display ) {
        return null;
    }

    const handleRefresh = () => {
        if ( element.onRefresh ) {
            element.onRefresh();
        }
        // fetchSettings from the store
        dispatch( settingsStore )
            .fetchSettings()
            .then( ( updatedSettings ) => {
                // Update the selected profile with the new value
                const updatedElement = updatedSettings.find(
                    ( setting ) => setting.hook_key === element.hook_key
                );
                if ( updatedElement ) {
                    setSelectedProfile( updatedElement.value || '' );
                }
            } )
            .catch( ( error ) => {
                console.error( 'Error refreshing settings:', error );
                // Optionally, you can handle the error here, e.g., show a notification
                // or revert to the previous value.
                setSelectedProfile( element.value || element.default || '' );
            } );
    };

    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };
    return (
        <div className={ twMerge( 'w-full p-5 ', className ) }>
            <div className="grid grid-cols-12">
                <div className="col-span-12 md:col-span-6 ">
                    <DokanFieldLabel
                        title={ element?.title }
                        helperText={ element.description }
                        tooltip={ element?.helper_text }
                        icon={ element.icon || '' }
                        titleFontWeight="light"
                    />
                </div>

                <div className="flex col-span-12 md:col-span-6 items-center justify-end gap-4">
                    <DokanSelect
                        options={
                            element.options?.map( ( option ) => ( {
                                label: option.title,
                                value: option.value,
                            } ) ) || []
                        }
                        onChange={ ( value ) => {
                            setSelectedProfile( value as string );
                            onValueChange( {
                                ...element,
                                value: value as string,
                            } );
                        } }
                        placeholder={ element.placeholder as string }
                        disabled={ element.disabled }
                        value={ selectedProfile as string }
                        containerClassName={ 'w-72' }
                    />

                    { /* Refresh Button */ }
                    <button
                        onClick={ handleRefresh }
                        className="px-6 py-2.5 bg-white border border-[#e9e9e9] rounded-[5px] text-[#393939] text-sm font-medium flex items-center gap-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshIcon />
                        { __( 'Refresh', 'dokan-lite' ) }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DokanRefreshSelectField;
