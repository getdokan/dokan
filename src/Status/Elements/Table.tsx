import { StatusElement } from '../Status';
import SettingsParser from '../SettingsParser';

const Table = ( { element }: { element: StatusElement } ) => {
    return (
        <div
            className="overflow-hidden rounded-md border border-[#E9E9E9] bg-white"
            data-hook={ element.hook_key }
        >
            <table className="dokan-status-table min-w-full">
                { element.headers.length > 0 && (
                    <thead className="bg-[#FDFDFD] border-b border-[#E9E9E9]">
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
                                        className="!px-5 !py-[17px] text-left uppercase text-xs font-normal text-[#828282] leading-[140%]"
                                    >
                                        { header }
                                    </th>
                                );
                            } ) }
                        </tr>
                    </thead>
                ) }
                <tbody className="bg-white">
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
