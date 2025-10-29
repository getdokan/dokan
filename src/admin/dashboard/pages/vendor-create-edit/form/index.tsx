import { __ } from '@wordpress/i18n';
import { useState, useCallback, useMemo } from '@wordpress/element';
import { SimpleCheckbox } from '@getdokan/dokan-ui';
import { Slot } from '@wordpress/components';
import { PluginArea } from '@wordpress/plugins';
import { applyFilters } from '@wordpress/hooks';
import VendorFormSkeleton from '../VendorFormSkeleton';
import { FormProps, TabData } from './types';
import { useVendorForm } from './hooks';
import { General } from './General';
import { Commission } from './Commission';
import { SocialOptions } from './SocialOptions';

export default function Form( {
    vendor,
    requiredFields,
    formKey = 'dokan-create-new-vendor',
    createForm = true,
}: FormProps ) {
    const formState = useVendorForm( vendor, requiredFields );
    const [ tabQueryParam, setTabQueryParam ] = useState( 'general' );

    const handleTabChange = useCallback( ( tabName: string ) => {
        setTabQueryParam( tabName );
    }, [] );

    // Tab configuration
    const tabsData: TabData[] = useMemo(
        () =>
            applyFilters( `dokan-vendor-form-data-tabs-${ formKey }`, [
                {
                    name: 'general',
                    title: __( 'General', 'dokan-lite' ),
                    className:
                        'border-0 border-b border-solid mr-5 -mb-px space-x-8 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium cursor-pointer hover:bg-transparent focus:outline-none text-gray-500 border-gray-200 hover:text-gray-600 hover:border-gray-300',
                    component: General,
                    renderAsFunction: true,
                },
                {
                    name: 'commission',
                    title: __( 'Commission', 'dokan-lite' ),
                    className:
                        'border-0 border-b border-solid mr-5 -mb-px space-x-8 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium cursor-pointer hover:bg-transparent focus:outline-none text-gray-500 border-gray-200 hover:text-gray-600 hover:border-gray-300',
                    component: Commission,
                    renderAsFunction: true,
                },
                {
                    name: 'social-options',
                    title: __( 'Social Options', 'dokan-lite' ),
                    className:
                        'border-0 border-b border-solid mr-5 -mb-px space-x-8 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium cursor-pointer hover:bg-transparent focus:outline-none text-gray-500 border-gray-200 hover:text-gray-600 hover:border-gray-300',
                    component: SocialOptions,
                    renderAsFunction: false,
                },
            ] ) as TabData[],
        [ formKey ]
    );

    // Current tab component
    const getCurrentTabComponent = useMemo( () => {
        const currentTab = tabsData.find(
            ( tab ) => tab.name === tabQueryParam
        );

        if ( ! currentTab ) {
            return null;
        }

        const TabComponent = currentTab.component;

        // Component props
        const componentProps = {
            vendor: formState.vendor,
            formKey,
            createForm,
            isRequired: formState.isRequired,
            getError: formState.getError,
            setData: formState.setData,
        };

        // Render based on tab
        if ( tabQueryParam === 'general' ) {
            return (
                <General
                    { ...componentProps }
                    onChangeStoreName={ formState.onChangeStoreName }
                    onChangeStoreUrl={ formState.onChangeStoreUrl }
                    setLogo={ formState.setLogo }
                    setBanner={ formState.setBanner }
                    searchEmail={ formState.searchEmail }
                    searchUsername={ formState.searchUsername }
                    generatePassword={ formState.generatePassword }
                    setCreateOrEditVendor={ formState.setCreateOrEditVendor }
                    countries={ formState.countries }
                />
            );
        }

        if ( tabQueryParam === 'commission' ) {
            return (
                <Commission
                    { ...componentProps }
                    categories={ formState.categories }
                    commissionTypes={ formState.commissionTypes }
                    getCommission={ formState.getCommission }
                    setCreateOrEditVendor={ formState.setCreateOrEditVendor }
                    commissionSubCategoryConfirm={
                        formState.commissionSubCategoryConfirm
                    }
                    setCommissionSubCategoryConfirm={
                        formState.setCommissionSubCategoryConfirm
                    }
                    getResetSubCategory={ formState.getResetSubCategory }
                    clearFieldError={ formState.clearFieldError }
                />
            );
        }

        if ( tabQueryParam === 'social-options' ) {
            return <SocialOptions { ...componentProps } />;
        }

        // Fallback for custom tabs from filters
        if ( currentTab?.renderAsFunction ) {
            return TabComponent();
        }

        // @ts-ignore
        return <TabComponent />;
    }, [ tabsData, tabQueryParam, formState, formKey, createForm ] );

    // Show loading skeleton if vendor is not loaded
    if ( ! formState.vendor || Object.keys( formState.vendor ).length === 0 ) {
        return <VendorFormSkeleton />;
    }

    return (
        <>
            <div className="flex flex-col">
                { /* Tab Navigation */ }
                <div className="flex border-gray-200 overflow-x-auto @md:space-x-8 space-x-4">
                    { tabsData.map( ( tab ) => (
                        <button
                            key={ tab.name }
                            className={
                                'px-4 py-4 text-sm border-b !border-b-[2px] border-transparent font-semibold whitespace-nowrap transition-colors ' +
                                ( tabQueryParam === tab.name
                                    ? '!border-[#7047EB] text-[#7047EB]'
                                    : 'border-transparent text-gray-500 hover:text-[#7047EB] hover:!border-[#7047EB]' )
                            }
                            onClick={ () => handleTabChange( tab.name ) }
                        >
                            { tab.title }
                        </button>
                    ) ) }
                </div>

                { /* Current Tab Content */ }
                { getCurrentTabComponent }

                { /* Send Email Checkbox for Create Form */ }
                { createForm && (
                    <>
                        <div className="mt-6">
                            <SimpleCheckbox
                                label={ __(
                                    'Send an email to vendor about account',
                                    'dokan-lite'
                                ) }
                                input={ {
                                    id: 'send_email',
                                    name: 'send_email',
                                    type: 'checkbox',
                                } }
                                checked={ formState.vendor?.show_email }
                                onChange={ ( e ) => {
                                    formState.setData(
                                        'show_email',
                                        e.target.checked
                                    );
                                } }
                                // @ts-ignore
                                errors={ formState.getError( 'show_email' ) }
                            />
                        </div>

                        <Slot name={ `${ formKey }-after-send-email` } />
                    </>
                ) }
            </div>

            { /* Plugin Area for Extensions */ }
            <PluginArea
                scope={ `dokan-admin-dashboard-vendor-form-${ formKey }` }
            />
        </>
    );
}
