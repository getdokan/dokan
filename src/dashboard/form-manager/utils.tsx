import { sanitizeHTML } from '@src/utilities';
import { __ } from '@wordpress/i18n';
import { DependencyCondition, FormField, Section } from './types';

export const validateProductForm = (
    sections: Section[],
    values: Record< string, any >
): Record< string, string > => {
    const newErrors: Record< string, string > = {};

    sections.forEach( ( section ) => {
        section.fields.forEach( ( field ) => {
            if ( ! field.required ) {
                return;
            }
            // Check visibility
            if ( ! field.visibility ) {
                return;
            }
            if ( ! checkDependency( field.dependency_condition, values ) ) {
                return;
            }

            const value = values[ field.id ];
            if ( ! value || ( Array.isArray( value ) && value.length === 0 ) ) {
                newErrors[ field.id ] = __(
                    'Please fill out this field.',
                    'dokan-lite'
                );
            }
        } );
    } );

    return newErrors;
};

/**
 * Check dependency condition for a field.
 *
 * @param {Object} depsCondition The dependency condition.
 * @param {Object} data          The data to check against.
 *
 * @return {boolean} True if the dependency is met, false otherwise.
 */
export const checkDependency = (
    depsCondition: DependencyCondition | DependencyCondition[] | undefined,
    data: Record< string, any >
): boolean => {
    if ( Array.isArray( depsCondition ) ) {
        return depsCondition.every( ( condition ) =>
            checkDependency( condition, data )
        );
    }

    if ( typeof depsCondition === 'object' && depsCondition !== null ) {
        const { field: depField, operator, value } = depsCondition;
        const depValue = data[ depField ];

        let targetValue = value;
        if ( value === 'on' || value === 'yes' ) {
            targetValue = true;
        }
        if ( value === 'off' || value === 'no' ) {
            targetValue = false;
        }

        if ( operator === 'equal' ) {
            return depValue === targetValue;
        }
        if ( operator === 'not_equal' ) {
            return depValue !== targetValue;
        }
    }
    return true;
};

/**
 * Recursive function to process layout fields.
 * Handles string references, card creation, and child processing.
 * Also filters out empty cards (cards with no visible children).
 *
 * @param {Array}  layoutFields The fields to process for the layout.
 * @param {Array}  fields       All available form fields.
 * @param {Object} product      The current product data for dependency checking.
 * @param {string} scope        The scope of the layout (e.g. 'product', 'variation').
 *
 * @return {Array} valid processed fields.
 */
export const layoutBuilder = (
    layouts: any[],
    fields: FormField[],
    product: Record< string, any >,
    scope: string = 'product'
): any[] => {
    const mappedLayouts = layouts.map( ( field ) => {
        if ( typeof field === 'string' ) {
            const fieldData = fields.find( ( f ) => f.id === field );
            if ( ! fieldData ) {
                return null;
            }
            // Check hidden scope
            if (
                scope &&
                fieldData.hidden_scope &&
                fieldData.hidden_scope.includes( scope )
            ) {
                return null;
            }
            const condition = fieldData.dependency_condition;
            if ( ! checkDependency( condition, product ) ) {
                return null;
            }
            return field;
        }
        const newField = { ...field };

        if ( newField.layout?.type === 'card' && newField.description ) {
            newField.label = (
                <div className="dokan-form-card-header-content">
                    <div className="dokan-form-card-title">
                        { newField.label }
                    </div>
                    <div
                        className="dokan-form-card-description"
                        dangerouslySetInnerHTML={ {
                            __html: sanitizeHTML( newField.description ),
                        } }
                    />
                </div>
            );
            delete newField.description;
        }

        if ( newField.children ) {
            newField.children = layoutBuilder(
                newField.children,
                fields,
                product,
                scope
            );
        }

        if ( newField.layout && ! newField.children?.length ) {
            return null;
        }

        return newField;
    } );
    return mappedLayouts.filter( Boolean );
};

/**
 * Helper to append new sections to the left column.
 *
 * @param {Array} items       Layout items.
 * @param {Array} newSections New sections to append.
 *
 * @return {Array} Updated layout items.
 */
export const appendToLeftColumn = (
    items: any[],
    newSections: any[]
): any[] => {
    return items.map( ( item ) => {
        if ( typeof item !== 'string' && item.id === 'left_column' ) {
            return {
                ...item,
                children: [ ...( item.children || [] ), ...newSections ],
            };
        }
        if ( typeof item !== 'string' && item.children ) {
            return {
                ...item,
                children: appendToLeftColumn( item.children, newSections ),
            };
        }
        return item;
    } );
};

/**
 * Helper to collect all used field IDs from the layout.
 *
 * @param {Array} items Layout items.
 * @param {Set} usedFields Set to store used fields.
 *
 * @return {Set} Set of used fields.
 */
export const collectUsedFields = (
    items: any[],
    usedFields: Set< string > = new Set()
): Set< string > => {
    items.forEach( ( item ) => {
        if ( typeof item === 'string' ) {
            usedFields.add( item );
            return;
        }
        if ( item.children ) {
            collectUsedFields( item.children, usedFields );
        }
    } );
    return usedFields;
};

/**
 * Helper to get remaining fields that are not in the layout.
 *
 * @param {Array} sections   The available sections in the form.
 * @param {Set}   usedFields Set of used fields.
 *
 * @return {Object} Object containing remaining fields by section.
 */
export const getRemainingFields = (
    sections: Section[],
    usedFields: Set< string >
): Record< string, string[] > => {
    const remainingFieldsBySection: Record< string, string[] > = {};

    sections.forEach( ( section ) => {
        section.fields.forEach( ( field ) => {
            if ( usedFields.has( field.id ) ) {
                return;
            }

            // Use field's section_id if available, otherwise fall back to the section's id
            const targetSectionId = field.section_id || section.id;

            if ( ! remainingFieldsBySection[ targetSectionId ] ) {
                remainingFieldsBySection[ targetSectionId ] = [];
            }

            remainingFieldsBySection[ targetSectionId ].push( field.id );
        } );
    } );

    return remainingFieldsBySection;
};

/**
 * Helper to inject remaining fields into the layout.
 *
 * @param {Array}  items                    Layout items.
 * @param {Object} remainingFieldsBySection Object containing remaining fields by section.
 *
 * @return {Array} Updated layout items.
 */
export const injectRemainingFields = (
    items: any[],
    remainingFieldsBySection: Record< string, string[] >
): any[] => {
    return items.map( ( item ) => {
        if ( typeof item === 'string' ) {
            return item;
        }
        const newItem = { ...item };

        // Append if section ID matches
        if ( newItem.id && remainingFieldsBySection[ newItem.id ] ) {
            newItem.children = [
                ...( newItem.children || [] ),
                ...remainingFieldsBySection[ newItem.id ],
            ];
            delete remainingFieldsBySection[ newItem.id ];
        }

        if ( newItem.children ) {
            newItem.children = injectRemainingFields(
                newItem.children,
                remainingFieldsBySection
            );
        }
        return newItem;
    } );
};
