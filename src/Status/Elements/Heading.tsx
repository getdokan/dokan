import { StatusElement } from '../Status';
import SettingsParser from '../SettingsParser';
import { RawHTML } from '@wordpress/element';

const Heading = ( { element }: { element: StatusElement } ) => {
    return (
        <div
            className="md:flex md:items-center md:justify-between"
            data-hook={ element.hook_key }
        >
            <div className="min-w-0 flex-1">
                <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                    <RawHTML>{ element.title }</RawHTML>
                </h2>
            </div>
            <div className="mt-4 flex md:ml-4 md:mt-0">
                { element.children.map( ( child ) => {
                    return (
                        <SettingsParser
                            element={ child }
                            key={
                                element.hook_key + '-' + child.id + '-parser'
                            }
                        />
                    );
                } ) }
            </div>
        </div>
    );
};
export default Heading;
