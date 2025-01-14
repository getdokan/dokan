import { StatusElement } from '../Status';
import SettingsParser from '../SettingsParser';

const TableRow = ( { element }: { element: StatusElement } ) => {
    return (
        <tr>
            { element.children.map( ( child ) => {
                return (
                    <SettingsParser
                        element={ child }
                        key={ element.hook_key + '-' + child.id + '-parser' }
                    />
                );
            } ) }
        </tr>
    );
};
export default TableRow;
