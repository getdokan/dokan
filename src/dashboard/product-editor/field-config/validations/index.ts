import { __ } from '@wordpress/i18n';
import { FieldValidator, FormItem, ValidationRule, DependencyCondition } from '../../types';
import { resolveDependency } from '../../utils';

export const isEmpty = ( v: any ) => {
    if ( v === null || v === undefined ) {
        return true;
    }
    if ( typeof v === 'string' ) {
        return v.trim().length === 0;
    }
    if ( Array.isArray( v ) ) {
        return v.length === 0;
    }
    return false;
};

// ---------------------------------------------------------------------------
// Schema-driven validation engine
// ---------------------------------------------------------------------------

/**
 * Check whether a single ValidationRule's optional dependency conditions are
 * satisfied for the current form data.
 *
 * Re-uses the same `resolveDependency` helper that controls field visibility,
 * so the rule syntax is identical to the `dependencies` key on FormItem.
 */
const areDependenciesMet = (
    dependencies: DependencyCondition[] | undefined,
    formData: Record< string, any >
): boolean => {
    if ( ! dependencies || dependencies.length === 0 ) {
        return true;
    }
    // Build a minimal pseudo-field so resolveDependency can evaluate conditions.
    const pseudoField = { dependencies } as unknown as FormItem;
    return resolveDependency( pseudoField, formData );
};

/**
 * Evaluate a single named rule against `fieldValue` / `formData`.
 *
 * Returns `null` when the rule passes, or the rule's `message` when it fails.
 */
const evaluateRule = (
    rule: ValidationRule,
    fieldValue: any,
    formData: Record< string, any >
): string | null => {
    const { rules, message, params } = rule;

    switch ( rules ) {
        case 'required':
        case 'not_empty':
            return isEmpty( fieldValue ) ? message : null;

        case 'empty':
            return ! isEmpty( fieldValue ) ? message : null;

        // ── greater_than  /  '>' ──────────────────────────────────────────
        case 'greater_than':
        case '>': {
            if ( isEmpty( fieldValue ) ) {
                return null; // skip when blank — use `required` for that
            }
            const gtSubject = parseFloat( fieldValue );
            if ( isNaN( gtSubject ) ) {
                return null;
            }
            if ( params.field ) {
                const comparand = parseFloat( formData[ params.field ] );
                return ( ! isNaN( comparand ) && gtSubject <= comparand ) ? message : null;
            }
            if ( params.value !== undefined ) {
                return gtSubject > Number( params.value ) ? null : message;
            }
            return null;
        }

        // ── '>=' / greater_than_or_equal ────────────────────────────────
        case '>=':
        case 'greater_than_or_equal': {
            if ( isEmpty( fieldValue ) ) {
                return null;
            }
            const gteSubject = parseFloat( fieldValue );
            if ( isNaN( gteSubject ) ) {
                return null;
            }
            if ( params.field ) {
                const comparand = parseFloat( formData[ params.field ] );
                return ( ! isNaN( comparand ) && gteSubject < comparand ) ? message : null;
            }
            if ( params.value !== undefined ) {
                return gteSubject >= Number( params.value ) ? null : message;
            }
            return null;
        }

        // ── less_than  /  '<' ─────────────────────────────────────────────
        case 'less_than':
        case '<': {
            if ( isEmpty( fieldValue ) ) {
                return null;
            }
            const ltSubject = parseFloat( fieldValue );
            if ( isNaN( ltSubject ) ) {
                return null;
            }
            if ( params.field ) {
                const comparand = parseFloat( formData[ params.field ] );
                return ( ! isNaN( comparand ) && ltSubject >= comparand ) ? message : null;
            }
            if ( params.value !== undefined ) {
                return ltSubject < Number( params.value ) ? null : message;
            }
            return null;
        }

        // ── '<=' / less_than_or_equal ─────────────────────────────────────
        case '<=':
        case 'less_than_or_equal': {
            if ( isEmpty( fieldValue ) ) {
                return null;
            }
            const lteSubject = parseFloat( fieldValue );
            if ( isNaN( lteSubject ) ) {
                return null;
            }
            if ( params.field ) {
                const comparand = parseFloat( formData[ params.field ] );
                return ( ! isNaN( comparand ) && lteSubject > comparand ) ? message : null;
            }
            if ( params.value !== undefined ) {
                return lteSubject <= Number( params.value ) ? null : message;
            }
            return null;
        }

        default:
            return null;
    }
};

/**
 * Run all schema-defined validations for a field (AND logic).
 *
 * Iterates the field's `validations` array coming from PHP, skips any rule
 * whose `dependencies` are not met, and returns the first failing rule's
 * message (or `null` when everything passes).
 */
export const runSchemaValidations = (
    field: FormItem,
    formData: Record< string, any >
): string | null => {
    if ( ! field.validations || field.validations.length === 0 ) {
        return null;
    }

    const fieldValue = formData?.[ field.id ];

    for ( const rule of field.validations ) {
        if ( ! areDependenciesMet( rule.dependencies, formData ) ) {
            continue;
        }
        const error = evaluateRule( rule, fieldValue, formData );
        if ( error ) {
            return error;
        }
    }

    return null;
};
