import {
    SettingsElement,
    SettingsElementDependency,
} from '../pages/setup-guide/StepSettings';

const expressionEvaluator = (
    value1: any,
    value2: any,
    operator: string
): boolean => {
    switch ( operator ) {
        case '=':
        case '==':
            // eslint-disable-next-line eqeqeq
            return value1 == value2;
        case '===':
            return value1 === value2;
        case '>':
            return value1 > value2;
        case '>=':
            return value1 >= value2;
        case '<':
            return value1 < value2;
        case '<=':
            return value1 <= value2;
        case '!=':
            // eslint-disable-next-line eqeqeq
            return value1 != value2;
        case '!==':
            return value1 !== value2;
        default:
            return value1 === value2;
    }
};

const applyEffectToElement = (
    element: SettingsElement,
    effect: SettingsElementDependency
) => {
    if (
        expressionEvaluator(
            effect.currentValue,
            effect.value,
            effect.comparison
        )
    ) {
        // TODO: add other attribute support.
        if ( 'display' === effect.attribute ) {
            element.display = effect.effect !== 'hide';
        } else if ( 'value' === effect.attribute ) {
            element.value = effect.value;
        } else if ( 'disabled' === effect.attribute ) {
            element.disabled = effect.effect === 'yes';
        } else if ( 'readonly' === effect.attribute ) {
            element.readonly = effect.effect === 'yes';
        } else if ( 'placeholder' === effect.attribute ) {
            element.placeholder = effect.value; // TODO: placeholder attribute value needed.
        }
    }

    return { ...element };
};

const settingsDependencyApplicator = (
    settings: SettingsElement[],
    dependencies: SettingsElementDependency[]
) => {
    return [
        ...settings.map( ( element ) => {
            const elementDependencies = dependencies.filter(
                ( dependency ) =>
                    dependency.key === element.dependency_key ||
                    dependency.self === element.dependency_key
            );

            elementDependencies.forEach( ( elDep ) => {
                if ( elDep.to_self && elDep.self === element.dependency_key ) {
                    element = {
                        ...applyEffectToElement( { ...element }, elDep ),
                    };
                } else if (
                    ! elDep.to_self &&
                    elDep.key === element.dependency_key
                ) {
                    element = {
                        ...applyEffectToElement( { ...element }, elDep ),
                    };
                }
            } );

            if ( element.children && element.children.length > 0 ) {
                element.children = [
                    ...settingsDependencyApplicator(
                        [ ...element.children ],
                        [ ...dependencies ]
                    ),
                ];
            }

            return { ...element };
        } ),
    ];
};

export default settingsDependencyApplicator;
