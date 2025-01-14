import { StatusElement } from '../Status';
import SettingsParser from '../SettingsParser';

const Paragraph = ( { element }: { element: StatusElement } ) => {
    return <p className="max-w-2xl text-sm text-gray-600">{ element.title }</p>;
};
export default Paragraph;
