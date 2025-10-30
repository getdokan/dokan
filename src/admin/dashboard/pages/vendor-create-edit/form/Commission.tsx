import { __ } from '@wordpress/i18n';
import { Card, SearchableSelect, ToggleSwitch } from '@getdokan/dokan-ui';
import {
    CategoryBasedCommission,
    FixedCommissionInput,
    DokanModal,
} from '@dokan/components';
import { Slot } from '@wordpress/components';
import { SectionProps, CommissionType } from './types';

interface CommissionProps extends SectionProps {
    categories: any;
    commissionTypes: CommissionType[];
    getCommission: ( type: string ) => CommissionType | undefined;
    setCreateOrEditVendor: ( vendor: any ) => void;
    commissionSubCategoryConfirm: boolean;
    setCommissionSubCategoryConfirm: ( value: boolean ) => void;
    getResetSubCategory: () => boolean;
    clearFieldError: ( key: string ) => void;
}

export const Commission = ( {
    vendor,
    formKey,
    setData,
    categories,
    commissionTypes,
    getCommission,
    setCreateOrEditVendor,
    commissionSubCategoryConfirm,
    setCommissionSubCategoryConfirm,
    getResetSubCategory,
    clearFieldError,
}: CommissionProps ) => {
    return (
        <>
            { /*Commission information section*/ }
            <div className="mt-6">
                <Card className="bg-white">
                    <div className="border-b p-6">
                        <h2 className="text-lg font-bold">
                            { __( 'Commission Information', 'dokan-lite' ) }
                        </h2>
                    </div>
                    <div className="p-6 flex flex-col gap-3">
                        <div>
                            <SearchableSelect
                                label={ __(
                                    'Admin Commission type',
                                    'dokan-lite'
                                ) }
                                placeholder={ __(
                                    'Select commission type',
                                    'dokan-lite'
                                ) }
                                // @ts-ignore
                                value={ getCommission(
                                    vendor?.admin_commission_type
                                ) }
                                // @ts-ignore
                                options={ commissionTypes }
                                onChange={ ( data ) => {
                                    setData(
                                        'admin_commission_type',
                                        // @ts-ignore
                                        data.value
                                    );
                                } }
                            />
                        </div>
                        { vendor?.admin_commission_type ===
                            'category_based' && (
                            <>
                                <div className="mb-3">
                                    <ToggleSwitch
                                        checked={ getResetSubCategory() }
                                        onChange={ () => {
                                            setCommissionSubCategoryConfirm(
                                                true
                                            );
                                        } }
                                        label={ __(
                                            'Apply Parent Category Commission to All Subcategories',
                                            'dokan-lite'
                                        ) }
                                        helpText={ __(
                                            "When enabled, changing a parent category's commission rate will automatically update all its subcategories. Disable this option to maintain independent commission rates for subcategories",
                                            'dokan-lite'
                                        ) }
                                    />

                                    <DokanModal
                                        isOpen={ commissionSubCategoryConfirm }
                                        namespace="commission-sub-category-confirm"
                                        onConfirm={ () => {
                                            setData(
                                                'reset_sub_category',
                                                ! getResetSubCategory()
                                            ).then( () => {
                                                setCommissionSubCategoryConfirm(
                                                    false
                                                );
                                            } );
                                        } }
                                        onClose={ () =>
                                            setCommissionSubCategoryConfirm(
                                                false
                                            )
                                        }
                                        confirmationTitle={
                                            getResetSubCategory()
                                                ? __(
                                                      'Disable Commission Inheritance Setting?',
                                                      'dokan-lite'
                                                  )
                                                : __(
                                                      'Enable Commission Inheritance Setting?',
                                                      'dokan-lite'
                                                  )
                                        }
                                        confirmationDescription={
                                            getResetSubCategory()
                                                ? __(
                                                      'Subcategories will maintain their independent commission rates when parent category rates are changed.',
                                                      'dokan-lite'
                                                  )
                                                : __(
                                                      'Parent category commission changes will automatically update all subcategories. Existing rates will remain unchanged until parent category is modified.',
                                                      'dokan-lite'
                                                  )
                                        }
                                        confirmButtonText={
                                            getResetSubCategory()
                                                ? __( 'Disable', 'dokan-lite' )
                                                : __( 'Enable', 'dokan-lite' )
                                        }
                                        cancelButtonText={ __(
                                            'Cancel',
                                            'dokan-lite'
                                        ) }
                                    />
                                </div>
                                <div>
                                    { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                                    <label
                                        htmlFor=""
                                        className="mb-2 inline-block cursor-pointer text-sm font-medium leading-[21px] text-gray-900"
                                    >
                                        { __(
                                            'Admin Commission',
                                            'dokan-lite'
                                        ) }
                                    </label>
                                    <CategoryBasedCommission
                                        // @ts-ignore
                                        categories={ categories }
                                        // @ts-ignore
                                        commissionValues={
                                            vendor?.admin_category_commission ||
                                            []
                                        }
                                        currency={
                                            // @ts-ignore
                                            window?.dokanAdminDashboard.currency
                                        }
                                        onCommissionChange={ ( data ) => {
                                            setData(
                                                'admin_category_commission',
                                                data
                                            );
                                        } }
                                        resetSubCategoryValue={ getResetSubCategory() }
                                    />
                                </div>
                            </>
                        ) }

                        { vendor?.admin_commission_type === 'fixed' && (
                            <div>
                                { /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
                                <label
                                    htmlFor=""
                                    className="mb-2 inline-block cursor-pointer text-sm font-medium leading-[21px] text-gray-900"
                                >
                                    { __( 'Admin Commission', 'dokan-lite' ) }
                                </label>
                                <div className="-ml-4 -mt-4">
                                    <FixedCommissionInput
                                        values={ {
                                            // @ts-ignore
                                            admin_percentage:
                                                vendor?.admin_commission || '',
                                            // @ts-ignore
                                            additional_fee:
                                                vendor?.admin_additional_fee ||
                                                '',
                                        } }
                                        currency={
                                            // @ts-ignore
                                            window?.dokanAdminDashboard.currency
                                        }
                                        onValueChange={ ( data ) => {
                                            // Clear commission errors when values change
                                            clearFieldError(
                                                'admin_commission'
                                            );
                                            clearFieldError(
                                                'admin_additional_fee'
                                            );

                                            setCreateOrEditVendor( {
                                                ...vendor,
                                                // @ts-ignore
                                                admin_commission:
                                                    data?.admin_percentage,
                                                // @ts-ignore
                                                admin_additional_fee:
                                                    data?.additional_fee,
                                            } );
                                        } }
                                    />
                                </div>
                            </div>
                        ) }
                    </div>
                </Card>
            </div>

            <Slot name={ `${ formKey }-after-commission-information-card` } />
        </>
    );
};
