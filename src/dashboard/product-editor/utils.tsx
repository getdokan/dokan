import { sanitizeHTML } from '@src/utilities';
import { __ } from '@wordpress/i18n';
import type { DependencyCondition, FlatFormItem } from './types';

/** Find a field or section by ID. */
export const getField = (
    formItems: FlatFormItem[],
    fieldId: string
): FlatFormItem | null => {
    return formItems.find( ( item ) => item.id === fieldId ) ?? null;
};

/** Resolve the label for a field, falling back to the default label. */
export const resolveLabel = (
    item: FlatFormItem,
    productType: string = 'simple'
): string => {
    return item.labels?.[ productType ] ?? item.label;
};

/** Resolve the visibility for a field, falling back to the default visibility. */
export const resolveVisibility = (
    item: FlatFormItem,
    productType: string = 'simple'
): boolean => {
    return item.visibilities?.[ productType ] ?? item.visibility ?? true;
};

/** Resolve the required state for a field, falling back to the default required. */
export const resolveRequired = (
    item: FlatFormItem,
    productType: string = 'simple'
): boolean => {
    return item.requireds?.[ productType ] ?? item.required ?? false;
};

/** Get label and description for a field. */
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
        case 'equal':
            return (
                normalizeForCompare( depValue ) == normalizeForCompare( value )
            );
        case '===':
            return (
                normalizeForCompare( depValue ) === normalizeForCompare( value )
            );
        case '!=':
        case 'not_equal':
            return (
                normalizeForCompare( depValue ) != normalizeForCompare( value )
            );
        case '!==':
            return (
                normalizeForCompare( depValue ) !== normalizeForCompare( value )
            );
        case 'contains':
            if ( typeof depValue === 'string' || Array.isArray( depValue ) ) {
                return depValue.includes( value as any );
            }
            return false;
        default:
            return true;
    }
}

/** Check whether a field's dependencies are met. */
export const resolveDependency = (
    field: FlatFormItem,
    data: Record< string, any >
): boolean => {
    if ( ! field.dependencies?.length ) {
        return true;
    }

    return field.dependencies
        .filter( ( condition ) => condition.type !== 'options' )
        .every( ( condition ) => resolveCondition( condition, data ) );
};

/** Recursively process layout fields, resolving visibility, dependencies, and sorting by order. */
export const layoutBuilder = (
    layouts: any[],
    formItems: FlatFormItem[] = [],
    product: Record< string, any >
): any[] => {
    const getFlatField = ( id: string ): FlatFormItem | undefined => {
        return formItems.find( ( i ) => i.type === 'field' && i.id === id );
    };

    const productType = product?.type || 'simple';

    const mappedLayouts = layouts.map( ( field ) => {
        if ( typeof field === 'string' ) {
            const flatField = getFlatField( field );
            if ( ! flatField ) {
                return null;
            }
            if ( ! resolveVisibility( flatField, productType ) ) {
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

/** Append new sections to the left column. */
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

/** Collect all used field IDs from the layout. */
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

/** Get remaining fields not present in the layout, grouped by section. */
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

/** Inject remaining fields into their matching sections in the layout. */
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
