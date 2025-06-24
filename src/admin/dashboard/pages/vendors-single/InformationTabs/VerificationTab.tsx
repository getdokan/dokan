import { Card } from '@getdokan/dokan-ui';
import {
    Download,
    CircleCheck,
    OctagonAlert,
    TriangleAlert,
} from 'lucide-react';
import { RawHTML, useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { Vendor, VendorStats } from '@dokan/definitions/dokan-vendors';
import { VerificationRequestList } from '@dokan/admin/dashboard/pages/vendors-single/InformationTabs/VerificationRequestType';
import { VerificationMethod } from '@dokan/admin/dashboard/pages/vendors-single/InformationTabs/VerificationMethodType';
import { twMerge } from 'tailwind-merge';
import VerificationCardSkeletonLoader from '@dokan/admin/dashboard/pages/vendors-single/InformationTabs/VerificationCardSkeletonLoader';
import NoInformation from '@dokan/admin/dashboard/pages/vendors-single/components/NoInformation';
import { __ } from "@wordpress/i18n";

interface VerificationTabProps {
    vendor: Vendor;
    vendorStats: VendorStats | null;
}

interface DocumentItem {
    name: string;
    size: string;
}

interface DocumentSection {
    title: string;
    status: 'pending' | 'approved' | 'none';
    documents: DocumentItem[];
}

const VerificationTab = ( { vendor, vendorStats }: VerificationTabProps ) => {
    const [ verificationRequests, setVerificationRequests ] =
        useState< VerificationRequestList >( [] );
    const [ verificationMethods, setVerificationMethods ] = useState<
        VerificationMethod[]
    >( [] );
    const [ isLoading, setIsLoading ] = useState( true );

    const getStatusIcon = ( method: VerificationMethod ) => {
        const request = verificationRequests.find(
            ( req ) => req.method_id === method.id
        );

        if ( ! request ) {
            return null;
        }

        switch ( request?.status ) {
            case 'pending':
                return <OctagonAlert className="w-4 h-4 text-red-500" />;
            case 'approved':
                return <CircleCheck className="w-4 h-4 text-green-500" />;
            case 'rejected':
                return <TriangleAlert className="w-4 h-4 text-yellow-500" />;
            default:
                return null;
        }
    };

    const getStatusText = ( method: VerificationMethod ) => {
        const request = verificationRequests.find(
            ( req ) => req.method_id === method.id
        );

        return request?.status_title ?? '';
    };

    const getStatusColor = ( method: VerificationMethod ) => {
        const request = verificationRequests.find(
            ( req ) => req.method_id === method.id
        );
        twMerge( 'text-red-500', 'text-green-500', 'text-yellow-500' );
        switch ( request?.status ) {
            case 'pending':
                return 'text-red-500';
            case 'approved':
                return 'text-green-500';
            case 'rejected':
                return 'text-yellow-500';
            default:
                return '';
        }
    };

    const getDocuments = ( methodId: number ) => {
        const documents = [];

        // now find all the document urls of a method.
        verificationRequests.forEach( ( request ) => {
            if ( request.method_id === methodId ) {
                Object.entries( request.document_urls ).forEach(
                    ( [ key, value ] ) => {
                        documents.push( {
                            title: value.title,
                            url: value.url,
                        } );
                    }
                );
            }
        } );

        return documents;
    };

    useEffect( () => {
        Promise.all( [
            apiFetch( {
                path: addQueryArgs( '/dokan/v1/verification-requests', {
                    vendor_id: vendor.id,
                } ),
            } ),
            apiFetch( { path: '/dokan/v1/verification-methods' } ),
        ] )
            .then( ( [ requests, methods ] ) => {
                setVerificationRequests( requests as VerificationRequestList );
                setVerificationMethods( methods as VerificationMethod[] );

                setIsLoading( false );
            } )
            .catch( ( error ) => {
                // Handle error as needed
                console.error( error );

                setIsLoading( false );
            } );
    }, [] );

    if ( isLoading ) {
        return <VerificationCardSkeletonLoader />;
    } else if (
        verificationMethods.length === 0 ||
        verificationRequests.length === 0
    ) {
        return <NoInformation />;
    }

    return (
        <div>
            { verificationMethods.map( ( method, index ) => (
                <Card key={ index } className="bg-white shadow mb-6 last:mb-0">
                    { /* Section Header */ }
                    <div className="flex items-center justify-between border-b p-6">
                        <h3 className="text-lg font-medium text-gray-900">
                            { method?.title }
                        </h3>
                        { getStatusText( method ) && (
                            <div
                                className={ `flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${ getStatusColor(
                                    method
                                ) }` }
                            >
                                { getStatusIcon( method ) }
                                { getStatusText( method ) }
                            </div>
                        ) }
                    </div>

                    { /* Documents List */ }
                    { getDocuments( method.id ).length > 0 ? (
                        <div>
                            { getDocuments( method.id ).map(
                                ( document, docIndex ) => (
                                    <div
                                        key={ docIndex }
                                        className="flex items-center justify-between border-b last:border-b-0 p-6"
                                    >
                                        <div className="flex items-center gap-3">
                                            <a
                                                href={ document.url }
                                                className="font-medium text-gray-900"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <RawHTML>
                                                    { document.title }
                                                </RawHTML>
                                            </a>
                                        </div>
                                        <button
                                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                            onClick={ () => {
                                                const link =
                                                    window.document.createElement(
                                                        'a'
                                                    );
                                                link.href = document.url;
                                                link.download = '';
                                                window.document.body.appendChild(
                                                    link
                                                );
                                                link.click();
                                                window.document.body.removeChild(
                                                    link
                                                );
                                            } }
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                )
                            ) }
                        </div>
                    ) : (
                        <div className="p-6">
                            <p className="text-red-500">
                                { __( 'No documents submitted', 'dokan' ) }
                            </p>
                        </div>
                    ) }
                </Card>
            ) ) }
        </div>
    );
};

export default VerificationTab;
