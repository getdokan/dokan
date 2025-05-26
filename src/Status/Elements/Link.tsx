import { StatusElement } from '../Status';
import SettingsParser from '../SettingsParser';
import { RawHTML } from '@wordpress/element';

const Link = ( { element }: { element: StatusElement } ) => {
    return (
        <a
            data-hook={ element.hook_key }
            href={ element?.url }
            title={ element?.title_text }
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
            <RawHTML>{ element.title }</RawHTML>
        </a>
    );
};
export default Link;
