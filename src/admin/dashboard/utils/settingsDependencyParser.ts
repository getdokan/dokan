import {
    SettingsElement,
    SettingsElementDependency,
} from '../pages/setup-guide/StepSettings';

const settingsDependencyArrayParser = ( settings: SettingsElement[] ) => {
    const dependencies: SettingsElementDependency[] = [];

    settings.forEach( ( element ) => {
        dependencies.push( ...element.dependencies );
        if ( element.children && element.children.length > 0 ) {
            dependencies.push(
                ...settingsDependencyArrayParser( [ ...element.children ] )
            );
        }
    } );

    return dependencies;
};

const settingsDependencyValueParser = (
    settings: SettingsElement[],
    dependencies: SettingsElementDependency[]
) => {
    let dependenciesWithValue = [ ...dependencies ];
    settings.forEach( ( element ) => {
        dependenciesWithValue.map( ( depWithValue ) => {
            if (
                ( depWithValue.key === element.dependency_key &&
                    depWithValue.to_self ) ||
                ( depWithValue.self === element.dependency_key &&
                    ! depWithValue.to_self )
            ) {
                depWithValue.currentValue = element.value;
            }
            return { ...depWithValue };
        } );

        if ( element.children && element.children.length > 0 ) {
            dependenciesWithValue = [
                ...settingsDependencyValueParser(
                    [ ...element.children ],
                    [ ...dependenciesWithValue ]
                ),
            ];
        }
    } );

    return [ ...dependenciesWithValue ];
};

const settingsDependencyParser = ( settings: SettingsElement[] ) => {
    const dependencyArray = [
        ...settingsDependencyArrayParser( [ ...settings ] ),
    ];
    return [
        ...settingsDependencyValueParser(
            [ ...settings ],
            [ ...dependencyArray ]
        ),
    ];
};

export default settingsDependencyParser;
