import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { Button, SimpleInput } from '@getdokan/dokan-ui';
import Logo from '@dokan/admin/onboard/Logo';
import WarningIcon from '@dokan/admin/onboard/icons/WarningIcon';

interface BasicInfoScreenProps {
    onNext: () => void;
    storeUrl: string;
    shareDiagnostics: boolean;
    onUpdate: ( storeUrl: string, shareDiagnostics: boolean ) => void;
}

const BasicInfoScreen = ( {
    onNext,
    storeUrl,
    shareDiagnostics,
    onUpdate,
}: BasicInfoScreenProps ) => {
    const [ localStoreUrl, setLocalStoreUrl ] = useState( storeUrl || 'store' );
    const [ localShareDiagnostics, setLocalShareDiagnostics ] = useState(
        shareDiagnostics !== undefined ? shareDiagnostics : true
    );

    // Update the parent component when values change
    useEffect( () => {
        onUpdate( localStoreUrl, localShareDiagnostics );
    }, [ localStoreUrl, localShareDiagnostics ] );

    const handleNext = () => {
        // Ensure values are updated before proceeding
        onUpdate( localStoreUrl, localShareDiagnostics );
        onNext();
    };

    return (
        <div className={ `min-h-screen flex items-center justify-center` }>
            <div className="p-8 md:p-10  md:w-[70%]">
                <div className="mb-8">
                    <Logo />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-10">
                    { __( 'Basic Information', 'dokan' ) }
                </h1>

                <div className="space-y-8 md:w-[39rem] w-full">
                    <div>
                        <label className="block text-sm font-medium mb-4">
                            { __(
                                'Choose how vendor store URLs will appear',
                                'dokan'
                            ) }
                        </label>
                        <SimpleInput
                            value={ localStoreUrl }
                            addOnLeft={
                                <span className="inline-flex items-center bg-gray-50 px-3 text-gray-900 sm:text-sm rouned-bl absolute left-0 top-0 h-full rounded-bl rounded-tl w-max">
                                    https://dokan-dev.test/
                                </span>
                            }
                            addOnRight={
                                <span className="inline-flex items-center bg-gray-50 px-3 text-gray-900 sm:text-sm rouned-bl absolute right-0 top-0 h-full rounded-bl rounded-tl w-max">
                                    vendor-name
                                </span>
                            }
                            input={ {
                                id: 'login-storename',
                                name: 'storename',
                                type: 'text',
                                autoComplete: 'off',
                                placeholder: 'store',
                            } }
                            onChange={ ( e ) =>
                                setLocalStoreUrl( e.target.value )
                            }
                            className="w-[80%] md:w-full pl-[12rem] block"
                        />
                        <div className="flex items-center gap-2 mt-6 text-sm text-gray-500">
                            <WarningIcon />
                            <span>
                                Vendor Store URL will be (
                                <span className="text-indigo-600">
                                    https://dokan-dev.test/
                                    { localStoreUrl }/vendor-name
                                </span>
                                )
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 space-y-8">
                        <div className="flex-shrink-0 mb-2">
                            <input
                                type="checkbox"
                                checked={ localShareDiagnostics }
                                aria-describedby="comments-description"
                                className="rounded p-2 w-5 h-5 bg-[#7047EB] text-white cursor-pointer text-sm"
                                onChange={ () =>
                                    setLocalShareDiagnostics(
                                        ! localShareDiagnostics
                                    )
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm font-medium">
                                { __(
                                    'Help Us Tailor Your Marketplace',
                                    'dokan'
                                ) }
                            </h3>
                            <p className="text-sm text-gray-500 lg:max-w-[400px]">
                                { __(
                                    'Allow Dokan Multivendor Marketplace to collect non-sensitive diagnostic data and usage information.',
                                    'dokan'
                                ) }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-12">
                    <Button
                        onClick={ handleNext }
                        className="bg-[#7047EB] text-white py-3 px-8 flex items-center rounded-md"
                    >
                        { __( 'Next', 'dokan' ) }
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 ml-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BasicInfoScreen;
