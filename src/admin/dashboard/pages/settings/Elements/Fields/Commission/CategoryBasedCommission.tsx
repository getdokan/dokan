import { useCallback, useMemo, useState } from '@wordpress/element';
import { debounce } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { SETTINGS_STORE } from '../../../../../../../stores/adminSettings';
import CommissionHeader from './CommissionHeader';
import CategoryRow from './CategoryRow';
import CategoryTree from './CategoryTree';
import { __ } from '@wordpress/i18n';
import {
    CommissionInputsProps,
    CommissionValues,
    SettingsElement,
    SettingsProps,
} from './types';
import {
    buildCategoriesTree,
    defaultCommission,
    formatValue,
    getAllNestedChildren,
    getCommissionValue,
    isEqual,
    unFormatValue,
    validatePercentage,
} from './utils';

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

    // Memoize categories to avoid dependency issues
    const categories = useMemo(
        () => element?.categories || {},
        [ element?.categories ]
    );

    // For now, use a default value since the SettingsElement doesn't have a value property
    const resetSubCategoryValue = useSelect( ( select: any ) => {
        const store = select( SETTINGS_STORE );
        if ( store && store.getSettingById ) {
            const setting = store.getSettingById(
                'dokan_settings_transaction_commission_commission_reset_sub_category_when_edit_all_category'
            );
            return setting?.value === 'on';
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

    // Handle commission changes with proper nested state management (real-time)
    const handleCommissionChange = useCallback(
        (
            inputValue: string,
            commissionType: 'percentage' | 'flat',
            termId: string | number,
            shouldDebounce: boolean = true
        ) => {
            let processedValue = inputValue;
            if ( commissionType === 'percentage' ) {
                processedValue = validatePercentage(
                    unFormatValue( inputValue, currency )
                );
            } else {
                processedValue = unFormatValue( inputValue, currency );
            }

            setCommission( ( prevCommission ) => {
                const newCommission = { ...prevCommission };

                // Ensure items object exists
                if ( ! newCommission.items ) {
                    newCommission.items = {};
                }

                const commissions = { ...newCommission.items };

                // Get existing data for this category or create new
                let categoryData: { percentage: string; flat: string };

                if ( commissions.hasOwnProperty( termId ) ) {
                    categoryData = {
                        percentage: commissions[ termId ]?.percentage || '',
                        flat: commissions[ termId ]?.flat || '',
                    };
                } else if ( resetSubCategoryValue && newCommission.all ) {
                    // If reset is enabled, inherit from 'all' category
                    categoryData = {
                        percentage: newCommission.all.percentage || '',
                        flat: newCommission.all.flat || '',
                    };
                } else {
                    // Default empty values
                    categoryData = { percentage: '', flat: '' };
                }

                // Update the specific field
                categoryData[ commissionType ] = processedValue;
                commissions[ termId ] = categoryData;
                newCommission.items = commissions;

                // If resetSubCategoryValue is enabled, update all nested children
                if ( resetSubCategoryValue ) {
                    const allNestedChildrenIds = getAllNestedChildren(
                        termId,
                        categories
                    );
                    allNestedChildrenIds.forEach( ( childId ) => {
                        if ( newCommission.items && childId !== termId ) {
                            newCommission.items[ childId ] = {
                                ...categoryData,
                            };
                        }
                    } );
                }

                // Clean up: Remove categories with same values as 'all'
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

                // Update parent with or without debounce
                if ( shouldDebounce ) {
                    debouncedValueChange( newCommission );
                } else {
                    onValueChange( {
                        ...element,
                        value: newCommission,
                    } );
                }

                return newCommission;
            } );
        },
        [
            resetSubCategoryValue,
            categories,
            debouncedValueChange,
            onValueChange,
            element,
            currency,
        ]
    );

    // Handle all category changes with proper nested updates (real-time)
    const handleAllCategoryChange = useCallback(
        (
            inputValue: string,
            commissionType: 'percentage' | 'flat',
            shouldDebounce: boolean = true
        ) => {
            let processedValue = inputValue;
            if ( commissionType === 'percentage' ) {
                processedValue = validatePercentage(
                    unFormatValue( inputValue, currency )
                );
            } else {
                processedValue = unFormatValue( inputValue, currency );
            }

            setCommission( ( prevCommission ) => {
                const newCommission = { ...prevCommission };

                // Ensure 'all' object exists
                if ( ! newCommission.all ) {
                    newCommission.all = { percentage: '', flat: '' };
                }

                // Update the 'all' category
                newCommission.all = {
                    percentage: newCommission.all.percentage || '',
                    flat: newCommission.all.flat || '',
                    [ commissionType ]: processedValue,
                };

                // If resetSubCategoryValue is enabled, clear all specific category settings
                if ( resetSubCategoryValue ) {
                    newCommission.items = {};
                }

                // Update parent with or without debounce
                if ( shouldDebounce ) {
                    debouncedValueChange( newCommission );
                } else {
                    onValueChange( {
                        ...element,
                        value: newCommission,
                    } );
                }

                return newCommission;
            } );
        },
        [
            resetSubCategoryValue,
            debouncedValueChange,
            onValueChange,
            element,
            currency,
        ]
    );

    // Handle blur events for final validation and immediate saves
    const handleBlur = useCallback(
        (
            inputValue: string,
            commissionType: 'percentage' | 'flat',
            termId: string | number,
            isAllCategory: boolean = false
        ) => {
            // On blur, trigger immediate save without debounce for final validation
            if ( isAllCategory ) {
                handleAllCategoryChange( inputValue, commissionType, false );
            } else {
                handleCommissionChange(
                    inputValue,
                    commissionType,
                    termId,
                    false
                );
            }
        },
        [ handleAllCategoryChange, handleCommissionChange ]
    );

    const handleToggle = useCallback( ( id: string | number ) => {
        if ( id === 'all' ) {
            setAllCategoryOpen( ( prev ) => ! prev );
        } else {
            setExpandedIds( ( prev ) =>
                prev.includes( id )
                    ? prev.filter( ( eid ) => eid !== id )
                    : [ ...prev, id ]
            );
        }
    }, [] );

    const getCommissionValueCallback = useCallback(
        ( commissionType: 'percentage' | 'flat', termId: string | number ) => {
            return getCommissionValue( commission, commissionType, termId );
        },
        [ commission ]
    );

    const formatValueCallback = useCallback(
        ( inputValue: string ) => {
            return formatValue( inputValue, currency );
        },
        [ currency ]
    );

    const commissionInputsProps: CommissionInputsProps = {
        categoryId: '',
        onCommissionChange: handleCommissionChange,
        onAllCategoryChange: handleAllCategoryChange,
        onBlur: handleBlur,
        getCommissionValue: getCommissionValueCallback,
        formatValue: formatValueCallback,
        currency,
    };

    const categoriesList = useMemo(
        () => buildCategoriesTree( categories ),
        [ categories ]
    );

    if ( ! element.display ) {
        return null;
    }

    return (
        <div className="w-full bg-white  overflow-auto">
            <CommissionHeader />
            <div className="border-t border-[#E9E9E9]">
                <CategoryRow
                    category={ {
                        term_id: 'all',
                        name: __( 'All Categories', 'dokan-lite' ),
                        parent_id: '0',
                        parents: [],
                        children: [],
                    } }
                    level={ 0 }
                    isExpanded={ allCategoryOpen }
                    hasChildren={ categoriesList.length > 0 }
                    onToggle={ handleToggle }
                    commissionInputsProps={ commissionInputsProps }
                />
                { allCategoryOpen && (
                    <CategoryTree
                        categories={ categoriesList }
                        expandedIds={ expandedIds }
                        onToggle={ handleToggle }
                        commissionInputsProps={ commissionInputsProps }
                    />
                ) }
            </div>
        </div>
    );
};

export default CategoryBasedCommission;
