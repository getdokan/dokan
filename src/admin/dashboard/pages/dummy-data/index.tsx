import { Card, DokanToaster, useToast } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { parse } from 'papaparse';
import { useEffect, useMemo, useState } from '@wordpress/element';
import HeaderImage from 'admin/dashboard/pages/dummy-data/HeaderImage';
import Importer from 'admin/dashboard/pages/dummy-data/Importer';
import Result from 'admin/dashboard/pages/dummy-data/Result';
import StatusSkeleton from 'admin/dashboard/pages/dummy-data/StatusSkeleton';
import { DokanLink } from '@dokan/components';
import { ChevronLeft } from 'lucide-react';
import { RouterProps } from "@src/definitions/RouterProps";

function Index( props: RouterProps ) {
    const toast = useToast();
    const [ progress, setProgress ] = useState( 0 );
    const [ loading, setLoading ] = useState< boolean >( true );
    const [ allVendors, setAllVendors ] = useState< any[] >( [] );
    const [ allProducts, setAllProducts ] = useState< any[] >( [] );
    const [ done, setDone ] = useState< boolean >( false );
    const [ statusLoader, setStatusLoader ] = useState< boolean >( true );

    const csvFileUrl = ( window as any )?.dokanAdminDashboard?.urls?.dummy_data;

    const vendorsDataToRemove = useMemo(
        () => [
            'sku',
            'status',
            'catalog_visibility',
            'short_description',
            'date_on_sale_from',
            'date_on_sale_to',
            'tax_status',
            'tax_class',
            'stock_status',
            'manage_stock',
            'stock_quantity',
            'children',
            'backorders',
            'sold_individually',
            'reviews_allowed',
            'purchase_note',
            'sale_price',
            'regular_price',
            'category_ids',
            'tag_ids',
            'shipping_class_id',
            'raw_image_id',
            'raw_gallery_image_ids',
            'download_limit',
            'download_expiry',
            'parent_id',
            'grouped_products',
            'upsell_ids',
            'cross_sell_ids',
            'product_url',
            'button_text',
            'menu_order',
            'virtual',
            'downloadable',
            'status',
            'attribute_1_name',
            'attribute_1_value',
            'attribute_1_visible',
            'attribute_1_global',
            'attribute_2_name',
            'attribute_2_value',
            'attribute_2_visible',
            'attribute_2_global',
            '_wpcom_is_markdown',
            'download1_name',
            'download_1_url',
            'download_2_name',
            'download_2_url',
            'vendor',
        ],
        []
    );
    const productsDataToRemove = useMemo(
        () => [
            'email',
            'password',
            'store_name',
            'social',
            'payment',
            'phone',
            'show_email',
            'address',
            'location',
            'banner',
            'icon',
            'gravatar',
            'show_more_tpab',
            'show_ppp',
            'enable_tnc',
            'store_tnc',
            'show_min_order_discount',
            'store_seo',
            'dokan_store_time',
            'enabled',
            'trusted',
            'attribute_1_name',
            'attribute_1_value',
            'attribute_1_visible',
            'attribute_1_global',
            'attribute_2_name',
            'attribute_2_value',
            'attribute_2_visible',
            'attribute_2_global',
        ],
        []
    );

    // initial load
    useEffect( () => {
        loadImportStatus();
        loadCsvFile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [] );

    function loadImportStatus() {
        setStatusLoader( true );
        apiFetch( { path: 'dokan/v1/dummy-data/status', method: 'GET' } )
            .then( ( response: any ) => {
                if ( response?.import_status === 'yes' ) {
                    setDone( true );
                }
            } )
            .catch( ( err: any ) => {
                // Try to surface error minimally
                toast( {
                    type: 'error',
                    title:
                        err?.message ||
                        __( 'Something went wrong', 'dokan-lite' ),
                } );
            } )
            .finally( () => setStatusLoader( false ) );
    }

    function resetDataState() {
        setAllVendors( [] );
        setAllProducts( [] );
    }

    function loadCsvFile() {
        setLoading( true );
        resetDataState();
        const url = csvFileUrl;
        if ( ! url ) {
            setLoading( false );
            toast( {
                type: 'error',
                title: __( 'CSV URL missing', 'dokan-lite' ),
            } );
            return;
        }
        apiFetch( { url, parse: false } )
            .then( ( res: Response ) => res.text() )
            .then( ( data: string ) => {
                const results = parse( data, { header: true } );
                const rows: any[] = ( results as any )?.data || [];
                loadCsvData( rows );
            } )
            .catch( ( err: any ) => {
                toast( {
                    type: 'error',
                    title:
                        err?.message ||
                        __( 'Failed to load CSV', 'dokan-lite' ),
                } );
            } )
            .finally( () => setLoading( false ) );
    }

    function loadCsvData( rows: any[] ) {
        const vendors: any[] = [];
        const products: any[] = [];
        rows.forEach( ( item ) => {
            if ( item?.type === 'vendor' ) {
                vendors.push( formatVendorData( { ...item } ) );
            } else {
                products.push( formatProductData( { ...item } ) );
            }
        } );
        setAllVendors( vendors );
        setAllProducts( products );
    }

    function requestToImport( data: any ) {
        return apiFetch( {
            path: 'dokan/v1/dummy-data/import',
            method: 'POST',
            data,
        } );
    }

    function importBtnHandler() {
        handleImport( 0 );
    }

    function updateProgress( numVendorSucceed: number ) {
        if ( ! allVendors.length ) {
            setProgress( 0 );
            return;
        }
        setProgress( ( 100 * numVendorSucceed ) / allVendors.length );
    }

    function handleImport( vendorIndex: number ) {
        const vendorData = allVendors[ vendorIndex ];
        if ( ! vendorData ) {
            setLoading( false );
            setDone( true );

            if ( vendorIndex > 0 ) {
                toast( {
                    type: 'success',
                    title: __(
                        'Dummy data imported successfully',
                        'dokan-lite'
                    ),
                } );
            }
            return;
        }

        const data = {
            nonce: ( window as any )?.dokanAdminDashboard?.nonce,
            vendor_data: vendorData,
            vendor_products: getVendorProducts( vendorData.id ),
            vendor_index: vendorIndex,
            total_vendors: allVendors.length,
        };

        setLoading( true );
        requestToImport( data )
            .then( ( response: any ) => {
                const nextIndex = response?.vendor_index ?? vendorIndex + 1;
                updateProgress( nextIndex );
                // Continue chaining next
                handleImport( nextIndex );
            } )
            .catch( ( err: any ) => {
                toast( {
                    type: 'error',
                    title:
                        err?.message ||
                        __( 'Something went wrong', 'dokan-lite' ),
                } );
                setLoading( false );
            } );
    }

    function formatVendorData( data: any ) {
        vendorsDataToRemove.forEach( ( key ) => {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete ( data as any )[ key ];
        } );
        return data;
    }

    function formatProductData( data: any ) {
        data.raw_attributes = [
            {
                name: data.attribute_1_name,
                value: ( data.attribute_1_value || '' ).split( ',' ),
                visible: data.attribute_1_visible,
                taxonomy: data.attribute_1_global,
            },
            {
                name: data.attribute_2_name,
                value: ( data.attribute_2_value || '' ).split( ',' ),
                visible: data.attribute_2_visible,
                taxonomy: data.attribute_2_global,
            },
        ];
        data.manage_stock = Boolean( data.manage_stock );
        productsDataToRemove.forEach( ( key ) => {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete ( data as any )[ key ];
        } );
        return data;
    }

    function getVendorProducts( vendorId: any ) {
        return allProducts.filter(
            ( item ) => String( item.vendor ) === String( vendorId )
        );
    }

    function resetToImport() {
        setProgress( 0 );
        setLoading( false );
        setDone( false );
    }

    function clearAllDummyData( setIsConfirmOpen: ( value: boolean ) => void ) {
        setLoading( true );
        apiFetch( {
            path: 'dokan/v1/dummy-data/clear',
            method: 'DELETE',
            data: { nonce: ( window as any )?.dokanAdminDashboard?.nonce },
        } )
            .then( () => {
                resetToImport();
                // reload CSV and status so user can import again
                loadImportStatus();
                loadCsvFile();
            } )
            .catch( ( err: any ) => {
                toast( {
                    type: 'error',
                    title:
                        err?.message ||
                        __( 'Something went wrong', 'dokan-lite' ),
                } );
            } )
            .finally( () => {
                setLoading( false );
                setIsConfirmOpen( false );

                toast( {
                    type: 'success',
                    title: __(
                        'All dummy data remove successfully',
                        'dokan-lite'
                    ),
                } );
            } );
    }

    return (
        <div className="w-full md:w-[658px] m-auto">
            <DokanLink
                href={
                    // @ts-ignore
                    `${ dokanAdminDashboard.urls.adminRoot }admin.php?page=dokan-dashboard#/tools`
                }
                className="flex flex-row w-auto items-center gap-1 !text-[#828282] font-[400] text-[14px] hover:!underline mb-[20px]"
            >
                <ChevronLeft size="15" />
                <span>{ __( 'Back to Tools', 'dokan-lite' ) }</span>
            </DokanLink>
            <h2 className="font-bold font-[700] text-[24px] text-[#25252D] mb-[24px]">
                { __( 'Dummy data', 'dokan-lite' ) }
            </h2>
            <Card className="bg-white rounded-[6px] border border-[#E9E9E9]">
                <div className="p-[24px] flex items-start justify-between border-b border-[#E9E9E9]">
                    <div className="w-2/3">
                        <h3 className="font-[700] text-[18px] text-[#25252D] mb-[10px]">
                            { __(
                                'Import dummy vendors and products',
                                'dokan-lite'
                            ) }
                        </h3>
                        <p className="font-[400] text-[14px] text-[#828282]">
                            { __(
                                'This tool allows you to import vendor and some products for vendors to your marketplace.',
                                'dokan-lite'
                            ) }
                        </p>
                    </div>
                    <div>
                        <HeaderImage />
                    </div>
                </div>

                { statusLoader && <StatusSkeleton /> }

                { ! statusLoader && ! done && (
                    <div className="border-b border-[#E9E9E9]">
                        <Importer
                            progress={ progress }
                            loading={ loading }
                            onRun={ importBtnHandler }
                            { ...props }
                        />
                    </div>
                ) }
                { ! statusLoader && done && (
                    <Result
                        onClear={ clearAllDummyData }
                        loading={ loading }
                        { ...props }
                    />
                ) }

                { /* Distance Matrix API Test UI can be implemented later; omitted for minimal viable migration */ }
            </Card>

            <DokanToaster />
        </div>
    );
}

export default Index;
