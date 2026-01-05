import type { SettingsElement, SettingsElementDependency } from '../types';

/**
 * Evaluate a comparison expression.
 *
 * @param value1   - First value.
 * @param value2   - Second value.
 * @param operator - Comparison operator.
 * @returns Boolean result of comparison.
 */
function evaluateExpression( value1: unknown, value2: unknown, operator: string ): boolean {
    switch ( operator ) {
        case '=':
        case '==':
            // eslint-disable-next-line eqeqeq
            return value1 == value2;
        case '===':
            return value1 === value2;
        case '>':
            return Number( value1 ) > Number( value2 );
        case '>=':
            return Number( value1 ) >= Number( value2 );
        case '<':
            return Number( value1 ) < Number( value2 );
        case '<=':
            return Number( value1 ) <= Number( value2 );
        case '!=':
            // eslint-disable-next-line eqeqeq
            return value1 != value2;
        case '!==':
            return value1 !== value2;
        default:
            return value1 === value2;
    }
}

/**
 * Apply an effect to an element based on a dependency.
 *
 * @param element - Settings element.
 * @param effect  - Dependency effect to apply.
 * @returns Modified element.
 */
function applyEffectToElement(
    element: SettingsElement,
    effect: SettingsElementDependency
): SettingsElement {
    if ( evaluateExpression( effect.currentValue, effect.value, effect.comparison || '=' ) ) {
        if ( 'display' === effect.attribute ) {
            element.display = effect.effect !== 'hide';
        } else if ( 'value' === effect.attribute ) {
            if ( effect.effect ) {
                element.value = effect.effect;
            } else {
                element.value = effect.value as SettingsElement['value'];
            }
        } else if ( 'disabled' === effect.attribute ) {
            element.disabled = effect.effect === 'yes';
        } else if ( 'readonly' === effect.attribute ) {
            element.readonly = effect.effect === 'yes';
        } else if ( 'placeholder' === effect.attribute ) {
            element.placeholder = effect.value as string | number;
        }
    }

    return { ...element };
}

/**
 * Apply dependencies to settings elements.
 *
 * @param settings     - Array of settings elements.
 * @param dependencies - Array of dependencies to apply.
 * @returns Modified settings array.
 */
function applyDependencies(
    settings: SettingsElement[],
    dependencies: SettingsElementDependency[]
): SettingsElement[] {
    return settings.map( ( element ) => {
        const elementDependencies = dependencies.filter(
            ( dependency ) =>
                dependency.key === element.dependency_key ||
                dependency.self === element.dependency_key
        );

        let modifiedElement = { ...element };

        elementDependencies.forEach( ( dep ) => {
            if ( dep.to_self && dep.self === element.dependency_key ) {
                modifiedElement = applyEffectToElement( modifiedElement, dep );
            } else if ( ! dep.to_self && dep.key === element.dependency_key ) {
                modifiedElement = applyEffectToElement( modifiedElement, dep );
            }
        } );

        if ( modifiedElement.children && modifiedElement.children.length > 0 ) {
            modifiedElement.children = applyDependencies(
                [ ...modifiedElement.children ],
                dependencies
            );
        }

        return modifiedElement;
    } );
}

export default applyDependencies;

