import { StatusElement } from '../Status';
import SettingsParser from '../SettingsParser';

const TableRow = ( { element }: { element: StatusElement } ) => {
    return (
        <tr 
            // CHANGED: Lighter border. REMOVED px/py padding here (it belongs on the td)
            className="border-b border-[#E9E9E9] last:border-0 transition-colors"
            data-hook={ element.hook_key }
        >
            { ( element?.children || [] ).map( ( child ) => {
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