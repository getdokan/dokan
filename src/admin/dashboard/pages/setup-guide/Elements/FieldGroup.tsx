import { SettingsProps } from '../StepSettings';
import SettingsParser from './SettingsParser';

const FieldGroup = ( {
    element,
    getSetting,
    onValueChange,
}: SettingsProps ): JSX.Element => {
    if ( ! element.display ) {
        return <></>;
    }

    return (
        <div className="col-span-4">
            <div>
                <p
                    id={ element.hook_key }
                    className="block text-sm font-medium text-gray-700"
                >
                    { element.title }
                </p>
                <p className="mt-1 text-sm text-gray-500">
                    { element.description }
                </p>
            </div>

            <div className="mt-1 grid grid-cols-8 gap-6">
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

export default FieldGroup;
