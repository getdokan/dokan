import { SettingsProps } from '../StepSettings';
import SettingsParser from './SettingsParser';
import { RawHTML } from '@wordpress/element';

const SubSection = ( {
    element,
    onValueChange,
}: SettingsProps ): JSX.Element => {
    if ( ! element.display ) {
        return <></>;
    }
    return (
        <div className="col-span-4">
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

            <div className="mb-7 grid grid-cols-4 gap-6">
                { element.children.map( ( child ) => {
                    return (
                        <SettingsParser
                            element={ child }
                            key={
                                element.hook_key + '-' + child.id + '-parser'
                            }
                            onValueChange={ onValueChange }
                        />
                    );
                } ) }
            </div>
        </div>
    );
};

export default SubSection;
