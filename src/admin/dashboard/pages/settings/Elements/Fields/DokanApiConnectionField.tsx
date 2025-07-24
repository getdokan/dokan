import { SettingsElement } from '../../types';
import { twMerge } from 'tailwind-merge';
import { DokanSelect } from '../../../../../../components/fields';
import DokanTooltip from '../../../../../../components/fields/DokanTooltip';
import { __ } from '@wordpress/i18n';
import RefreshIcon from '../../../../../../components/Icons/RefreshIcon';
import { useState } from '@wordpress/element';

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
                return (
                    <svg
                        width="28"
                        height="28"
                        viewBox="0 0 28 28"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g clipPath="url(#clip0_2360_21105)">
                            <path
                                d="M27.4611 14.1542C27.4611 13.0156 27.3687 12.1848 27.1688 11.3232H14.168V16.462H21.7991C21.6454 17.739 20.8145 19.6622 18.9682 20.9545L18.9423 21.1266L23.053 24.311L23.3378 24.3394C25.9533 21.9239 27.4611 18.3698 27.4611 14.1542Z"
                                fill="#4285F4"
                            />
                            <path
                                d="M14.1649 27.6943C17.9036 27.6943 21.0422 26.4634 23.3347 24.3403L18.9652 20.9554C17.7959 21.7708 16.2266 22.3401 14.1649 22.3401C10.5032 22.3401 7.39535 19.9246 6.28748 16.5859L6.12509 16.5997L1.85082 19.9076L1.79492 20.063C4.07196 24.5863 8.74918 27.6943 14.1649 27.6943Z"
                                fill="#34A853"
                            />
                            <path
                                d="M6.28971 16.5854C5.99739 15.7238 5.82822 14.8006 5.82822 13.8468C5.82822 12.8928 5.99739 11.9697 6.27433 11.1081L6.26659 10.9246L1.93875 7.5636L1.79715 7.63095C0.858673 9.50802 0.320172 11.6159 0.320172 13.8468C0.320172 16.0777 0.858673 18.1854 1.79715 20.0625L6.28971 16.5854Z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M14.1649 5.35414C16.7651 5.35414 18.519 6.47728 19.5191 7.41586L23.427 3.60022C21.0269 1.36932 17.9036 0 14.1649 0C8.74918 0 4.07196 3.10786 1.79492 7.63118L6.2721 11.1084C7.39535 7.7697 10.5032 5.35414 14.1649 5.35414Z"
                                fill="#EB4335"
                            />
                        </g>
                        <defs>
                            <clipPath id="clip0_2360_21105">
                                <rect
                                    width="27.7895"
                                    height="27.7895"
                                    fill="white"
                                />
                            </clipPath>
                        </defs>
                    </svg>
                );
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
                                    Authentication
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
