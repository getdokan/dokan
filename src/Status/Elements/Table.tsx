import { StatusElement } from '../Status';
import SettingsParser from '../SettingsParser';

const Table = ( { element }: { element: StatusElement } ) => {
    return (
        <div
            className="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg"
            data-hook={ element.hook_key }
        >
            <table className="min-w-full divide-y divide-gray-300">
                { element.headers.length > 0 && (
                    <thead className="bg-gray-50">
                        <tr>
                            { element.headers.map( ( header: string ) => {
                                return (
                                    <th
                                        key={
                                            element.hook_key +
                                            '_table_head_' +
                                            header
                                        }
                                        scope="col"
                                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                                    >
                                        { header }
                                    </th>
                                );
                            } ) }
                        </tr>
                    </thead>
                ) }
                <tbody className="divide-y divide-gray-200 bg-white">
                    { ( element?.children || [] ).map( ( child ) => {
                        return (
                            <SettingsParser
                                element={ child }
                                key={
                                    element.hook_key +
                                    '-' +
                                    child.id +
                                    '-parser'
                                }
                            />
                        );
                    } ) }
                </tbody>
            </table>
        </div>
    );
};
export default Table;
