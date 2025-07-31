import { SettingsProps } from '../StepSettings';
import SettingsParser from './SettingsParser';
import { RawHTML } from '@wordpress/element';
import {applyFilters} from "@wordpress/hooks";

const SubSection = ( {
    element,
    getSetting,
    onValueChange,
}: SettingsProps ): JSX.Element => {
    if ( ! element.display ) {
        return <></>;
    }

    const isAllChildrenFields = applyFilters(
        'dokan_admin_settings_subsection_all_children_fields',
        element?.children?.every( ( child ) => {
            return child.type === 'field';
        } )
    );

    return (
        <div className="col-span-4">
            { ( element.title || element.description ) && (
                <div className={ `mb-6` }>
                    <h2
                        id={ element.hook_key }
                        className="text-base leading-6 font-semibold text-gray-900"
                    >
                        <RawHTML>{ element.title }</RawHTML>
                    </h2>
                    <p className="mt-1.5 text-sm text-[#828282]">
                        <RawHTML>{ element.description }</RawHTML>
                    </p>
                </div>
            ) }

            <div
                className={ `flex flex-col ${
                    isAllChildrenFields
                        ? 'divide-y border border-[#E9E9E9] mb-8 divide-gray-200'
                        : ''
                }` }
            >
                { element.children.map( ( child ) => {
                    return (
                        <SettingsParser
                            element={ child }
                            key={
                                element.hook_key + '-' + child.id + '-parser'
                            }
                            onValueChange={ onValueChange }
                            getSetting={ getSetting }
                        />
                    );
                } ) }
            </div>
        </div>
    );
};

export default SubSection;
