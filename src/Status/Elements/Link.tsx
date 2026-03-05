import { StatusElement } from '../Status';
import SettingsParser from '../SettingsParser';
import { RawHTML } from '@wordpress/element';

const Link = ( { element }: { element: StatusElement } ) => {
    return (
        <a
            data-hook={ element.hook_key }
            href={ element?.url }
            title={ element?.title_text }
            className="!text-xs leading-4 font-medium underline !text-[#7047EB]"
        >
            <RawHTML>{ element.title }</RawHTML>
        </a>
    );
};
export default Link;
