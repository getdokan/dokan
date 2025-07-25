import { SettingsProps } from '../types';
import FieldParser from './Fields/FieldParser';

const FieldGroup = ( {
    element,
    getSetting,
    onValueChange,
}: SettingsProps ): JSX.Element => {
    if ( ! element.display ) {
        return <></>;
    }

    return (
        <div className="flex flex-col gap-4 w-full">
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

            <div className="w-full ">
                { element.children.map( ( child ) => {
                    return (
                        <FieldParser
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
