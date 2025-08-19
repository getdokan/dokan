import { MaskedInput } from '@getdokan/dokan-ui';
import { CommissionInputsProps } from './types';
import { Plus } from 'lucide-react';

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
                <MaskedInput
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
                    className={ `w-full h-10 pl-6  text-sm  rounded-r-[3px] bg-white focus:border-[#7047EB] focus:ring-1 focus:ring-[#7047EB] focus:ring-opacity-20 transition-colors placeholder-[#828282] text-[#575757]` }
                    maskRule={ {
                        numeral: true,
                        delimiter: currency.thousand,
                        numeralDecimalMark: currency.decimal,
                        numeralDecimalScale: currency.precision,
                    } }
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
                    className={ `w-full h-10 pl-6 pr-3 text-sm  rounded-r-[3px] bg-white focus:border-[#7047EB] focus:ring-1 focus:ring-[#7047EB] focus:ring-opacity-20 transition-colors placeholder-[#828282] text-[#575757]` }
                />
            </div>
        </div>
    );
};

export default CommissionInputs;
