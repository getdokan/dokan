import { StatusElement } from '../Status';
import SettingsParser from '../SettingsParser';

const Section = ( { element }: { element: StatusElement } ) => {
    return (
        <div className="overflow-hidden rounded-lg bg-white shadow mb-8">
            <div className="px-5 py-5 border-b border-[#E9E9E9] bg-[#FDFDFD]">
                <h3 className="text-lg font-medium leading-3 text-gray-900">
                    { element.title }
                </h3>
                { element.description && (
                    <p className="mt-2 !text-xs text-gray-500">
                        { element.description }
                    </p>
                ) }
            </div>
            <div className="bg-white py-5 px-5 flex flex-col gap-4 sm:p-6 ">
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
    );
};
export default Section;
