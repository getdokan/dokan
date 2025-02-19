import { twMerge } from 'tailwind-merge';
import { __ } from '@wordpress/i18n';
import { ToggleSwitch } from '@getdokan/dokan-ui';
import { DokanModule } from './index';
import { useEffect, useState } from '@wordpress/element';
import VideoPopup from './VideoPopup';

const Card = ( {
    module,
    onChange,
    colors,
    onTagClick,
}: {
    module: DokanModule;
    onChange: ( value: boolean ) => void;
    colors: Record< string, string >;
    onTagClick: ( tag: string ) => void;
} ) => {
    const [ toggle, setToggle ] = useState( false );

    const toggleHandler = ( doToggle: boolean ) => {
        setToggle( doToggle );
        onChange( doToggle );
    };

    useEffect( () => {
        if ( ! toggle ) {
            return;
        }

        const timeoutId = setTimeout( () => {
            setToggle( false );
        }, 1000 );

        return () => clearTimeout( timeoutId );
    }, [ toggle ] );

    return (
        <div className="module-card border border-gray-300 rounded-md p-4 bg-white flex flex-col justify-between">
            <div>
                <img
                    src={ module.image }
                    alt={ module.title }
                    className="module-image w-24 object-cover rounded-sm mb-2 aspect-3/2"
                />

                <h3 className="mt-0 mb-0 text-lg font-bold">
                    { module.title }
                </h3>
                <p className="text-sm text-gray-500 mt-2 mb-4">
                    { module.description }
                </p>
                <div className="module-tags flex gap-2 mb-3">
                    { module.tags.map( ( tag, tagIndex ) => (
                        <button
                            key={ tagIndex }
                            className={ twMerge(
                                'module-tag px-2.5 py-1 rounded-full text-xs cursor-pointer',
                                `bg-${ colors[ tag ] }-50 text-${ colors[ tag ] }-800`
                            ) }
                            onClick={ () => onTagClick( tag ) }
                        >
                            { tag }
                        </button>
                    ) ) }
                </div>
            </div>
            <div className="flex gap-4 items-center mt-7">
                { module.actions &&
                    Object.entries( module.actions ).map(
                        ( [ action, value ], actionIndex ) => {
                            if ( ! value || '' === value ) {
                                return null;
                            }

                            if ( 'video' === action ) {
                                return (
                                    <VideoPopup
                                        key={ actionIndex }
                                        videoId={ value }
                                        module={ module }
                                    />
                                );
                            }

                            return (
                                <a
                                    key={ actionIndex }
                                    href={ value }
                                    target="_blank"
                                    className="text-[#788383] text-sm no-underline flex items-center gap-2 vertical-align-middle"
                                    rel="noreferrer"
                                >
                                    <svg
                                        width="13"
                                        height="17"
                                        viewBox="0 0 13 17"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M8.08252 0.959106V4.70425H11.8277L8.08252 0.959106Z"
                                            fill="#B1B1B1"
                                        ></path>
                                        <path
                                            d="M7.57717 5.71442C7.2983 5.71442 7.07201 5.48814 7.07201 5.20927V0.662964H0.505155C0.226285 0.662964 0 0.889249 0 1.16812V15.6489C0 15.9278 0.226285 16.1541 0.505155 16.1541H11.6183C11.8972 16.1541 12.1235 15.9278 12.1235 15.6489V5.71442H7.57717ZM6.56689 13.1232H2.52571C2.24684 13.1232 2.02056 12.8969 2.02056 12.618C2.02056 12.3392 2.24684 12.1129 2.52571 12.1129H6.56686C6.84573 12.1129 7.07201 12.3392 7.07201 12.618C7.07201 12.8969 6.84576 13.1232 6.56689 13.1232ZM9.59776 11.1026H2.52571C2.24684 11.1026 2.02056 10.8763 2.02056 10.5974C2.02056 10.3186 2.24684 10.0923 2.52571 10.0923H9.59776C9.87663 10.0923 10.1029 10.3186 10.1029 10.5974C10.1029 10.8763 9.87663 11.1026 9.59776 11.1026ZM9.59776 9.08204H2.52571C2.24684 9.08204 2.02056 8.85575 2.02056 8.57688C2.02056 8.29801 2.24684 8.07173 2.52571 8.07173H9.59776C9.87663 8.07173 10.1029 8.29801 10.1029 8.57688C10.1029 8.85575 9.87663 9.08204 9.59776 9.08204Z"
                                            fill="#B1B1B1"
                                        ></path>
                                    </svg>
                                    { __( 'Docs', 'dokan-lite' ) }
                                </a>
                            );
                        }
                    ) }
                <div className="toggle-container ml-auto">
                    <ToggleSwitch
                        color="purple"
                        checked={ toggle }
                        onChange={ () => toggleHandler( true ) }
                    />
                </div>
            </div>
        </div>
    );
};

export default Card;
