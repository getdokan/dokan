import {
    SettingsElement,
    SettingsElementValidation,
} from '../../../stores/adminSettings/types';

const settingsValidationArrayParser = ( settings: SettingsElement[] ) => {
    const validations: SettingsElementValidation[] = [];

    settings.forEach( ( element ) => {
        if ( element.validations ) {
            validations.push( ...element.validations );
        }
        if ( element.children && element.children.length > 0 ) {
            validations.push(
                ...settingsValidationArrayParser( [ ...element.children ] )
            );
        }
    } );

    return validations;
};

const settingsValidationValueParser = (
    settings: SettingsElement[],
    validations: SettingsElementValidation[]
) => {
    let validationsWithValue = [ ...validations ];
    settings.forEach( ( element ) => {
        validationsWithValue = validationsWithValue.map( ( valWithValue ) => {
            if ( valWithValue.self === element.dependency_key ) {
                return { ...valWithValue, currentValue: element.value };
            }
            return valWithValue;
        } );

        if ( element.children && element.children.length > 0 ) {
            validationsWithValue = [
                ...settingsValidationValueParser(
                    [ ...element.children ],
                    [ ...validationsWithValue ]
                ),
            ];
        }
    } );

    return [ ...validationsWithValue ];
};

const settingsValidationParser = ( settings: SettingsElement[] ) => {
    const validationArray = [
        ...settingsValidationArrayParser( [ ...settings ] ),
    ];
    return [
        ...settingsValidationValueParser(
            [ ...settings ],
            [ ...validationArray ]
        ),
    ];
};

export default settingsValidationParser;
