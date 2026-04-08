import { dispatch } from '@wordpress/data';
import { useState, useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { twMerge } from 'tailwind-merge';
import {
    DokanFieldLabel,
    DokanSelect,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';
import { SettingsElement } from '../../types';
import { applyFilters } from '@wordpress/hooks';
import { Check, RefreshCw } from 'lucide-react';
import apiFetch from '@wordpress/api-fetch';
import { truncate } from '@src/utilities';

interface OptionValue {
    label: string;
    value: string | number;
}

interface OptionGroup {
    title: string;
    value: OptionValue[];
}

interface DokanRefreshSelectFieldProps extends SettingsElement {
    onRefresh?: () => void;
    api_endpoint?: string;
}

const DokanRefreshSelectField = ( {
    element,
    className,
}: {
    element: DokanRefreshSelectFieldProps;
    className?: string;
} ) => {
    const [ selectedProfile, setSelectedProfile ] = useState(
        String( element.value || element.default || '' )
    );
    const [ isRefreshing, setIsRefreshing ] = useState( false );
    const [ showRefreshedMsg, setShowRefreshedMsg ] = useState( false );
    const [ currentOptions, setCurrentOptions ] = useState< OptionGroup[] >(
        ( element.options as unknown as OptionGroup[] ) || []
    );

    const selectOptions = useMemo( () => {
        return (
            currentOptions?.flatMap(
                ( item: OptionGroup ) =>
                    item?.value?.map( ( v: OptionValue ) => ( {
                        label: applyFilters(
                            'dokan_admin_settings_refresh_select_options_label',
                            // eslint-disable-next-line @wordpress/valid-sprintf
                            sprintf(
                                /* translators: 1) Option title 2) Option label */
                                `%1$s : %2$s`,
                                item.title,
                                truncate( v.label, 16 )
                            ),
                            item,
                            v
                        ) as string,
                        value: v.value,
                    } ) )
            ) || []
        );
    }, [ currentOptions ] );

    if ( ! element.display ) {
        return null;
    }

    const handleRefresh = () => {
        if ( isRefreshing || showRefreshedMsg ) {
            return;
        }

        const apiEndpoint = element.api_endpoint;
        if ( ! apiEndpoint ) {
            // Fallback: if no api_endpoint configured, do nothing
            return;
        }

        setIsRefreshing( true );

        // Make REST API call using apiFetch
        apiFetch< OptionGroup[] >( {
            path: apiEndpoint,
            method: 'GET',
        } )
            .then( ( response ) => {
                if ( Array.isArray( response ) && response.length > 0 ) {
                    // Update options with the refreshed data
                    setCurrentOptions( response );

                    // Update the element options in the store
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    dispatch( settingsStore ).updateSettingsValue( {
                        ...element,
                        options: response,
                    } as any );

                    // Show a success message.
                    setShowRefreshedMsg( true );
                    setTimeout( () => setShowRefreshedMsg( false ), 3000 );
                }
            } )
            .catch( () => {
                // Handle error silently or show notification
            } )
            .finally( () => {
                setIsRefreshing( false );
            } );
    };

    const onValueChange = ( value: string ) => {
        // Dispatch the updated value to the settings store
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispatch( settingsStore ).updateSettingsValue( {
            ...element,
            value,
        } as any );
    };

    return (
        <div className={ twMerge( 'w-full p-5 ', className ) }>
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12 md:col-span-6 ">
                    <DokanFieldLabel
                        title={ element?.title || '' }
                        helperText={ element.description || '' }
                        tooltip={ element?.helper_text }
                        imageUrl={ element?.image_url }
                        titleFontWeight="light"
                        wrapperClassNames={ 'items-center h-full' }
                    />
                </div>

                <div className="flex col-span-12 md:col-span-6 items-center justify-end gap-4">
                    <DokanSelect
                        options={ selectOptions }
                        onChange={ ( value ) => {
                            setSelectedProfile( value as string );
                            onValueChange( value as string );
                        } }
                        placeholder={ element.placeholder as string }
                        disabled={ element.disabled }
                        value={ selectedProfile as string }
                        containerClassName="min-w-72"
                    />

                    { /* Refresh Button - only render if api_endpoint is set */ }
                    { element.api_endpoint && (
                        <button
                            onClick={ handleRefresh }
                            disabled={ isRefreshing || showRefreshedMsg }
                            className="px-6 py-2.5 bg-white border border-[#e9e9e9] rounded-[5px] text-[#393939] text-sm font-medium flex items-center gap-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            { ! isRefreshing && ! showRefreshedMsg && (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    { __( 'Refresh', 'dokan-lite' ) }
                                </>
                            ) }
                            { isRefreshing && (
                                <span className="text-[#444]">
                                    { __( 'Refreshing…', 'dokan-lite' ) }
                                </span>
                            ) }
                            { showRefreshedMsg && (
                                <span className="text-[#46b450] flex items-center gap-1">
                                    <Check className="w-4 h-4" />
                                    { __( 'Refreshed!', 'dokan-lite' ) }
                                </span>
                            ) }
                        </button>
                    ) }
                </div>
            </div>
        </div>
    );
};

export default DokanRefreshSelectField;
