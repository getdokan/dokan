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
        <div className="flex flex-col  w-full">
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
                            isSingleLineRow={
                                element?.content_class ===
                                'dokan-single-line-row'
                            }
                        />
                    );
                } ) }
            </div>
        </div>
    );
};

export default FieldGroup;
