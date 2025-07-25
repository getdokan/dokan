import React, { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { MaskedInput, SimpleInput } from '@getdokan/dokan-ui';
import { debounce } from '@wordpress/compose';
import SquarePlus from '../../../../../../../components/Icons/SquarePlus';
import SquareMinus from '../../../../../../../components/Icons/SquareMinus';
import Plus from '../../../../../../../components/Icons/Plus';

interface Category {
    term_id: string | number;
    name: string;
    parent_id: string | number;
    parents: number[];
    children: any[];
}

interface CommissionValues {
    all?: {
        percentage: string;
        flat: string;
    };
    items?: {
        [ categoryId: string ]: {
            percentage: string;
            flat: string;
        };
    };
}

interface CategoryCommissionWrapperProps {
    categories?: { [ key: string ]: Category };
    value?: CommissionValues;
    onValueChange?: ( value: CommissionValues ) => void;
    currency?: {
        symbol: string;
        thousand: string;
        decimal: string;
        precision: number;
    };
    resetSubCategory?: boolean;
}

// Default currency data
const defaultCurrency = {
    symbol: '$',
    thousand: ',',
    decimal: '.',
    precision: 2,
};

const defaultCommission = { percentage: '0', flat: '2500' };

const CategoryCommissionWrapper: React.FC<
    CategoryCommissionWrapperProps
> = ( {
    categories = {},
    value = {},
    onValueChange,
    currency = defaultCurrency,
    resetSubCategory = true,
} ) => {
    const [ commission, setCommission ] = useState< CommissionValues >( () => {
        if ( Object.keys( value ).length > 0 ) {
            return value;
        }

        const values: CommissionValues = {
            all: { ...defaultCommission },
            items: {},
        };
        return values;
    } );

    const [ expandedIds, setExpandedIds ] = useState<
        Array< string | number >
    >( [] );
    const [ allCategoryOpen, setAllCategoryOpen ] = useState( false );

    const getCategories = ( categoriesData: { [ key: string ]: Category } ) => {
        const result: Category[] = [];
        const categoryMap: { [ key: string ]: Category } = {};

        for ( const termId in categoriesData ) {
            categoryMap[ termId ] = categoriesData[ termId ];
        }

        for ( const termId in categoryMap ) {
            const category = categoryMap[ termId ];

            if ( category.parent_id !== '0' ) {
                const parent = categoryMap[ category.parent_id ];
                const parentIndex = result.indexOf( parent );

                result.splice( parentIndex + 1, 0, category );
            } else {
                result.push( category );
            }
        }

        return result;
    };

    const getChildren = ( parentId: string | number ) => {
        const categoriesArray = Object.values( categories );

        const children = categoriesArray.filter( ( item ) => {
            return item?.parents?.includes( Number( parentId ) );
        } );

        return children.map( ( item ) => item?.term_id );
    };

    const showCatRow = ( item: Category ) => {
        if ( Number( item?.parent_id ) === 0 ) {
            return true;
        }

        return expandedIds.includes( Number( item?.parent_id ) );
    };

    const getCommissionValue = (
        commissionType: 'percentage' | 'flat',
        termId: string | number
    ) => {
        if ( commission?.items?.hasOwnProperty( termId ) ) {
            return commission?.items[ termId ][ commissionType ];
        }

        return commission?.all?.[ commissionType ];
    };

    const unFormatValue = ( value: string ) => {
        if ( value === '' ) {
            return value;
        }

        if ( window.accounting ) {
            return String(
                window.accounting.unformat( value, currency?.decimal || '.' )
            );
        }

        return String( value ).replace( /[^0-9.-]/g, '' );
    };

    const formatValue = ( value: string ) => {
        if ( value === '' ) {
            return value;
        }

        return window.accounting.formatNumber(
            value,
            currency?.precision,
            currency?.thousand,
            currency?.decimal
        );
    };

    const validatePercentage = ( percentage: string ) => {
        if ( percentage === '' ) {
            return percentage;
        }

        const numVal = Number( percentage );
        if ( numVal < 0 || numVal > 100 ) {
            return '';
        }

        return percentage;
    };

    const handleCommissionItemChange = debounce(
        (
            value: string,
            commissionType: 'percentage' | 'flat',
            termId: string | number
        ) => {
            if ( commissionType === 'percentage' ) {
                value = validatePercentage( unFormatValue( value ) );
            } else {
                value = unFormatValue( value );
            }

            setCommission( ( prevCommission ) => {
                const newCommission = { ...prevCommission };
                const commissions = { ...newCommission?.items };

                let data = { ...newCommission?.all } || {
                    flat: '',
                    percentage: '',
                };

                if ( commissions.hasOwnProperty( termId ) ) {
                    data = { ...commissions[ termId ] };
                }

                data[ commissionType ] = value;
                commissions[ termId ] = data;

                newCommission.items = commissions;

                if ( resetSubCategory ) {
                    // Update child categories if resetSubCategory is true.
                    const allNestedChildrenIds = getChildren( termId );
                    allNestedChildrenIds.forEach( ( id ) => {
                        newCommission.items[ id ] = { ...data };
                    } );
                }

                return newCommission;
            } );

            if ( onValueChange ) {
                onValueChange( {
                    ...commission,
                    items: {
                        ...commission?.items,
                        [ termId ]: {
                            ...( commission?.items?.[ termId ] ||
                                commission?.all ),
                            [ commissionType ]: value,
                        },
                    },
                } );
            }
        },
        700
    );

    const handleAllCategoryChange = debounce(
        ( value: string, commissionType: 'percentage' | 'flat' ) => {
            if ( commissionType === 'percentage' ) {
                value = validatePercentage( unFormatValue( value ) );
            } else {
                value = unFormatValue( value );
            }

            setCommission( ( prevCommission ) => {
                const newCommission = { ...prevCommission };
                newCommission.all = {
                    ...newCommission?.all,
                    [ commissionType ]: value,
                };

                if ( resetSubCategory ) {
                    newCommission.items = {};
                }

                return newCommission;
            } );

            if ( onValueChange ) {
                onValueChange( {
                    ...commission,
                    all: { ...commission?.all, [ commissionType ]: value },
                    items: resetSubCategory ? {} : commission?.items,
                } );
            }
        },
        700
    );

    const handleToggle = ( id: string | number ) => {
        setExpandedIds( ( prev ) =>
            prev.includes( id )
                ? prev.filter( ( eid ) => eid !== id )
                : [ ...prev, id ]
        );
    };

    const renderCategoryRow = ( cat: Category, level = 0 ) => {
        const hasChildren = !! cat.children && cat.children.length > 0;
        const isExpanded = expandedIds.includes( cat.term_id );
        const isAllCategory = cat.term_id === 'all';
        const getCurrencySymbol = currency.symbol;

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

            return <SquarePlus className={ 'opacity-50 cursor-not-allowed' } />;
        };

        return (
            <div
                key={ cat.term_id }
                className="bg-white border-b border-[#E9E9E9] h-20"
            >
                <div className="h-20 w-full flex items-center px-5">
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
                                    handleToggle( cat.term_id );
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
                                { isAllCategory
                                    ? __( 'All Category', 'dokan-lite' )
                                    : cat.name }
                            </span>
                            <span className="ml-2 text-xs text-[#A5A5AA] bg-[#F1F1F4] px-2 py-0.5 rounded">
                                { sprintf(
                                    __( '#%s', 'dokan-lite' ),
                                    cat.term_id
                                ) }
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
                                    value={ formatValue(
                                        getCommissionValue(
                                            'percentage',
                                            cat.term_id
                                        ) || ''
                                    ) }
                                    addOnRight={
                                        <span className="text-[#575757] text-sm">
                                            %
                                        </span>
                                    }
                                    onChange={ ( e ) =>
                                        isAllCategory
                                            ? handleAllCategoryChange(
                                                  e.target.value,
                                                  'percentage'
                                              )
                                            : handleCommissionItemChange(
                                                  e.target.value,
                                                  'percentage',
                                                  cat.term_id
                                              )
                                    }
                                    className={ `w-full h-10 pl-6 pr-8 text-sm border ${
                                        cat.term_id === 23
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
                                    value={ formatValue(
                                        getCommissionValue(
                                            'flat',
                                            cat.term_id
                                        ) || ''
                                    ) }
                                    onChange={ ( e ) =>
                                        isAllCategory
                                            ? handleAllCategoryChange(
                                                  e.target.value,
                                                  'flat'
                                              )
                                            : handleCommissionItemChange(
                                                  e.target.value,
                                                  'flat',
                                                  cat.term_id
                                              )
                                    }
                                    maskRule={ {
                                        numeral: true,
                                        delimiter: currency.thousand,
                                        numeralDecimalMark: currency.decimal,
                                        numeralDecimalScale: currency.precision,
                                    } }
                                    className={ `w-full h-10 pl-6 pr-3 text-sm border ${
                                        cat.term_id === 23
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
            expandedIds.includes( cat.term_id )
                ? renderCategories( cat.children, level + 1 )
                : null,
        ] );

    const categoriesList = getCategories( categories );

    return (
        <div className="w-full bg-white border border-[#E9E9E9] rounded-lg overflow-hidden">
            { /* Header */ }
            <div className="bg-[#F8F8F8] border-b border-[#E9E9E9] h-16 flex items-center px-5">
                <div className="flex items-center">
                    <span className="font-semibold text-[14px] text-[#575757]">
                        { __( 'Category', 'dokan-lite' ) }
                    </span>
                </div>
                <div className="flex items-center ml-auto gap-3">
                    <div className="flex items-center">
                        <div className="w-[142px]">
                            <span className="font-semibold text-[14px] text-[#575757]">
                                { __( 'Percentage (%)', 'dokan-lite' ) }
                            </span>
                        </div>
                        <div className="mx-2 w-4"></div>
                        <div className="w-[120px]">
                            <span className="font-semibold text-[14px] text-[#575757]">
                                { __( 'Fixed Amount', 'dokan-lite' ) }
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            { /* Categories List */ }
            <div className="border-t border-[#E9E9E9]">
                { renderCategoryRow( {
                    term_id: 'all',
                    name: 'All Category',
                    parent_id: '0',
                    parents: [],
                    children: [],
                } ) }
                { allCategoryOpen && renderCategories( categoriesList ) }
            </div>
        </div>
    );
};

export default CategoryCommissionWrapper;
