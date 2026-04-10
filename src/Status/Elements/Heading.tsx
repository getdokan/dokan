import { StatusElement } from '../Status';
import SettingsParser from '../SettingsParser';
import { RawHTML } from '@wordpress/element';

const Heading = ( { element }: { element: StatusElement } ) => {
    return (
        <div
            className="mb-8 ml-5" // Added bottom margin for spacing
            data-hook={ element.hook_key }
        >
            <div className="md:flex md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 
                        className="
                            text-2xl
                            font-bold
                            text-[#25252D]
                            leading-[130%]
                            sm:truncate sm:tracking-tight
                        "
                    >
                        <RawHTML>{ element.title }</RawHTML>
                    </h2>
                    { element.description && (
                        <p
                            className="
                                mt-2
                                text-sm
                                font-normal
                                text-[#25252D]
                                leading-[140%]
                                max-w-[580px]
                            "
                        >
                            <RawHTML>{ element.description }</RawHTML>
                        </p>
                    ) }
                </div>
                
                {/* Child elements (buttons/links) on the right */}
                <div className="mt-4 flex md:ml-4 md:mt-0 md:shrink-0">
                    { ( element?.children || [] ).map( ( child ) => {
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
        </div>
    );
};
export default Heading;
