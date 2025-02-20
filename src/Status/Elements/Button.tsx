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
        <button
            data-hook={ element.hook_key }
            onClick={ onClick }
            disabled={ isClicked }
            type="button"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
            <RawHTML>{ element.title }</RawHTML>
        </button>
    );
};
export default Button;
