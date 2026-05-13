import { StatusElement } from '../Status';
import SettingsParser from '../SettingsParser';

const SubSection = ( { element }: { element: StatusElement } ) => {
    return (
        <>
            <div className="dokan-subsection-head">
                <h4 className="text-sm font-semibold leading-[18.2px] text-[#25252D]">
                    { element.title }
                </h4>
                { element.description && (
                    <p className="mt-4 max-w-[465px] text-xs text-[#828282] leading-[140%] ">
                        { element.description }
                    </p>
                ) }
            </div>
            <div className="bg-white flex flex-col gap-4">
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
        </>
    );
};
export default SubSection;
