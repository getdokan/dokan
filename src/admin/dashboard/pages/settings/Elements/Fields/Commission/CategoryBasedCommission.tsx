import React, { useCallback, useMemo, useState } from '@wordpress/element';
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
    children: Category[];
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

interface SettingsProps {
    element: any;
    onValueChange: ( value: any ) => void;
}

interface SettingsElement {
    hook_key: string;
    children?: SettingsElement[];
    display?: boolean;
    value?: any;
    categories?: { [ key: string ]: Category };
}

// Extend Window interface for accounting library
declare global {
    interface Window {
        accounting: {
            unformat: ( value: string, decimal?: string ) => number;
            formatNumber: (
                value: string | number,
                precision?: number,
                thousand?: string,
                decimal?: string
            ) => string;
        };
    }
}

// Declare adminWithdrawData as a global variable
declare const adminWithdrawData: {
    currency: {
        symbol: string;
        thousand: string;
        decimal: string;
        precision: number;
    };
};

// Selector functions
const getSettingInChildren = (
    id: string,
    settings: SettingsElement[]
): SettingsElement | undefined => {
    for ( const setting of settings ) {
        if ( setting.hook_key === id ) {
            return setting;
        }
        if ( setting.children ) {
            const found = getSettingInChildren( id, setting.children );
            if ( found ) {
                return found;
            }
        }
    }
    return undefined;
};

export const getSettingById = (
    id: string,
    settings: SettingsElement[]
): SettingsElement | undefined => {
    return getSettingInChildren( id, settings );
};

const defaultCommission = { percentage: '0', flat: '2500' };

