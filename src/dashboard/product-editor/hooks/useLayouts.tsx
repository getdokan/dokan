import { useWindowDimensions } from '@src/hooks';
import { useMemo } from '@wordpress/element';
import { FormItem, LayoutItem } from '../types';
import {
    appendToTarget,
    buildLayoutTree,
    collectUsedFields,
    getFieldHeading,
    getRemainingFields,
    injectRemainingFields,
    injectSectionHeadings,
    layoutBuilder,
    resolveResponsiveLayout,
} from '../utils';

/**
 * Custom hook to manage form layouts.
 *
 * Accepts a flat layout definition from PHP (via `dokan_product_editor_layouts` filter),
 * builds a nested tree, resolves responsive layouts, and applies visibility/dependency logic.
 *
 * @param {Array}  formItems  Flat array of sections and fields from the server.
 * @param {Object} product    The current product data for dependency checking.
 * @param {Array}  formLayout Flat layout items from PHP with parent-child relationships.
 *
 * @return {Object} Object containing the processed form layouts.
 */
export default function useLayouts(
    formItems: FormItem[],
    product: Record< string, any >,
    formLayout: LayoutItem[] = []
) {
    const { width } = useWindowDimensions();

    // Resolve responsive layouts for items that have breakpoints.
    const resolvedLayout = useMemo( () => {
        if ( ! width ) {
            return formLayout;
        }
        return formLayout.map( ( item ) => {
            if ( ! item.responsive?.length ) {
                return item;
            }
            const resolved = resolveResponsiveLayout( item, width );
            return { ...item, layout: resolved };
        } );
    }, [ formLayout, width ] );

    // Build the layout structure from the flat PHP layout array.
    const layoutStructure = useMemo( () => {
        // Build nested tree from flat items.
        const tree = buildLayoutTree( resolvedLayout, null );

        // Inject label/description from formItems into sections that have withHeader.
        const withHeadings = tree.map( ( node: any ) => {
            return injectSectionHeadings( node, formItems );
        } );

        // Handle fields added via `dokan_product_editor_schema` filter but not placed in layout.
        const usedFields = collectUsedFields( withHeadings );
        const remainingFieldsBySection = getRemainingFields(
            formItems,
            usedFields
        );
        let updatedLayouts = injectRemainingFields(
            withHeadings,
            remainingFieldsBySection
        );

        const newSections = Object.keys( remainingFieldsBySection ).map(
            ( sectionId ) => {
                const heading = getFieldHeading( formItems, sectionId );
                return {
                    id: sectionId,
                    layout: {
                        type: 'card',
                        withHeader: true,
                    },
                    children: remainingFieldsBySection[ sectionId ],
                    ...heading,
                };
            }
        );

        if ( newSections.length > 0 ) {
            updatedLayouts = appendToTarget(
                updatedLayouts,
                newSections,
                'primary_column'
            );
        }

        return updatedLayouts;
    }, [ resolvedLayout, formItems ] );

    // Apply product-dependent visibility and dependency filtering.
    const formLayouts = useMemo( () => {
        return {
            fields: layoutBuilder( layoutStructure, formItems, product ),
        };
    }, [ layoutStructure, formItems, product ] );

    return { formLayouts, width };
}
