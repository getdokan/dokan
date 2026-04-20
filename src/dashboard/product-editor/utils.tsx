import { sanitizeHTML } from '@src/utilities';
import { __ } from '@wordpress/i18n';
import type {
    DependencyCondition,
    FormItem,
    LayoutConfig,
    LayoutItem,
    ResponsiveBreakpoint,
} from './types';

/** Find a field or section by ID. */
export const getField = (
    formItems: FormItem[],
    fieldId: string
): FormItem | null => {
    return formItems.find( ( item ) => item.id === fieldId ) ?? null;
};

/** Resolve the label for a field, falling back to the default label. */
export const resolveLabel = (
    item: FormItem,
    productType: string = 'simple'
): string => {
    return item.labels?.[ productType ] ?? item.label;
};

/** Resolve the visibility for a field, falling back to the default visibility. */
export const resolveVisibility = (
    item: FormItem,
    productType: string = 'simple'
): boolean => {
    return item.visibilities?.[ productType ] ?? item.visibility ?? true;
};

/** Resolve the required state for a field, falling back to the default required. */
export const resolveRequired = (
    item: FormItem,
    productType: string = 'simple'
): boolean => {
    return item.requireds?.[ productType ] ?? item.required ?? false;
};

/** Get label and description for a field. */
export const getFieldHeading = (
    formItems: FormItem[],
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
export function fieldValueForProduct( item: FormItem ): any {
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
    field: FormItem,
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
    formItems: FormItem[] = [],
    product: Record< string, any >
): any[] => {
    const getFlatField = ( id: string ): FormItem | undefined => {
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

/**
 * Append new sections to a target node by ID.
 * If the target is not found, sections are appended to the root array.
 */
export const appendToTarget = (
    items: any[],
    newSections: any[],
    target: string
): any[] => {
    return items.map( ( item ) => {
        if ( typeof item !== 'string' && item.id === target ) {
            return {
                ...item,
                children: [ ...( item.children || [] ), ...newSections ],
            };
        }
        if ( typeof item !== 'string' && item.children ) {
            return {
                ...item,
                children: appendToTarget(
                    item.children,
                    newSections,
                    target
                ),
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
    formItems: FormItem[],
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
 * Build a nested layout tree from a flat array of layout items.
 *
 * Each flat item has an `id`, `parent_id`, and optional `children` (field IDs).
 * Nested items with an `after` property are interleaved into the parent's
 * children array right after the specified field ID. Items without `after`
 * are appended at the end.
 *
 * @param {LayoutItem[]} flatItems Flat layout items with parent-child relationships.
 * @param {string|null}      parentId  Parent ID to filter children for (null for root).
 * @return {any[]} Nested layout tree.
 */
export const buildLayoutTree = (
    flatItems: LayoutItem[],
    parentId: string | null = null
): any[] => {
    // Find items whose parent_id matches the current parentId.
    // PHP handles priority-based sorting; JS preserves the received order.
    const children = flatItems.filter(
        ( item ) => item.parent_id === parentId
    );

    return children.map( ( item ) => {
        // Recursively build nested children (sub-layout items).
        const nestedChildren = buildLayoutTree( flatItems, item.id );

        // Start with the field IDs from `children`.
        const fieldIds: string[] = item.children ?? [];
        const mergedChildren: any[] = [ ...fieldIds ];

        // Insert nested items: those with `after` go right after the
        // specified field ID; the rest are appended at the end.
        const appendItems: any[] = [];

        nestedChildren.forEach( ( nested: any ) => {
            // Find the original flat item to read `after`.
            const flatItem = flatItems.find(
                ( fi ) => fi.id === nested.id
            );

            if ( flatItem?.after ) {
                const idx = mergedChildren.findIndex(
                    ( child ) => child === flatItem.after
                );
                if ( idx !== -1 ) {
                    mergedChildren.splice( idx + 1, 0, nested );
                } else {
                    appendItems.push( nested );
                }
            } else {
                appendItems.push( nested );
            }
        } );

        mergedChildren.push( ...appendItems );

        const node: Record< string, any > = {
            id: item.id,
        };

        if ( item.layout ) {
            node.layout = item.layout;
        }
        if ( item.label ) {
            node.label = item.label;
        }
        if ( item.description ) {
            node.description = item.description;
        }
        if ( mergedChildren.length > 0 ) {
            node.children = mergedChildren;
        }

        return node;
    } );
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

/**
 * Resolve layout config for a flat layout item based on current viewport width.
 * Picks the first matching responsive breakpoint (sorted ascending by maxWidth),
 * or falls back to the item's default layout.
 */
export function resolveResponsiveLayout(
    item: LayoutItem,
    width: number
): LayoutConfig | undefined {
    if ( item.responsive?.length && width ) {
        const sorted = [ ...item.responsive ].sort(
            ( a: ResponsiveBreakpoint, b: ResponsiveBreakpoint ) =>
                a.maxWidth - b.maxWidth
        );
        for ( const bp of sorted ) {
            if ( width <= bp.maxWidth ) {
                return bp.layout;
            }
        }
    }
    return item.layout;
}

/**
 * Recursively inject section headings (label/description) from formItems
 * into layout nodes that have `withHeader: true` but no label set.
 */
export function injectSectionHeadings(
    node: any,
    formItems: FormItem[]
): any {
    if ( typeof node === 'string' ) {
        return node;
    }

    const updated = { ...node };

    if ( updated.layout?.withHeader && ! updated.label ) {
        const heading = getFieldHeading( formItems, updated.id );
        if ( heading.label ) {
            updated.label = heading.label;
        }
        if ( heading.description ) {
            updated.description = heading.description;
        }
    }

    if ( updated.children ) {
        updated.children = updated.children.map( ( child: any ) => {
            return injectSectionHeadings( child, formItems );
        } );
    }

    return updated;
}
