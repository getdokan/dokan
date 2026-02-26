import { sanitizeHTML } from '@src/utilities';
import { __ } from '@wordpress/i18n';
import { DependencyCondition, FlatFormItem } from './types';

/**
 * Helper to find a field or section by ID in the flat form items array.
 *
 * @param {Array}  formItems Flat array of sections and fields.
 * @param {string} fieldId  The ID of the field or section to find.
 *
 * @return {object|null} The field or section item if found, null otherwise.
 */
export const getField = (
    formItems: FlatFormItem[],
    fieldId: string
): FlatFormItem | null => {
    return formItems.find( ( item ) => item.id === fieldId ) ?? null;
};

/**
 * Resolve the label for a field item based on the current product type.
 * Falls back to the default `label` when no type-specific entry exists in `labels`.
 *
 * @param {FlatFormItem} item        Form item (field or section).
 * @param {string}       productType Current product type (e.g. 'simple', 'variable').
 *
 * @return {string} Resolved label string.
 */
export const resolveLabel = (
    item: FlatFormItem,
    productType: string = 'simple'
): string => {
    return item.labels?.[ productType ] ?? item.label;
};

/**
 * Resolve the visibility for a field item based on the current product type.
 * Falls back to the default `visibility` when no type-specific entry exists in `visibilities`.
 *
 * @param {FlatFormItem} item        Form item (field or section).
 * @param {string}       productType Current product type (e.g. 'simple', 'variable').
 *
 * @return {boolean} Resolved visibility value.
 */
export const resolveVisibility = (
    item: FlatFormItem,
    productType: string = 'simple'
): boolean => {
    return item.visibilities?.[ productType ] ?? item.visibility ?? true;
};

/**
 * helper to get label and description for a field.
 *
 * @param {Array}  formItems Flat array of sections and fields.
 * @param {string} fieldId The ID of the field.
 *
 * @return {Object} Object containing label and description.
 */
export const getFieldHeading = (
    formItems: FlatFormItem[],
    fieldId: string
) => {
    const item = getField( formItems, fieldId );
    if ( ! item ) {
        return {};
    }
    return {
        label: item.label,
        description: item.description,
    };
};

/**
 * Build initial product state from flat form items (field items only).
 * Uses each field's value with minimal normalization (image_id, gallery, checkbox).
 */
export function fieldValueForProduct( item: FlatFormItem ): any {
    if ( item.type !== 'field' ) return undefined;
    const v = item.value;
    if (
        item.id === 'image_id' &&
        v != null &&
        typeof v === 'object' &&
        'id' in v
    ) {
        return v.id;
    }
    if ( item.id === 'gallery_image_ids' && Array.isArray( v ) ) {
        return v.map( ( img: any ) =>
            typeof img === 'object' && img?.id != null ? img.id : img
        );
    }
    const variant = item.variant;
    if ( variant === 'checkbox' ) {
        return v === 'yes' || v === 'on' || v === true || v === 1 || v === '1';
    }
    return v ?? '';
}

/** True if value is considered empty (null, undefined, '', whitespace-only, or empty array). */
function isEmptyValue( val: any ): boolean {
    if ( val === undefined || val === null ) {
        return true;
    }
    if ( typeof val === 'string' ) {
        return val.trim() === '';
    }
    if ( Array.isArray( val ) ) {
        return val.length === 0;
    }
    return false;
}

/** Normalize checkbox-like values to boolean for comparison. */
function normalizeForCompare( val: any ): any {
    if ( val === 'on' || val === 'yes' || val === true || val === 1 ) {
        return true;
    }
    if ( val === 'off' || val === 'no' || val === false ) {
        return false;
    }
    return val;
}

