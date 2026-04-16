import { Card, DokanToaster, useToast } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { parse } from 'papaparse';
import { useEffect, useRef, useState } from '@wordpress/element';
import HeaderImage from './HeaderImage';
import Importer from './Importer';
import Result from './Result';
import StatusSkeleton from './StatusSkeleton';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productsDataToRemove, vendorsDataToRemove } from './removableFields';

interface RawAttribute {
    name: string;
    value: string[];
    visible: string;
    taxonomy: string;
}

interface CsvRow {
    [ key: string ]: string;
    type: string;
}

interface VendorRow {
    id: string;
    type: 'vendor';
    first_name: string;
    last_name: string;
    username: string;
    [ key: string ]: string;
}

interface ProductRow {
    type: string;
    name: string;
    description: string;
    vendor: string;
    raw_attributes?: RawAttribute[];
    manage_stock?: boolean;
    [ key: string ]: unknown;
}

interface ImportResponse {
    vendor_index: number;
}

interface StatusResponse {
    import_status: string;
}

function Index() {
    const toast = useToast();
    const navigate = useNavigate();
    const [ progress, setProgress ] = useState( 0 );
    const [ loading, setLoading ] = useState< boolean >( true );
    const [ allVendors, setAllVendors ] = useState< VendorRow[] >( [] );
    const [ allProducts, setAllProducts ] = useState< ProductRow[] >( [] );
    const [ done, setDone ] = useState< boolean >( false );
    const [ statusLoader, setStatusLoader ] = useState< boolean >( true );
    const abortRef = useRef< AbortController >( new AbortController() );

    const dokanDashboard = ( window as Record< string, unknown > )
        ?.dokanAdminDashboard as
        | {
              urls?: { dummy_data?: string; adminRoot?: string };
              nonce?: string;
          }
        | undefined;
    const csvFileUrl = dokanDashboard?.urls?.dummy_data;

    // initial load
    useEffect( () => {
        const controller = new AbortController();
        abortRef.current = controller;

        loadImportStatus();
        loadCsvFile();

        return () => {
            controller.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [] );

    function loadImportStatus() {
        setStatusLoader( true );
        apiFetch< StatusResponse >( {
            path: 'dokan/v1/dummy-data/status',
            method: 'GET',
        } )
            .then( ( response ) => {
                if ( response?.import_status === 'yes' ) {
                    setDone( true );
                }
            } )
            .catch( ( err: Error ) => {
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
                const results = parse< CsvRow >( data, { header: true } );
                const rows = results?.data || [];
                loadCsvData( rows );
            } )
            .catch( ( err: Error ) => {
                toast( {
                    type: 'error',
                    title:
                        err?.message ||
                        __( 'Failed to load CSV', 'dokan-lite' ),
                } );
            } )
            .finally( () => setLoading( false ) );
    }

    function loadCsvData( rows: CsvRow[] ) {
        const vendors: VendorRow[] = [];
        const products: ProductRow[] = [];
        rows.forEach( ( item ) => {
            if ( item?.type === 'vendor' ) {
                vendors.push( formatVendorData( { ...item } as VendorRow ) );
            } else {
                products.push( formatProductData( { ...item } as ProductRow ) );
            }
        } );
        setAllVendors( vendors );
        setAllProducts( products );
    }

    function requestToImport( data: Record< string, unknown > ) {
        return apiFetch< ImportResponse >( {
            path: 'dokan/v1/dummy-data/import',
            method: 'POST',
            data,
            signal: abortRef.current?.signal,
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
            vendor_data: vendorData,
            vendor_products: getVendorProducts( vendorData.id ),
            vendor_index: vendorIndex,
            total_vendors: allVendors.length,
        };

        setLoading( true );
        requestToImport( data )
            .then( ( response ) => {
                const nextIndex = response?.vendor_index ?? vendorIndex + 1;
                updateProgress( nextIndex );
                handleImport( nextIndex );
            } )
            .catch( ( err: Error ) => {
                toast( {
                    type: 'error',
                    title:
                        err?.message ||
                        __( 'Something went wrong', 'dokan-lite' ),
                } );
                setLoading( false );
            } );
    }

    function formatVendorData( data: VendorRow ) {
        vendorsDataToRemove.forEach( ( key ) => {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete data[ key ];
        } );
        return data;
    }

    function formatProductData( data: ProductRow ) {
        data.raw_attributes = [
            {
                name: data.attribute_1_name as string,
                value: ( ( data.attribute_1_value as string ) || '' ).split(
                    ','
                ),
                visible: data.attribute_1_visible as string,
                taxonomy: data.attribute_1_global as string,
            },
            {
                name: data.attribute_2_name as string,
                value: ( ( data.attribute_2_value as string ) || '' ).split(
                    ','
                ),
                visible: data.attribute_2_visible as string,
                taxonomy: data.attribute_2_global as string,
            },
        ];
        data.manage_stock = Boolean( data.manage_stock );
        productsDataToRemove.forEach( ( key ) => {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete data[ key ];
        } );
        return data;
    }

    function getVendorProducts( vendorId: string ) {
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
        } )
            .then( () => {
                resetToImport();
                loadImportStatus();
                loadCsvFile();

                toast( {
                    type: 'success',
                    title: __(
                        'All dummy data removed successfully',
                        'dokan-lite'
                    ),
                } );
            } )
            .catch( ( err: Error ) => {
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
            } );
    }

    const loadImporterBody = () => {
        if ( statusLoader ) {
            return <StatusSkeleton />;
        } else if ( ! statusLoader && ! done ) {
            return (
                <Importer
                    progress={ progress }
                    loading={ loading }
                    onRun={ importBtnHandler }
                />
            );
        }

        return (
            <Result
                onClear={ clearAllDummyData }
                loading={ loading }
                navigate={ navigate }
            />
        );
    };

    return (
        <div className="w-full md:w-[658px] m-auto">
            <button
                type="button"
                onClick={ () => navigate( '/tools' ) }
                className="flex flex-row w-auto items-center gap-1 text-[#828282] font-[400] text-[14px] hover:underline mb-[20px] bg-transparent border-none cursor-pointer"
            >
                <ChevronLeft size="15" />
                <span>{ __( 'Back to Tools', 'dokan-lite' ) }</span>
            </button>
            <h2 className="font-[700] text-[24px] text-[#25252D] mb-[24px]">
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

                { loadImporterBody() }
            </Card>

            <DokanToaster />
        </div>
    );
}

export default Index;
