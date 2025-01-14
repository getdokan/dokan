import { StatusElement } from '../Status';
import SettingsParser from '../SettingsParser';

const Link = ( { element }: { element: StatusElement } ) => {
    return (
        <a
            href={ element?.url }
            title={ element?.title_text }
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
        >
            { element.title }
        </a>
    );
};
export default Link;
