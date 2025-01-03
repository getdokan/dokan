import { StatusElement } from '../Status';
import SettingsParser from '../SettingsParser';

const TableColumn = ( { element }: { element: StatusElement } ) => {
    return (
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
            { element.children.map( ( child ) => {
                return (
                    <SettingsParser
                        element={ child }
                        key={ element.hook_key + '-' + child.id + '-parser' }
                    />
                );
            } ) }
        </td>
    );
};
export default TableColumn;
