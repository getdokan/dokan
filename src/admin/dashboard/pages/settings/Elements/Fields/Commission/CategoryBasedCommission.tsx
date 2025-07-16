import React, { useState, RawHTML } from '@wordpress/element';
import CategoryCommissionWrapper from './CategoryCommissionWrapper';
import { SettingsProps } from '../../../types';

// Declare global variables
declare global {
    interface Window {
        adminWithdrawData: {
            currency: {
                symbol: string;
                thousand: string;
                decimal: string;
                precision: number;
            };
        };
        accounting: {
            unformat: ( value: string, decimal: string ) => number;
            formatNumber: (
                value: string,
                precision: number,
                thousand: string,
                decimal: string
            ) => string;
        };
    }
}

const CategoryBasedCommission = ( {
    element,
    onValueChange,
    getSetting,
}: SettingsProps ) => {
    if ( ! element.display ) {
        return null;
    }

    const { currency } = window.adminWithdrawData || {
        currency: {
            symbol: '$',
            thousand: ',',
            decimal: '.',
            precision: 2,
        },
    };

    const resetSubCategoryObj =
        getSetting(
            'dokan_admin_onboarding_setup_step_commission_commission_reset_sub_category_when_edit_all_category'
        ) || {};

    const categories = ( element as any )?.categories || {};
    const commissionValues = ( element as any )?.value || {};
    const resetCategoryVal = resetSubCategoryObj?.value || 'on';

    const resetSubCategory = resetCategoryVal !== 'off';



    const handleValueChange = ( newValue: any ) => {
        if ( onValueChange ) {
            onValueChange( {
                ...element,
                value: newValue,
            } );
        }
    };

    return (
        <div className="p-4 flex flex-col gap-y-4" id={ element.hook_key }>
            { ( element?.title || element?.description ) && (
                <div className="flex-col flex gap-1">
                    <h2 className="text-sm leading-6 font-semibold text-gray-900">
                        <RawHTML>{ element?.title }</RawHTML>
                    </h2>
                    <p className="text-sm font-normal text-[#828282]">
                        <RawHTML>{ element?.description }</RawHTML>
                    </p>
                </div>
            ) }

            <CategoryCommissionWrapper
                categories={ categories }
                value={ commissionValues }
                onValueChange={ handleValueChange }
                currency={ currency }
                resetSubCategory={ resetSubCategory }
            />
        </div>
    );
};

export default CategoryBasedCommission;