/** Evaluate a single dependency condition against form data. */
function resolveCondition(
    depsCondition: DependencyCondition,
    data: Record< string, any >
): boolean {
    if ( ! depsCondition.key ) {
        return true;
    }

    const { key: depKey, comparison, value } = depsCondition;
    const depValue = data[ depKey ];

    switch ( comparison ) {
        case 'empty':
            return isEmptyValue( depValue );
        case 'not_empty':
            return ! isEmptyValue( depValue );
        case '==':
        case '===':
        case 'equal':
            return (
                normalizeForCompare( depValue ) === normalizeForCompare( value )
            );
        case '!=':
        case '!==':
        case 'not_equal':
            return (
                normalizeForCompare( depValue ) !== normalizeForCompare( value )
            );
        default:
            return true;
    }
}

/**
 * Check whether a field should be active based on its product_types and dependencies.
 *
 * @param {FlatFormItem} field The field to check.
 * @param {Record<string, any>} data  Form values keyed by field id.
 *
 * @return {boolean} True if the field's dependencies are met, false otherwise.
 */
export const resolveDependency = (
    field: FlatFormItem,
    data: Record< string, any >
): boolean => {
    if ( ! field.dependencies?.length ) {
        return true;
    }

    return field.dependencies.every( ( condition ) => {
        return resolveCondition( condition, data );
    } );
};

/**
 * Recursive function to process layout fields.
 * Handles string references, card creation, and child processing.
 * Also filters out empty cards (cards with no visible children).
 * Uses only formItems (flat array); field config is derived from formItems.
 *
 * @param {Array}  layouts   The fields to process for the layout.
 * @param {Array}  formItems Flat array of sections and fields (type, id, order, dependencies).
 * @param {Object} product   The current product data for dependency checking.
 *
 * @return {Array} valid processed fields.
 */
export const layoutBuilder = (
    layouts: any[],
    formItems: FlatFormItem[] = [],
    product: Record< string, any >
): any[] => {
    const getFlatField = ( id: string ): FlatFormItem | undefined => {
        return formItems.find( ( i ) => i.type === 'field' && i.id === id );
    };

    const getOrder = ( item: any ) => {
        if ( typeof item === 'string' ) {
            const flat = getFlatField( item );
            if ( flat && typeof flat.order === 'number' ) {
                return flat.order;
            }
            return 30;
        }

        if ( typeof item.order === 'number' ) {
            return item.order;
        }

        if ( item.id ) {
            const flat = formItems.find( ( i ) => i.id === item.id );
            if ( flat && 'order' in flat && typeof flat.order === 'number' ) {
                return flat.order;
            }
        }

        return 30;
    };

    const sortedLayouts = [ ...layouts ].sort( ( a, b ) => {
        return getOrder( a ) - getOrder( b );
    } );

    const mappedLayouts = sortedLayouts.map( ( field ) => {
        if ( typeof field === 'string' ) {
            const flatField = getFlatField( field );
            if ( ! flatField ) {
                return null;
            }
            if ( ! resolveDependency( flatField, product ) ) {
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
                formItems,
                product
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
 * @param {Array} items      Layout items.
 * @param {Set}   usedFields Set to store used fields.
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
 * Helper to get remaining fields that are not in the layout (from flat form items).
 *
 * @param {Array} formItems  Flat array of sections and fields.
 * @param {Set}   usedFields Set of used field ids.
 *
 * @return {Object} Remaining field ids by section id.
 */
export const getRemainingFields = (
    formItems: FlatFormItem[],
    usedFields: Set< string >
): Record< string, string[] > => {
    const remainingFieldsBySection: Record< string, string[] > = {};

    formItems.forEach( ( item ) => {
        if ( item.type !== 'field' ) {
            return;
        }
        if ( usedFields.has( item.id ) ) {
            return;
        }
        const sectionId = item.section_id ?? '';
        if ( ! sectionId ) {
            return;
        }
        if ( ! remainingFieldsBySection[ sectionId ] ) {
            remainingFieldsBySection[ sectionId ] = [];
        }
        remainingFieldsBySection[ sectionId ].push( item.id );
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
