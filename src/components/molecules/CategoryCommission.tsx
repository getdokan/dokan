import { useState } from '@wordpress/element';
import { MaskedInput, SimpleInput } from '@getdokan/dokan-ui';
import SquarePlus from '../Icons/SquarePlus';
import SquareMinus from '../Icons/SquareMinus';
import Plus from '../Icons/Plus';

interface Category {
    id: string | number;
    name: string;
    children?: Category[];
}

interface CommissionValues {
    [ categoryId: string ]: {
        percent: string;
        fixed: string;
    };
}

// Mock currency data - replace with actual data source
const mockCurrency = {
    symbol: '$',
    thousand: ',',
    decimal: '.',
    precision: 2,
};

const sampleCategories: Category[] = [
    {
        id: 21,
        name: 'Clothing',
        children: [
            { id: 22, name: "Men's Special" },
            { id: 23, name: "Women's Corner" },
        ],
    },
    { id: 24, name: 'Fashion' },
    { id: 25, name: 'Toy' },
    { id: 26, name: 'Home Decor' },
];

const defaultCommission = { percent: '0', fixed: '2500' };

const CategoryCommission: React.FC = () => {
    const [ commission, setCommission ] = useState< CommissionValues >( () => {
        const values: CommissionValues = {};

        const fill = ( cats: Category[] ) => {
            cats.forEach( ( cat ) => {
                values[ cat.id ] = { ...defaultCommission };
                if ( cat.children ) {
                    fill( cat.children );
                }
            } );
        };
        fill( sampleCategories );
        values.all = { ...defaultCommission };
        return values;
    } );
    const [ expandedIds, setExpandedIds ] = useState<
        Array< string | number >
    >( [] );
    const [ allCategoryOpen, setAllCategoryOpen ] = useState( false );
    const handleChange = (
        id: string | number,
        field: 'percent' | 'fixed',
        value: string
    ) => {
        setCommission( ( prev ) => ( {
            ...prev,
            [ id ]: {
                ...prev[ id ],
                [ field ]: value,
            },
        } ) );
    };

    const handleToggle = ( id: string | number ) => {
        setExpandedIds( ( prev ) =>
            prev.includes( id )
                ? prev.filter( ( eid ) => eid !== id )
                : [ ...prev, id ]
        );
    };

    const renderCategoryRow = ( cat: Category, level = 0 ) => {
        const hasChildren = !! cat.children && cat.children.length > 0;
        const isExpanded = expandedIds.includes( cat.id );
        const isAllCategory = cat.id === 'all';
        const getCurrencySymbol = mockCurrency.symbol;

        const renderIcon = () => {
            if ( isAllCategory ) {
                return <SquarePlus />;
            }

            if ( hasChildren ) {
                if ( isExpanded ) {
                    return <SquareMinus color="#7047EB" />;
                }
                return <SquarePlus />;
            }

            // Plus icon for categories without children (disabled)
            return <SquarePlus className={ 'opacity-50 cursor-not-allowed' } />;
        };

        return (
            <div
                key={ cat.id }
                className="bg-white border-b border-[#E9E9E9] h-20 "
            >
                <div className="h-20  w-full flex items-center px-5">
                    <div
                        className="flex items-center"
                        style={ { paddingLeft: `${ level * 20 }px` } }
                    >
                        <button
                            type="button"
                            className={ `mr-3 p-1 text-[#828282] hover:text-[#575757] focus:!outline-none rounded transition-colors duration-150 ${
                                ! hasChildren && ! isAllCategory
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                            }` }
                            onClick={ () => {
                                if ( hasChildren ) {
                                    handleToggle( cat.id );
                                } else if ( isAllCategory ) {
                                    setAllCategoryOpen( ( prev ) => ! prev );
                                }
                            } }
                            disabled={ ! hasChildren && ! isAllCategory }
                        >
                            { renderIcon() }
                        </button>
                        <div className="flex items-center">
                            <span className="font-semibold text-[14px] text-[#575757]">
                                { isAllCategory ? 'All Category' : cat.name }
                            </span>
                            <span className="ml-2 text-xs text-[#A5A5AA] bg-[#F1F1F4] px-2 py-0.5 rounded">
                                #{ cat.id }
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center ml-auto gap-3">
                        <div className="flex items-center">
                            <div className="w-[142px]">
                                <SimpleInput
                                    input={ {
                                        type: 'number',
                                    } }
                                    value={
                                        commission[ cat.id ]?.percent || ''
                                    }
                                    addOnRight={
                                        <span className="text-[#575757] text-sm">
                                            %
                                        </span>
                                    }
                                    onChange={ ( e ) =>
                                        handleChange(
                                            cat.id,
                                            'percent',
                                            e.target.value
                                        )
                                    }
                                    className={ `w-full h-10 pl-6 pr-8 text-sm border ${
                                        cat.id === 23
                                            ? 'border-[#7047EB]'
                                            : 'border-[#E9E9E9]'
                                    } rounded-r-none bg-white transition-colors placeholder-[#828282] text-[#575757]` }
                                />
                            </div>
                            <div className="mx-2">
                                <Plus />
                            </div>
                            <div className="w-[120px]">
                                <MaskedInput
                                    addOnLeft={
                                        <span className="text-[#575757] text-sm">
                                            { getCurrencySymbol }
                                        </span>
                                    }
                                    maskRule={ {
                                        numeral: true,
                                        delimiter: mockCurrency.thousand,
                                        numeralDecimalMark:
                                            mockCurrency.decimal,
                                        numeralDecimalScale:
                                            mockCurrency.precision,
                                    } }
                                    className={ `w-full h-10 pl-6 pr-3 text-sm border ${
                                        cat.id === 23
                                            ? 'border-[#7047EB]'
                                            : 'border-[#E9E9E9]'
                                    } rounded-r-[3px] bg-white focus:border-[#7047EB] focus:ring-1 focus:ring-[#7047EB] focus:ring-opacity-20 transition-colors placeholder-[#828282] text-[#575757]` }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderCategories = (
        cats: Category[],
        level = 0
    ): React.ReactNode[] =>
        cats.flatMap( ( cat ) => [
            renderCategoryRow( cat, level ),
            cat.children &&
            cat.children.length > 0 &&
            expandedIds.includes( cat.id )
                ? renderCategories( cat.children, level + 1 )
                : null,
        ] );

    return (
        <div className="w-full bg-white border border-[#E9E9E9] rounded-lg overflow-hidden">
            { /* Header */ }
            <div className="bg-[#F8F8F8] border-b border-[#E9E9E9] h-16 flex items-center px-5">
                <div className="flex items-center">
                    <span className="font-semibold text-[14px] text-[#575757]">
                        Category
                    </span>
                </div>
                <div className="flex items-center ml-auto gap-3">
                    <div className="flex items-center">
                        <div className="w-[142px]">
                            <span className="font-semibold text-[14px] text-[#575757]">
                                Percentage (%)
                            </span>
                        </div>
                        <div className="mx-2 w-4"></div>
                        <div className="w-[120px]">
                            <span className="font-semibold text-[14px] text-[#575757]">
                                Fixed Amount
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            { /* Categories List */ }
            <div className="border-t border-[#E9E9E9]">
                { renderCategoryRow( { id: 'all', name: 'All Category' } ) }
                { allCategoryOpen && renderCategories( sampleCategories ) }
            </div>
        </div>
    );
};

export default CategoryCommission;
