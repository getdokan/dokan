import { StatusElement } from '../Status';
import SettingsParser from '../SettingsParser';
import { RawHTML } from '@wordpress/element';

const TableColumn = ( { element }: { element: StatusElement } ) => {
    return (
        <td
            className="!px-6 !py-8 text-sm text-[#25252D] whitespace-nowrap"
            data-hook={ element.hook_key }
        >
            { element?.title && (
                <span 
                    className="text-xs text-[#25252D]"
                >
                    <RawHTML>{ element.title }</RawHTML>
                </span>
            ) }
            <span 
                className="text-xs text-[#25252D] font-normal leading-[140%]"
            >
                { ( element.children || [] ).map( ( child ) => (
                    <SettingsParser
                        element={ child }
                        key={ element.hook_key + '-' + child.id + '-parser' }
                    />
                ) ) }
            </span>
        </td>
    );
};
export default TableColumn;
