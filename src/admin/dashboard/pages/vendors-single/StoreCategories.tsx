import { StoreCategory } from '@dokan/definitions/dokan-vendors';

export interface StoreCategoriesProps {
    categories?: StoreCategory[];
}

const StoreCategories = ( { categories }: StoreCategoriesProps ) => {
    const maxToShow = 2;
    const shown = categories.slice( 0, maxToShow );
    const extraCount = categories.length - maxToShow;

    return (
        <span className="text-sm text-zinc-500">
            { shown.map( ( category, index ) => (
                <span key={ index } className="inline-block">
                    { category.name }
                    { index < shown.length - 1 ? ', ' : '' }
                </span>
            ) ) }
            { extraCount > 0 && (
                <span className="inline-block">, { extraCount }+</span>
            ) }
        </span>
    );
};

export default StoreCategories;
