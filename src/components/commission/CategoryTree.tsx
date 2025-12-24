import { useCallback } from '@wordpress/element';
import CategoryRow from './CategoryRow';
import { Category, CommissionInputsProps } from './types';

interface CategoryTreeProps {
    categories: Category[];
    expandedIds: ( string | number )[];
    onToggle: ( id: string | number ) => void;
    commissionInputsProps: CommissionInputsProps;
}

const CategoryTree: React.FC< CategoryTreeProps > = ( {
    categories,
    expandedIds,
    onToggle,
    commissionInputsProps,
} ) => {
    const renderCategories = useCallback(
        ( cats: Category[], level = 0 ): JSX.Element[] => {
            const result: JSX.Element[] = [];

            cats.forEach( ( cat ) => {
                const hasChildren = !! cat.children && cat.children.length > 0;
                const isExpanded = expandedIds.includes( cat.term_id );

                // Render the current category
                result.push(
                    <CategoryRow
                        key={ `${ cat.term_id }-${ level }` }
                        category={ cat }
                        level={ level }
                        isExpanded={ isExpanded }
                        hasChildren={ hasChildren }
                        onToggle={ onToggle }
                        commissionInputsProps={ commissionInputsProps }
                    />
                );

                // Render children if expanded and has children
                if ( hasChildren && isExpanded ) {
                    // Recursively render children with increased level
                    result.push(
                        ...renderCategories( cat.children, level + 1 )
                    );
                }
            } );

            return result;
        },
        [ expandedIds, onToggle, commissionInputsProps ]
    );

    return <>{ renderCategories( categories ) }</>;
};

export default CategoryTree;
