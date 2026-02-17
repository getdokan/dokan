import { sanitizeHTML } from '@src/utilities';
import { __ } from '@wordpress/i18n';
import { DependencyCondition, FlatFormItem } from './types';

declare let dokan: any;
declare let jQuery: any;

export const ajaxRequest = (
    data: Record< string, any > | FormData,
    method: string = 'POST'
) => {
    return new Promise( ( resolve, reject ) => {
        const options: any = {
            data,
            url: dokan.ajaxurl,
            type: method,
            success( response: any ) {
                resolve( response );
            },
            error( error: any ) {
                reject( error );
            },
        };
        if ( data instanceof FormData ) {
            options.processData = false;
            options.contentType = false;
        }
        jQuery.ajax( options );
    } );
};

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
 * Build initial product state from flat form items (field items only).
 * Uses each field's value with minimal normalization (image_id, gallery, checkbox).
 */
export function fieldValueForProduct( item: FlatFormItem ): any {
    if ( item.type !== 'field' ) return undefined;
    const v = item.value;
    if ( item.id === 'image_id' && v != null && typeof v === 'object' && 'id' in v ) {
        return v.id;
    }
    if ( item.id === 'gallery_image_ids' && Array.isArray( v ) ) {
        return v.map( ( img: any ) => ( typeof img === 'object' && img?.id != null ? img.id : img ) );
    }
    const variant = item.variant;
    if ( variant === 'checkbox' ) {
        return v === 'yes' || v === 'on' || v === true || v === 1 || v === '1';
    }
    return v ?? '';
}

export const validateProductForm = (
    formItems: FlatFormItem[],
    values: Record< string, any >
): Record< string, string > => {
    const newErrors: Record< string, string > = {};

    formItems.forEach( ( item ) => {
        if ( item.type !== 'field' ) {
            return;
        }
        const field = item;
        if ( ! field.required ) {
            return;
        }
        if ( field.visibility === false ) {
            return;
        }
        if ( ! resolveDependency( field.dependencies, values ) ) {
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

    return newErrors;
};

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

/**
 * Check dependency condition for a field.
 * Uses structure: { comparison, key, value? }. Comparisons: '==', '!=', 'empty', 'not_empty'.
 *
 * @param {Object} depsCondition The dependency condition (or array of conditions; all must pass).
 * @param {Object} data          The data to check against (e.g. form values keyed by field id).
 *
 * @return {boolean} True if the dependency is met, false otherwise.
 */
export const resolveDependency = (
    depsCondition: DependencyCondition | DependencyCondition[] | undefined,
    data: Record< string, any >
): boolean => {
    if ( Array.isArray( depsCondition ) ) {
        return depsCondition.every( ( condition ) =>
            resolveDependency( condition, data )
        );
    }

    if ( ! depsCondition || ! depsCondition.key ) {
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
        case 'equal':
            return normalizeForCompare( depValue ) === normalizeForCompare( value );
        case '!=':
        case 'not_equal':
            return normalizeForCompare( depValue ) !== normalizeForCompare( value );
        default:
            return true;
    }
};

/**
 * Recursive function to process layout fields.
 * Handles string references, card creation, and child processing.
 * Also filters out empty cards (cards with no visible children).
 * Uses only formItems (flat array); field config is derived from formItems.
 *
 * @param {Array}  layouts   The fields to process for the layout.
 * @param {Array}  formItems Flat array of sections and fields (type, id, order, hidden_scope, dependencies).
 * @param {Object} product   The current product data for dependency checking.
 * @param {string} scope     The scope of the layout (e.g. 'product', 'variation').
 *
 * @return {Array} valid processed fields.
 */
export const layoutBuilder = (
    layouts: any[],
    formItems: FlatFormItem[] = [],
    product: Record< string, any >,
    scope: string = 'product'
): any[] => {
    const getFlatField = ( id: string ): FlatFormItem | undefined =>
        formItems.find(
            ( i ) => i.type === 'field' && i.id === id
        );

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
            const condition = flatField.dependencies;
            if ( ! resolveDependency( condition, product ) ) {
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
        const sectionId = item.parent_id ?? '';
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
