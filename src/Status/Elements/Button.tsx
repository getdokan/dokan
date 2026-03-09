import { StatusElement } from '../Status';
import { RawHTML, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

const Button = ( { element }: { element: StatusElement } ) => {
    const [ isClicked, setIsClicked ] = useState( false );
    const onClick = () => {
        setIsClicked( true );

        const path =
            'GET' === element.request
                ? addQueryArgs( element.endpoint, element.payload )
                : element.endpoint;

        const args = {
            path: element.endpoint,
            method: element.request,
            data: 'GET' !== element.request ? element.payload : {},
        };

        apiFetch( args ).then( ( response ) => {
            setIsClicked( false );
        } );
    };
    return (
        <div className="status-button-wrapper">
            <button
                data-hook={ element.hook_key }
                onClick={ onClick }
                disabled={ isClicked }
                type="button"
                className="inline-flex items-center
                            gap-1.5
                            rounded-[5px]
                            bg-[#7047EB]
                            px-4 py-1.5
                            text-sm
                            font-medium
                            leading-5
                            text-white
                            hover:bg-[#633dd4]
                            focus-visible:outline-none"
            >
                <RawHTML>{ element.title }</RawHTML>
            </button>
        </div>
    );
};
export default Button;
