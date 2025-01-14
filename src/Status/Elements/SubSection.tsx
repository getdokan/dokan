import { StatusElement } from '../Status';
import SettingsParser from '../SettingsParser';

const SubSection = ( { element }: { element: StatusElement } ) => {
    return (
        <>
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-3 text-gray-900">
                    { element.title }
                </h3>
                { element.description && (
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        { element.description }
                    </p>
                ) }
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:p-6">
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
        </>
    );
};
export default SubSection;
