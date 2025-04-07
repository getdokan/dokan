import { RawHTML, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { MaskedInput } from '@getdokan/dokan-ui';
import { debounce } from '@wordpress/compose';
import { SettingsProps } from '../../../StepSettings';

const CategoryBasedCommission = ( {
    element,
    onValueChange,
    getSetting,
}: SettingsProps ) => {
    const { currency } = adminWithdrawData;
    const getCurrencySymbol = currency?.symbol;

    const testSettings = getSetting(
        'dokan_admin_onboarding_setup_step_commission_commission_reset_sub_category_when_edit_all_category'
    );

    console.log( 'testSettings', testSettings );

    const getCategories = ( categoriesData ) => {
        const result = [];
        const categoryMap = {};

        for ( const term_id in categoriesData ) {
            categoryMap[ term_id ] = categoriesData[ term_id ];
        }

        for ( const term_id in categoryMap ) {
            // Re-arrange categories.
            const category = categoryMap[ term_id ];

            if ( category.parent_id !== '0' ) {
                const parent = categoryMap[ category.parent_id ];
                const parentIndex = result.indexOf( parent );

                result.splice( parentIndex + 1, 0, category ); // Insert the child category right after its parent.
            } else {
                result.push( category ); // Insert the child category right after its parent.
            }
        }

        return result;
    };

    const categories = element?.categories || {};
    const commissionValues = element?.value || {};
    const resetCategoryVal = element?.reset_subcategory || 'on';
    const renderCategories = Object.values( getCategories( categories ) );
    const hasCommissionItems = Object.values(
        commissionValues?.items || {}
    ).length;
    const resetSubCategory = resetCategoryVal !== 'off';

    const [ openRows, setOpenRows ] = useState( [] );
    const [ commission, setCommission ] = useState( { ...commissionValues } );
    const [ allCategoryEnabled, setAllCategoryEnabled ] = useState(
        ! hasCommissionItems
    );

    const catRowClick = ( item ) => {
        const termId = Number( item?.term_id );

        if ( openRows.includes( termId ) ) {
            setOpenRows( ( prevRows ) => {
                const newRows = [ ...prevRows ];
                const index = newRows.indexOf( termId );
                newRows.splice( index, 1 );

                getChildren( item?.term_id ).forEach( ( child ) => {
                    const childIndex = newRows.indexOf( Number( child ) );
                    if ( childIndex !== -1 ) {
                        newRows.splice( childIndex, 1 );
                    }
                } );

                return newRows;
            } );
        } else {
            setOpenRows( ( prevRows ) => [ ...prevRows, termId ] );
        }
    };

    const getChildren = ( parentId ) => {
        const categoriesArray = Object.values( categories );

        const children = categoriesArray.filter( ( item ) => {
            return item?.parents?.includes( Number( parentId ) );
        } );

        return children.map( ( item ) => item?.term_id );
    };

    const showCatRow = ( item ) => {
        if ( Number( item?.parent_id ) === 0 ) {
            return true;
        }

        return openRows.includes( Number( item?.parent_id ) );
    };

    const getCommissionValue = ( commissionType, termId ) => {
        if ( commission?.items?.hasOwnProperty( termId ) ) {
            return commission?.items[ termId ][ commissionType ];
        }

        return commission?.all?.[ commissionType ];
    };

    const handleCommissionItemChange = debounce(
        ( value, commissionType, termId ) => {
            if ( commissionType === 'percentage' ) {
                value = validatePercentage( unFormatValue( value ) );
            } else {
                value = unFormatValue( value );
            }

            setCommission( ( prevCommission ) => {
                const newCommission = { ...prevCommission };
                const commissions = { ...newCommission?.items };

                let data = resetSubCategory
                    ? { ...newCommission?.all }
                    : { flat: '', percentage: '' };

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

                Object.keys( newCommission?.items ).forEach( ( key ) => {
                    // Remove categories with same values as 'all'.
                    if (
                        isEqual(
                            newCommission?.items[ key ],
                            newCommission?.all
                        )
                    ) {
                        delete newCommission?.items[ key ];
                    }
                } );

                return newCommission;
            } );

            onValueChange( {
                ...element,
                value: {
                    ...commission,
                    items: {
                        ...commission?.items,
                        [ termId ]: {
                            ...( commission?.items?.[ termId ] ||
                                commission?.all ),
                            [ commissionType ]: value,
                        },
                    },
                },
            } );
        },
        700
    );

    // Handle all category commission change
    const handleAllCategoryChange = debounce( ( value, commissionType ) => {
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

        onValueChange( {
            ...element,
            value: {
                ...commission,
                all: { ...commission?.all, [ commissionType ]: value },
                items: resetSubCategory ? {} : commission?.items,
            },
        } );
    }, 700 );

    const unFormatValue = ( value ) => {
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

    const formatValue = ( value ) => {
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

    const validatePercentage = ( percentage ) => {
        if ( percentage === '' ) {
            return percentage;
        }

        const numVal = Number( percentage );
        if ( numVal < 0 || numVal > 100 ) {
            return '';
        }

        return percentage;
    };

    // Check if two objects are equal
    const isEqual = ( value1, value2 ) => {
        if ( value1 === value2 ) {
            return true;
        } // Check if the values are strictly equal

        if ( value1 == null || value2 == null ) {
            return false;
        } // Check if either value is null or undefined

        if ( typeof value1 !== typeof value2 ) {
            return false;
        } // Check if the types are different

        if ( typeof value1 === 'object' && typeof value2 === 'object' ) {
            // Handle plain objects
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

        return false; // For all other types, return false
    };

    if ( ! element.display ) {
        return null;
    }

    return (
        <div
            className="p-4 flex flex-col gap-y-4"
            id={ element.hook_key + '_div' }
        >
            { ( element?.title || element?.description ) && (
                <div className="flex-col flex gap-1">
                    <h2 className="text-sm leading-6 font-semibold text-gray-900">
                        { element?.title }
                    </h2>
                    <p className="text-sm font-normal text-[#828282]">
                        { element?.description }
                    </p>
                </div>
            ) }

            <div className="relative">
                <div className="hidden md:flex bg-gray-100 min-h-[3rem] text-gray-500 border-[0.957434px] border-b-0 items-center">
                    <div className="w-1/2 pl-3 flex h-[3rem] items-center border-r-[0.957434px]">
                        <p className="text-xs">
                            { __( 'Category', 'dokan-lite' ) }
                        </p>
                    </div>
                    <div className="flex w-1/2">
                        <div className="w-1/2 mr-20">
                            <p className="text-xs text-center">
                                { __( 'Percentage', 'dokan-lite' ) }
                            </p>
                        </div>
                        <div className="w-1/2">
                            <p className="text-xs text-center">
                                { __( 'Flat', 'dokan-lite' ) }
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className={ `flex flex-col max-h-[500px] overflow-y-auto border-[1px] md:text-[14px] text-sm  border-[#e9e9ea] border-solid ${
                        ! allCategoryEnabled ? 'border-b-[1px]' : 'border-b-0'
                    }` }
                >
                    { /* All Categories Row */ }
                    <div className="flex  flex-col md:!flex-row divide-y  border-b-[1px] border-[#e9e9ea] border-solid  ">
                        <div className="flex flex-row md:w-1/2 w-full items-center min-h-[3rem] border-0 border-r-[1px] pl-[5px]">
                            <button
                                type="button"
                                className="p-1 bg-transparent border-none cursor-pointer"
                                onClick={ () =>
                                    setAllCategoryEnabled(
                                        ! allCategoryEnabled
                                    )
                                }
                            >
                                <i
                                    className={ `far ${
                                        ! allCategoryEnabled
                                            ? 'fa-minus-square text-black'
                                            : 'fa-plus-square text-[#4C19E6]'
                                    }` }
                                ></i>
                            </button>
                            <p className="text-[14px] md:font-regular font-semibold m-0">
                                { __( 'All Categories', 'dokan-lite' ) }
                            </p>
                        </div>

                        <div className="flex flex-rowmd:w-1/2 w-full ">
                            <div className="w-1/2 flex justify-start items-center box-border">
                                <MaskedInput
                                    value={ formatValue(
                                        commission?.all?.percentage
                                    ) }
                                    onChange={ ( e ) =>
                                        handleAllCategoryChange(
                                            e.target.value,
                                            'percentage'
                                        )
                                    }
                                    maskRule={ {
                                        numeral: true,
                                        delimiter: currency?.thousand ?? ',',
                                        numeralDecimalMark:
                                            currency?.decimal ?? '.',
                                        numeralDecimalScale:
                                            currency?.precision ?? 2,
                                    } }
                                    className={ `px-4 border-0 shadow-none focus:ring-0` }
                                />
                                <div className="h-full border-l-[1px] border-r-[1px] flex justify-center items-center bg-gray-100">
                                    <span className="pl-2 pr-2">
                                        { __( '%', 'dokan-lite' ) }
                                    </span>
                                </div>
                            </div>
                            <div className="h-full border-l-[1px] border-r-[1px] -ml-1 md:border-0 bg-transparent flex justify-center items-center">
                                <span className="p-2">
                                    { __( '+', 'dokan-lite' ) }
                                </span>
                            </div>
                            <div className="w-1/2 flex justify-start items-center box-border">
                                <div className="h-full border-r-[1px] border-l-[1px] flex justify-center items-center bg-gray-100">
                                    <span className="pl-2 pr-2">
                                        { getCurrencySymbol }
                                    </span>
                                </div>
                                <MaskedInput
                                    // addOnLeft={ getCurrencySymbol }
                                    value={ formatValue(
                                        commission?.all?.flat
                                    ) }
                                    onChange={ ( e ) =>
                                        handleAllCategoryChange(
                                            e.target.value,
                                            'flat'
                                        )
                                    }
                                    maskRule={ {
                                        numeral: true,
                                        delimiter: currency?.thousand ?? ',',
                                        numeralDecimalMark:
                                            currency?.decimal ?? '.',
                                        numeralDecimalScale:
                                            currency?.precision ?? 2,
                                    } }
                                    className={ `px-4 border-0 shadow-none focus:ring-0` }
                                />
                            </div>
                        </div>
                    </div>

                    { /* Category Rows */ }
                    { ! allCategoryEnabled &&
                        renderCategories.map(
                            ( item, index ) =>
                                showCatRow( item ) && (
                                    <div
                                        key={ item.term_id }
                                        className="flex flex-col md:!flex-row divide-y  border-0 border-b-[1px] last:border-b-0 border-[#e9e9ea] border-solid"
                                    >
                                        <div className="md:w-1/2 w-full flex flex-row items-center min-h-[3rem] border-0 border-r-[1px] border-[#e9e9ea] border-solid pl-[5px]">
                                            <div className="flex h-1/2">
                                                { item.parents.map(
                                                    ( parentId ) => (
                                                        <span
                                                            key={ parentId }
                                                            className="bg-transparent block h-full w-[5px] md:w-[1px] ml-1"
                                                        ></span>
                                                    )
                                                ) }
                                            </div>
                                            <button
                                                type="button"
                                                className={ `p-1 bg-transparent border-none cursor-pointer ${
                                                    ! item.children.length
                                                        ? 'disabled:cursor-not-allowed text-gray-300'
                                                        : 'cursor-pointer text-[#4C19E6]'
                                                }` }
                                                onClick={ () =>
                                                    catRowClick( item )
                                                }
                                                disabled={
                                                    ! item.children.length
                                                }
                                            >
                                                <i
                                                    className={ `far ${
                                                        openRows.includes(
                                                            Number(
                                                                item.term_id
                                                            )
                                                        )
                                                            ? 'fa-minus-square text-black'
                                                            : 'fa-plus-square'
                                                    }` }
                                                ></i>
                                            </button>
                                            <p className="md:text-[14px] text-sm text-black m-0">
                                                <span
                                                    title={ item.name }
                                                    dangerouslySetInnerHTML={ {
                                                        __html: item.name,
                                                    } }
                                                ></span>
                                                <span
                                                    className="text-[12px] text-gray-500 ml-1"
                                                    title={ __(
                                                        'Category ID',
                                                        'dokan'
                                                    ) }
                                                >
                                                    { sprintf(
                                                        __( '#%s', 'dokan' ),
                                                        item.term_id
                                                    ) }
                                                </span>
                                            </p>
                                        </div>

                                        <div className="md:w-1/2 w-full flex min-h-[3rem] border-0 border-solid border-[#e9e9ea]">
                                            <div className="w-1/2 flex justify-start items-center box-border">
                                                <MaskedInput
                                                    // addOnLeft={ getCurrencySymbol }
                                                    value={ formatValue(
                                                        getCommissionValue(
                                                            'percentage',
                                                            item.term_id
                                                        )
                                                    ) }
                                                    onChange={ ( e ) =>
                                                        handleCommissionItemChange(
                                                            e.target.value,
                                                            'percentage',
                                                            item.term_id
                                                        )
                                                    }
                                                    maskRule={ {
                                                        numeral: true,
                                                        delimiter:
                                                            currency?.thousand ??
                                                            ',',
                                                        numeralDecimalMark:
                                                            currency?.decimal ??
                                                            '.',
                                                        numeralDecimalScale:
                                                            currency?.precision ??
                                                            2,
                                                    } }
                                                    className={ `px-4 border-0 shadow-none focus:ring-0` }
                                                />
                                                <div className="h-full border-l-[1px] border-r-[1px] flex justify-center items-center bg-gray-100">
                                                    <span className="pl-2 pr-2">
                                                        { __(
                                                            '%',
                                                            'dokan-lite'
                                                        ) }
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-full border-l-[1px] border-r-[1px] md:-ml-1 md:border-0 bg-transparent flex justify-center items-center">
                                                <span className="p-2">
                                                    { __( '+', 'dokan-lite' ) }
                                                </span>
                                            </div>
                                            <div className="w-1/2 flex justify-start items-center box-border">
                                                <div className="h-full border-r-[1px] border-l-[1px] flex justify-center items-center bg-gray-100">
                                                    <span className="pl-2 pr-2">
                                                        { getCurrencySymbol }
                                                    </span>
                                                </div>
                                                <MaskedInput
                                                    // addOnLeft={ getCurrencySymbol }
                                                    value={ formatValue(
                                                        getCommissionValue(
                                                            'flat',
                                                            item.term_id
                                                        )
                                                    ) }
                                                    onChange={ ( e ) =>
                                                        handleCommissionItemChange(
                                                            e.target.value,
                                                            'flat',
                                                            item.term_id
                                                        )
                                                    }
                                                    maskRule={ {
                                                        numeral: true,
                                                        delimiter:
                                                            currency?.thousand ??
                                                            ',',
                                                        numeralDecimalMark:
                                                            currency?.decimal ??
                                                            '.',
                                                        numeralDecimalScale:
                                                            currency?.precision ??
                                                            2,
                                                    } }
                                                    className={ `px-4 border-0 shadow-none focus:ring-0` }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                        ) }
                </div>
            </div>
        </div>
    );
};

export default CategoryBasedCommission;
