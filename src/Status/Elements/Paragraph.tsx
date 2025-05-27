import { StatusElement } from '../Status';
import { RawHTML } from '@wordpress/element';

const Paragraph = ( { element }: { element: StatusElement } ) => {
    return (
        <p
            className="max-w-2xl text-sm text-gray-600"
            data-hook={ element.hook_key }
        >
            <RawHTML>{ element.title }</RawHTML>
        </p>
    );
};
export default Paragraph;