const CategoryBasedCommission = ( {
    element,
    onValueChange,
}: SettingsProps ) => {
    // Initialize commission state with proper memoization
    const initialCommission = useMemo( (): CommissionValues => {
        const commissionValues = element?.value || {};
        if ( Object.keys( commissionValues ).length > 0 ) {
            return commissionValues;
        }
        return {
            all: { ...defaultCommission },
            items: {},
        };
    }, [ element?.value ] );

    const [ commission, setCommission ] =
        useState< CommissionValues >( initialCommission );
    const [ expandedIds, setExpandedIds ] = useState<
        Array< string | number >
    >( [] );
    const [ allCategoryOpen, setAllCategoryOpen ] = useState( false );

    const { currency } = adminWithdrawData;
    const getCurrencySymbol = currency?.symbol;

    // Memoize categories to avoid dependency issues
    const categories = useMemo(
        () => element?.categories || {},
        [ element?.categories ]
    );

    // For now, use a default value since the SettingsElement doesn't have a value property
    const resetSubCategoryValue = false;

    // Fixed category building function
    const getCategories = useCallback(
        ( categoriesData: { [ key: string ]: Category } ) => {
            const result: Category[] = [];
            const categoryMap: { [ key: string ]: Category } = {};

            // First, create a map of all categories with empty children arrays
            for ( const termId in categoriesData ) {
                const category = categoriesData[ termId ];
                categoryMap[ termId ] = {
                    ...category,
                    children: [],
                };
            }

            // Build the nested structure - handle both parent_id and parents array
            for ( const termId in categoryMap ) {
                const category = categoryMap[ termId ];

                // Check if this is a top-level category
                const isTopLevel =
                    category.parent_id === '0' ||
                    category.parent_id === 0 ||
                    ! category.parent_id ||
                    ( category.parents && category.parents.length === 0 );

                if ( isTopLevel ) {
                    // This is a top-level category
                    result.push( category );
                } else {
                    // This is a child category - find its parent
                    const parentId = category.parent_id;
                    const parent = categoryMap[ parentId ];

                    if ( parent ) {
                        parent.children.push( category );
                    } else {
                        // If parent not found, treat as top-level
                        result.push( category );
                    }
                }
            }

            // Sort categories by name for consistent ordering
            const sortCategories = ( cats: Category[] ): Category[] => {
                return cats
                    .sort( ( a, b ) => a.name.localeCompare( b.name ) )
                    .map( ( cat ) => ( {
                        ...cat,
                        children: sortCategories( cat.children ),
                    } ) );
            };

            return sortCategories( result );
        },
        []
    );

    const getChildren = useCallback(
        ( parentId: string | number ) => {
            const categoriesArray = Object.values( categories );
            const children = categoriesArray.filter( ( item: any ) => {
                return (
                    item?.parent_id === parentId ||
                    item?.parents?.includes( Number( parentId ) )
                );
            } );
            return children.map( ( item: any ) => item?.term_id );
        },
        [ categories ]
    );

    const getCommissionValue = useCallback(
        ( commissionType: 'percentage' | 'flat', termId: string | number ) => {
            if ( commission?.items?.hasOwnProperty( termId ) ) {
                return commission?.items[ termId ][ commissionType ];
            }
            return commission?.all?.[ commissionType ];
        },
        [ commission ]
    );

    const unFormatValue = useCallback(
        ( inputValue: string ) => {
            if ( inputValue === '' ) {
                return inputValue;
            }

            if ( window.accounting ) {
                return String(
                    window.accounting.unformat(
                        inputValue,
                        currency?.decimal || '.'
                    )
                );
            }

            return String( inputValue ).replace( /[^0-9.-]/g, '' );
        },
        [ currency?.decimal ]
    );

    const formatValue = useCallback(
        ( inputValue: string ) => {
            if ( inputValue === '' ) {
                return inputValue;
            }

            if ( ! window.accounting ) {
                return inputValue;
            }

            return window.accounting.formatNumber(
                inputValue,
                currency?.precision,
                currency?.thousand,
                currency?.decimal
            );
        },
        [ currency?.precision, currency?.thousand, currency?.decimal ]
    );

    const validatePercentage = useCallback( ( percentage: string ) => {
        if ( percentage === '' ) {
            return percentage;
        }

        const numVal = Number( percentage );
        if ( numVal < 0 || numVal > 100 ) {
            return '';
        }

        return percentage;
    }, [] );

    const isEqual = useCallback( ( value1: any, value2: any ): boolean => {
        if ( value1 === value2 ) {
            return true;
        }

        if (
            value1 === null ||
            value2 === null ||
            value1 === undefined ||
            value2 === undefined
        ) {
            return false;
        }

        if ( typeof value1 !== typeof value2 ) {
            return false;
        }

        if ( typeof value1 === 'object' && typeof value2 === 'object' ) {
            const keys1 = Object.keys( value1 );
            const keys2 = Object.keys( value2 );

            if ( keys1.length !== keys2.length ) {
                return false;
            }

            for ( const key of keys1 ) {
                if ( ! keys2.includes( key ) ) {
                    return false;
                }
                if ( ! isEqual( value1[ key ], value2[ key ] ) ) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }, [] );

    // Optimized debounced change handler
    const debouncedValueChange = useMemo(
        () =>
            debounce( ( ...args: unknown[] ) => {
                const updatedCommission = args[ 0 ] as CommissionValues;
                onValueChange( {
                    ...element,
                    value: updatedCommission,
                } );
            }, 500 ) as ( updatedCommission: CommissionValues ) => void,
        [ onValueChange, element ]
    );

    // Handle commission changes with immediate local update and debounced parent update
    const handleCommissionChange = useCallback(
        (
            inputValue: string,
            commissionType: 'percentage' | 'flat',
            termId: string | number
        ) => {
            let processedValue = inputValue;
            if ( commissionType === 'percentage' ) {
                processedValue = validatePercentage(
                    unFormatValue( inputValue )
                );
            } else {
                processedValue = unFormatValue( inputValue );
            }

            setCommission( ( prevCommission ) => {
                const newCommission = { ...prevCommission };
                const commissions = newCommission?.items
                    ? { ...newCommission.items }
                    : {};

                let data: { percentage: string; flat: string } =
                    resetSubCategoryValue
                        ? {
                              percentage: newCommission?.all?.percentage || '',
                              flat: newCommission?.all?.flat || '',
                          }
                        : { flat: '', percentage: '' };

                if ( commissions.hasOwnProperty( termId ) ) {
                    data = {
                        percentage: commissions[ termId ]?.percentage || '',
                        flat: commissions[ termId ]?.flat || '',
                    };
                }

                data[ commissionType ] = processedValue;
                commissions[ termId ] = data;

                newCommission.items = commissions;

                if ( resetSubCategoryValue ) {
                    const allNestedChildrenIds = getChildren( termId );
                    allNestedChildrenIds.forEach( ( id ) => {
                        if ( newCommission.items ) {
                            newCommission.items[ id ] = { ...data };
                        }
                    } );
                }

                // Remove categories with same values as 'all'
                if ( newCommission.items && newCommission.all ) {
                    Object.keys( newCommission.items ).forEach( ( key ) => {
                        if (
                            isEqual(
                                newCommission.items![ key ],
                                newCommission.all
                            )
                        ) {
                            delete newCommission.items![ key ];
                        }
                    } );
                }

                // Debounce the parent update
                debouncedValueChange( newCommission );

                return newCommission;
            } );
        },
        [
            resetSubCategoryValue,
            getChildren,
            isEqual,
            debouncedValueChange,
            validatePercentage,
            unFormatValue,
        ]
    );

    // Handle all category changes
    const handleAllCategoryChange = useCallback(
        ( inputValue: string, commissionType: 'percentage' | 'flat' ) => {
            let processedValue = inputValue;
            if ( commissionType === 'percentage' ) {
                processedValue = validatePercentage(
                    unFormatValue( inputValue )
                );
            } else {
                processedValue = unFormatValue( inputValue );
            }

            setCommission( ( prevCommission ) => {
                const newCommission = { ...prevCommission };
                newCommission.all = {
                    percentage: newCommission?.all?.percentage || '',
                    flat: newCommission?.all?.flat || '',
                    [ commissionType ]: processedValue,
                };

                if ( resetSubCategoryValue ) {
                    newCommission.items = {};
                }

                // Debounce the parent update
                debouncedValueChange( newCommission );

                return newCommission;
            } );
        },
        [
            resetSubCategoryValue,
            debouncedValueChange,
            validatePercentage,
            unFormatValue,
        ]
    );

    // Handle blur events for immediate updates
    const handleBlur = useCallback(
        (
            inputValue: string,
            commissionType: 'percentage' | 'flat',
            termId: string | number,
            isAllCategory: boolean = false
        ) => {
            if ( isAllCategory ) {
                handleAllCategoryChange( inputValue, commissionType );
            } else {
                handleCommissionChange( inputValue, commissionType, termId );
            }
        },
        [ handleAllCategoryChange, handleCommissionChange ]
    );

    const handleToggle = useCallback( ( id: string | number ) => {
        setExpandedIds( ( prev ) =>
            prev.includes( id )
                ? prev.filter( ( eid ) => eid !== id )
                : [ ...prev, id ]
        );
    }, [] );

    const renderCategoryRow = useCallback(
        ( cat: Category, level = 0 ) => {
            const hasChildren = !! cat.children && cat.children.length > 0;
            const isExpanded = expandedIds.includes( cat.term_id );
            const isAllCategory = cat.term_id === 'all';

            const renderIcon = () => {
                if ( isAllCategory ) {
                    return allCategoryOpen ? (
                        <SquareMinus color="#7047EB" />
                    ) : (
                        <SquarePlus />
                    );
                }

                if ( hasChildren ) {
                    if ( isExpanded ) {
                        return <SquareMinus color="#7047EB" />;
                    }
                    return <SquarePlus />;
                }

                return (
                    <SquarePlus className={ 'opacity-50 cursor-not-allowed' } />
                );
            };

            return (
                <div
                    key={ `${ cat.term_id }-${ level }` }
                    className="bg-white border-b border-[#E9E9E9] h-20"
                >
                    <div className="h-20 w-full flex items-center px-5">
                        <div
                            className="flex items-center"
                            style={ { paddingLeft: `${ level * 24 }px` } }
                        >
                            <button
                                type="button"
                                className={ `mr-3 p-1 text-[#828282] hover:text-[#575757] focus:!outline-none rounded transition-colors duration-150 ${
                                    ! hasChildren && ! isAllCategory
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                }` }
                                onClick={ () => {
                                    if ( isAllCategory ) {
                                        setAllCategoryOpen(
                                            ( prev ) => ! prev
                                        );
                                    } else if ( hasChildren ) {
                                        handleToggle( cat.term_id );
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
                                        /* translators: %s: category ID */
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
                                        onChange={ ( e ) => {
                                            // Immediate local state update for better UX
                                            const value = e.target.value;
                                            if ( isAllCategory ) {
                                                setCommission( ( prev ) => ( {
                                                    ...prev,
                                                    all: {
                                                        percentage: value,
                                                        flat:
                                                            prev.all?.flat ||
                                                            '',
                                                    },
                                                } ) );
                                            } else {
                                                setCommission( ( prev ) => ( {
                                                    ...prev,
                                                    items: {
                                                        ...prev.items,
                                                        [ cat.term_id ]: {
                                                            percentage: value,
                                                            flat:
                                                                prev.items?.[
                                                                    cat.term_id
                                                                ]?.flat || '',
                                                        },
                                                    },
                                                } ) );
                                            }
                                        } }
                                        onBlur={ ( e ) =>
                                            handleBlur(
                                                e.target.value,
                                                'percentage',
                                                cat.term_id,
                                                isAllCategory
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
                                        onChange={ ( e ) => {
                                            // Immediate local state update for better UX
                                            const value = e.target.value;
                                            if ( isAllCategory ) {
                                                setCommission( ( prev ) => ( {
                                                    ...prev,
                                                    all: {
                                                        ...prev.all,
                                                        flat: value,
                                                        percentage:
                                                            prev.all
                                                                ?.percentage ||
                                                            '',
                                                    },
                                                } ) );
                                            } else {
                                                setCommission( ( prev ) => ( {
                                                    ...prev,
                                                    items: {
                                                        ...prev.items,
                                                        [ cat.term_id ]: {
                                                            ...prev.items?.[
                                                                cat.term_id
                                                            ],
                                                            flat: value,
                                                            percentage:
                                                                prev.items?.[
                                                                    cat.term_id
                                                                ]?.percentage ||
                                                                '',
                                                        },
                                                    },
                                                } ) );
                                            }
                                        } }
                                        onBlur={ ( e ) =>
                                            handleBlur(
                                                e.target.value,
                                                'flat',
                                                cat.term_id,
                                                isAllCategory
                                            )
                                        }
                                        maskRule={ {
                                            numeral: true,
                                            delimiter: currency.thousand,
                                            numeralDecimalMark:
                                                currency.decimal,
                                            numeralDecimalScale:
                                                currency.precision,
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
        },
        [
            expandedIds,
            allCategoryOpen,
            handleToggle,
            getCommissionValue,
            formatValue,
            handleBlur,
            getCurrencySymbol,
            currency,
        ]
    );

    const renderCategories = useCallback(
        ( cats: Category[], level = 0 ): JSX.Element[] => {
            const result: JSX.Element[] = [];

            cats.forEach( ( cat ) => {
                // Render the current category
                result.push( renderCategoryRow( cat, level ) );

                // Render children if expanded and has children
                if (
                    cat.children &&
                    cat.children.length > 0 &&
                    expandedIds.includes( cat.term_id )
                ) {
                    // Recursively render children with increased level
                    result.push(
                        ...renderCategories( cat.children, level + 1 )
                    );
                }
            } );

            return result;
        },
        [ renderCategoryRow, expandedIds ]
    );

    const categoriesList = useMemo(
        () => getCategories( categories ),
        [ getCategories, categories ]
    );

    if ( ! element.display ) {
        return null;
    }

    return (
        <div className="w-full overflow-auto">
            { /* Header */ }
            <div className="h-16 flex items-center px-5">
                <div className="flex items-center">
                    <span className="font-normal text-xs text-[#828282] uppercase">
                        { __( 'Category Title', 'dokan-lite' ) }
                    </span>
                </div>
                <div className="flex items-center ml-auto gap-3">
                    <div className="flex items-center">
                        <div className="w-[142px]">
                            <span className="font-normal text-xs text-[#828282] uppercase">
                                { __( 'Percentage', 'dokan-lite' ) }
                            </span>
                        </div>
                        <div className="mx-2 w-4"></div>
                        <div className="w-[120px]">
                            <span className="font-normal text-xs text-[#828282] uppercase">
                                { __( 'Flat', 'dokan-lite' ) }
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

export default CategoryBasedCommission;
