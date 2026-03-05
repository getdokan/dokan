import { StatusElement } from '../Status';
import { RawHTML } from '@wordpress/element';

const Paragraph = ( { element }: { element: StatusElement } ) => {
    return (
        <p
            className="text-xs text-gray-500 max-w-[465px]"
            data-hook={ element.hook_key }
        >
            <RawHTML>{ element.title }</RawHTML>
        </p>
    );
};
export default Paragraph;
