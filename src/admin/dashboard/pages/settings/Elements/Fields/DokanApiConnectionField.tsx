import { SettingsElement } from '../../types';
import { twMerge } from 'tailwind-merge';
import { DokanSelect } from '../../../../../../components/fields';
import DokanTooltip from '../../../../../../components/fields/DokanTooltip';
import { __ } from '@wordpress/i18n';
import RefreshIcon from '../../../../../../components/Icons/RefreshIcon';
import { useState } from '@wordpress/element';
import GoogleIcon from '../../../../../../components/Icons/GoogleIcon';

interface DokanApiConnectionFieldProps extends SettingsElement {
    provider?:
        | 'Google'
        | 'Facebook'
        | 'LinkedIn'
        | 'Twitter'
        | 'Apple'
        | 'OpenAI'
        | 'Anthropic'
        | 'Gemini'
        | 'Leonardo AI';
    isConnected?: boolean;
    profileOptions?: Array< { title: string; value: string } >;
    selectedProfile?: string;
    onDisconnect?: () => void;
    onRefresh?: () => void;
    onProfileChange?: ( profile: string ) => void;
}

const DokanApiConnectionField = ( {
    element,
    className,
}: {
    element: DokanApiConnectionFieldProps;
    className?: string;
} ) => {
    const [ selectedProfile, setSelectedProfile ] = useState(
        element.selectedProfile || ''
    );
    if ( ! element.display ) {
        return null;
    }
    const handleDisconnect = () => {
        if ( element.onDisconnect ) {
            element.onDisconnect();
        }
    };

    const handleRefresh = () => {
        if ( element.onRefresh ) {
            element.onRefresh();
        }
        setSelectedProfile( element.default ? element.default : '' );
    };

    const handleProfileChange = ( profile: string ) => {
        if ( element.onProfileChange ) {
            element.onProfileChange( profile );
        }
    };

    const getProviderIcon = ( provider: string ) => {
        switch ( provider ) {
            case 'Google':
                return <GoogleIcon />;
            default:
                return (
                    <div className="w-7 h-7 bg-gray-300 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-600">
                            { provider?.charAt( 0 ) }
                        </span>
                    </div>
                );
        }
    };

    return (
        <div className={ twMerge( 'w-full ', className ) }>
            <div className="p-5">
                <div className="flex flex-col gap-6">
                    { /* Connection Status Section */ }
                    <div className="flex items-center gap-4">
                        { /* Provider Icon */ }
                        <div className="w-11 h-11 bg-white rounded-[3px] border border-[#e9e9e9] flex items-center justify-center">
                            { getProviderIcon( element.provider || 'Google' ) }
                        </div>

                        { /* Connection Info */ }
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[#575757] text-sm font-medium">
                                    { element.provider || 'Google' }{ ' ' }
                                    { __( 'Authentication', 'dokan-lite' ) }
                                </span>
                                { element.isConnected && (
                                    <div className="w-5 h-5 bg-white rounded-full border-2 border-[#997AF3] flex items-center justify-center">
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 19 19"
                                            fill="none"
                                        >
                                            <path
                                                d="M6.83333 9.33333L8.5 11L11.8333 7.66667"
                                                stroke="#997AF3"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                ) }
                            </div>

                            {
                                <div className="flex items-center gap-2">
                                    <span className="text-[#828282] text-xs">
                                        Successfully connected but you can
                                        disconnect and reconnect anytime if
                                        needed.
                                    </span>
                                    <button
                                        onClick={ handleDisconnect }
                                        className="text-[#7047EB] text-xs underline underline-offset-1 hover:text-[#AB92F6] transition-colors flex items-center gap-1"
                                    >
                                        Disconnect
                                        <svg
                                            width="10"
                                            height="10"
                                            viewBox="0 0 10 10"
                                            fill="none"
                                        >
                                            <path
                                                d="M5.33333 1H8.58333M8.58333 1V4.25M8.58333 1L1 8.58333"
                                                stroke="currentColor"
                                                strokeWidth="1.08333"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            }
                        </div>
                    </div>

                    { /* Profile Selection Section */ }
                    <div className="flex justify-between gap-4 w-full">
                        <div className="flex items-center gap-2">
                            <span className="text-[#25252D] text-sm font-medium">
                                Analytics Profile
                            </span>
                            <div className="w-6 h-6 text-[#828282]">
                                <DokanTooltip message="Select the profile to use for analytics." />
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            { /* Profile Dropdown */ }
                            <DokanSelect
                                options={
                                    element.options?.map( ( option ) => ( {
                                        label: option.title,
                                        value: option.value,
                                    } ) ) || []
                                }
                                onChange={ ( value ) => {
                                    setSelectedProfile( value as string );
                                    handleProfileChange( value as string );
                                } }
                                value={ selectedProfile }
                                containerClassName={ 'w-72' }
                            />

                            { /* Refresh Button */ }
                            <button
                                onClick={ handleRefresh }
                                // disabled={ ! element.isConnected }
                                className="px-6 py-2.5 bg-white border border-[#e9e9e9] rounded-[5px] text-[#393939] text-sm font-medium flex items-center gap-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshIcon />
                                { __( 'Refresh', 'dokan-lite' ) }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DokanApiConnectionField;
