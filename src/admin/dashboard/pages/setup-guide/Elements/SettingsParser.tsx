import { SettingsProps } from '../StepSettings';
import Section from './Section';
import SubSection from './SubSection';
import FieldParser from './Fields/FieldParser';
import FieldGroup from './FiendGroup';

const SettingsParser = ( { element, onValueChange }: SettingsProps ) => {
    switch ( element.type ) {
        case 'section':
            return (
                <Section
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );
        case 'subsection':
            return (
                <SubSection
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );
        case 'field':
            return (
                <FieldParser
                    key={ element.hook_key + '-parser' }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );
        case 'fieldgroup':
            return (
                <FieldGroup
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                />
            );
        default:
            return <></>;
    }
};

export default SettingsParser;
