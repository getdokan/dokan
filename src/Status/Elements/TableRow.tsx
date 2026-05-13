import { StatusElement } from '../Status';
import SettingsParser from '../SettingsParser';

const TableRow = ( { element }: { element: StatusElement } ) => {
    return (
        <tr 
            className="border-t border-[#E9E9E9] first:border-t-0 transition-colors bg-white"
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
