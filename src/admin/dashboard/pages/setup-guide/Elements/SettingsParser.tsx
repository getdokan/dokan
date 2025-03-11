import { SettingsElement } from '../StepSettings';
import Section from './Section';
import SubSection from './SubSection';
import FieldParser from './Fields/FieldParser';
import FieldGroup from './FiendGroup';

const SettingsParser = ( { element }: { element: SettingsElement } ) => {
    switch ( element.type ) {
        case 'section':
            return <Section key={ element.hook_key } element={ element } />;
        case 'subsection':
            return <SubSection key={ element.hook_key } element={ element } />;
        case 'field':
            return (
                <FieldParser
                    key={ element.hook_key + '-parser' }
                    element={ element }
                />
            );
        case 'fieldgroup':
            return <FieldGroup key={ element.hook_key } element={ element } />;
        default:
            return <></>;
    }
};

export default SettingsParser;
