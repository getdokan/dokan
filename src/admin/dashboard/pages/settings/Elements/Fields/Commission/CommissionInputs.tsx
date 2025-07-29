import React from 'react';
import { MaskedInput, SimpleInput } from '@getdokan/dokan-ui';
import Plus from '../../../../../../../components/Icons/Plus';
import { CommissionInputsProps } from './types';

const CommissionInputs: React.FC< CommissionInputsProps > = ( {
    categoryId,
    isAllCategory = false,
    onCommissionChange,
    onAllCategoryChange,
    onBlur,
    getCommissionValue,
    formatValue: formatValueProp,
    currency,
} ) => {
    const handlePercentageChange = ( value: string ) => {
        // Handle real-time updates with debounce
        if ( isAllCategory ) {
            onAllCategoryChange( value, 'percentage', true );
        } else {
            onCommissionChange( value, 'percentage', categoryId, true );
        }
    };

    const handleFlatChange = ( value: string ) => {
        // Handle real-time updates with debounce
        if ( isAllCategory ) {
            onAllCategoryChange( value, 'flat', true );
        } else {
            onCommissionChange( value, 'flat', categoryId, true );
        }
    };

    return (
        <div className="flex items-center">
            <div className="w-[142px]">
                <SimpleInput
                    input={ {
                        type: 'number',
                    } }
                    value={ formatValueProp(
                        getCommissionValue( 'percentage', categoryId ) || ''
                    ) }
                    addOnRight={
                        <span className="text-[#575757] text-sm">%</span>
                    }
                    onChange={ ( e ) =>
                        handlePercentageChange( e.target.value )
                    }
                    onBlur={ ( e ) =>
                        onBlur(
                            e.target.value,
                            'percentage',
                            categoryId,
                            isAllCategory
                        )
                    }
                    className={ `w-full h-10 pl-6 pr-8 text-sm border ${
                        categoryId === 23
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
                            { currency.symbol }
                        </span>
                    }
                    value={ formatValueProp(
                        getCommissionValue( 'flat', categoryId ) || ''
                    ) }
                    onChange={ ( e ) => handleFlatChange( e.target.value ) }
                    onBlur={ ( e ) =>
                        onBlur(
                            e.target.value,
                            'flat',
                            categoryId,
                            isAllCategory
                        )
                    }
                    maskRule={ {
                        numeral: true,
                        delimiter: currency.thousand,
                        numeralDecimalMark: currency.decimal,
                        numeralDecimalScale: currency.precision,
                    } }
                    className={ `w-full h-10 pl-6 pr-3 text-sm border ${
                        categoryId === 23
                            ? 'border-[#7047EB]'
                            : 'border-[#E9E9E9]'
                    } rounded-r-[3px] bg-white focus:border-[#7047EB] focus:ring-1 focus:ring-[#7047EB] focus:ring-opacity-20 transition-colors placeholder-[#828282] text-[#575757]` }
                />
            </div>
        </div>
    );
};

export default CommissionInputs;
