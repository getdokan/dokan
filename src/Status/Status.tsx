import { useEffect, useState } from '@wordpress/element';
import Menu from './Menu';
import Tab from './Tab';
import SettingsParser from './SettingsParser';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import { twMerge } from 'tailwind-merge';

export type StatusElement = {
    headers?: Array< string >;
    payload?: Object;
    request?: string;
    endpoint?: string;
    url?: string;
    title_text?: string;
    id: string;
    type: string;
    title?: string;
    description?: string;
    icon?: string;
    data?: string;
    hook_key?: string;
    children?: Array< StatusElement >;
};

const Status = () => {
    const [ allSettings, setAllSettings ] = useState< Array< StatusElement > >(
        []
    );
    const [ loading, setLoading ] = useState< boolean >( true );
    const [ pages, setPages ] = useState< StatusElement[] >( [] );
    const [ selectedPage, setSelectedPage ] = useState< string >( '' );

    const [ tabs, setTabs ] = useState< StatusElement[] >( [] );
    const [ selectedTab, setSelectedTab ] = useState< string >( '' );
    const [ elements, setElements ] = useState< StatusElement[] >( [] );

    useEffect( () => {
        apiFetch< Array< StatusElement > >( {
            path: 'dokan/v1/admin/dashboard/status',
        } )
            .then( ( data ) => {
                setAllSettings( data );
                setLoading( false );
            } )
            .catch( () => {
                setLoading( false );
            } );
    }, [] );

    useEffect( () => {
        if ( ! loading ) {
            setPages(
                allSettings.filter( ( child ) => child.type === 'page' )
            );
        }
    }, [ allSettings, loading ] );

    useEffect( () => {
        if ( ! loading && pages.length > 0 ) {
            setSelectedPage(
                selectedPage === '' ? pages[ 0 ].id : selectedPage
            );
        }
    }, [ pages, loading, selectedPage ] );

    useEffect( () => {
        if ( loading ) {
            return;
        }
        if ( pages?.length > 0 ) {
            setTabs(
                pages
                    ?.find( ( child ) => child.id === selectedPage )
                    ?.children.filter( ( child ) => child.type === 'tab' )
            );
        } else {
            setTabs( allSettings?.filter( ( child ) => child.type === 'tab' ) );
        }
    }, [ allSettings, pages, selectedPage, loading ] );

    useEffect( () => {
        if ( loading ) {
            return;
        }
        if ( tabs?.length > 0 ) {
            setSelectedTab( selectedTab === '' ? tabs[ 0 ].id : selectedTab );
        }
    }, [ tabs, loading, selectedTab ] );

    useEffect( () => {
        if ( loading ) {
            return;
        }

        if ( ! pages?.length && ! tabs?.length ) {
            setElements( allSettings );
        } else if ( pages?.length && ! tabs?.length && '' !== selectedPage ) {
            setElements(
                pages.find( ( child ) => child.id === selectedPage ).children
            );
        } else if ( ! pages?.length && tabs?.length && '' !== selectedTab ) {
            setElements(
                tabs.find( ( child ) => child.id === selectedTab ).children
            );
        } else if (
            pages?.length &&
            tabs?.length &&
            '' !== selectedPage &&
            '' !== selectedTab
        ) {
            setElements(
                tabs.find( ( child ) => child.id === selectedTab ).children
            );
        }
    }, [ allSettings, pages, selectedPage, tabs, selectedTab, loading ] );

    const onMenuClick = ( page: string ) => {
        if ( ! page ) {
            return;
        }

        setSelectedPage( page );
    };

    const onTabClick = ( tab: string ) => {
        if ( ! tab ) {
            return;
        }

        setSelectedTab( tab );
    };

    if ( loading ) {
        return (
            <div className="h-full pt-5">
                <main className="max-w-full mx-auto pb-10">
                    <div className="bg-white rounded-lg shadow-sm p-6 min-h-screen flex items-center justify-center">
                        {/* Loading State SVG preserved */}
                        <div className="flex gap-4 justify-center items-center">
                            <svg width="62" height="62" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="31" cy="31" r="31" fill="#EFEAFF" />
                                <path d="M37.6396 30.473C37.6176 35.9051 35.2864 41.5131 30.4701 44.0642C27.0833 45.8675 19.0781 47.253 19.0781 41.3811C19.0781 41.3811 19.0781 19.5428 19.0781 19.5209C19.0781 16.266 21.8272 15.1884 24.5762 15.3423C28.6667 15.5623 32.5814 17.4756 34.9565 20.9943C36.474 23.2375 37.3097 25.9426 37.5736 28.6696C37.5956 29.2854 37.6396 29.8792 37.6396 30.473Z" fill="url(#paint0_linear_5284_104547)"/>
                                <path d="M45.225 28.5584C44.7632 24.072 42.0141 20.3114 38.2095 18.0462C35.6804 16.5287 32.5135 16.1548 30.8641 19.1898C30.8641 19.2118 19.758 39.6205 19.758 39.6205C18.7903 41.4019 19.0103 42.8754 19.89 44.085C21.2095 45.8883 23.8266 46.702 25.9598 46.922C27.9391 47.1419 29.9404 46.922 31.8537 46.4821C37.6377 45.1626 42.7619 41.226 44.4992 35.508C45.181 33.2648 45.4669 30.9116 45.225 28.5584Z" fill="url(#paint1_linear_5284_104547)"/>
                                <path d="M30.4715 44.0912C35.2878 41.5181 37.619 35.9101 37.641 30.5C37.641 29.9062 37.619 29.3124 37.553 28.7186C37.3111 25.9916 36.4534 23.2865 34.9359 21.0433C34.1002 19.7898 33.0666 18.7561 31.901 17.8984C31.5271 18.2283 31.1753 18.6682 30.8894 19.218C30.8894 19.24 19.7833 39.6487 19.7833 39.6487C19.0576 40.9683 19.0136 42.1339 19.3874 43.1455C19.3874 43.1675 19.4094 43.1895 19.4094 43.2115C19.4314 43.2555 19.4534 43.3214 19.4754 43.3654C19.4974 43.4094 19.4974 43.4314 19.5194 43.4754C19.5194 43.4974 19.5414 43.5194 19.5414 43.5194C21.2788 46.8622 27.5685 45.6306 30.4715 44.0912Z" fill="url(#paint2_linear_5284_104547)"/>
                                <defs>
                                    <linearGradient id="paint0_linear_5284_104547" x1="28.3543" y1="17.0237" x2="28.3543" y2="27.6827" gradientUnits="userSpaceOnUse"><stop stopColor="#5711CF" /><stop offset="1" stopColor="#800BD1" /></linearGradient>
                                    <linearGradient id="paint1_linear_5284_104547" x1="41.2393" y1="20.1998" x2="28.1592" y2="45.5426" gradientUnits="userSpaceOnUse"><stop stopColor="#FE9879" /><stop offset="1" stopColor="#FE7598" /></linearGradient>
                                    <linearGradient id="paint2_linear_5284_104547" x1="35.9388" y1="19.5876" x2="25.8016" y2="43.7859" gradientUnits="userSpaceOnUse"><stop offset="0.0141305" stopColor="#D8476F" /><stop offset="0.9955" stopColor="#E93083" /></linearGradient>
                                </defs>
                            </svg>
                            <p className="text-md text-[#25252D] font-bold">{ __( 'Checking your Dokan Status', 'dokan-lite' ) }</p>
                            <div className="flex items-center justify-center">
                                <svg className="w-10 h-10 rounded-full animate-spin" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.31724e-06 13.5C1.64239e-06 6.0615 6.0615 -9.15251e-07 13.5 -5.90104e-07C16.0245 -4.79754e-07 18.4815 0.702 20.6145 2.025C21.249 2.4165 21.438 3.2535 21.0465 3.888C20.655 4.5225 19.818 4.7115 19.1835 4.32C17.4825 3.267 15.5115 2.7 13.5 2.7C7.5465 2.7 2.7 7.5465 2.7 13.5C2.7 19.4535 7.5465 24.3 13.5 24.3C19.4535 24.3 24.3 19.4535 24.3 13.5C24.3 12.7575 24.9075 12.15 25.65 12.15C26.3925 12.15 27 12.7575 27 13.5C27 20.9385 20.9385 27 13.5 27C6.0615 27 9.92098e-07 20.9385 1.31724e-06 13.5Z" fill="#E4E4EB"/>
                                    <path d="M13.5 27C6.0615 27 0 20.9385 0 13.5C0 10.9755 0.702 8.5185 2.025 6.3855C2.4165 5.751 3.2535 5.562 3.888 5.9535C4.5225 6.345 4.7115 7.18199 4.32 7.81649C3.267 9.51749 2.7 11.4885 2.7 13.5C2.7 19.4535 7.5465 24.3 13.5 24.3C19.4535 24.3 24.3 19.4535 24.3 13.5C24.3 7.5465 19.4535 2.7 13.5 2.7C12.7575 2.7 12.15 2.0925 12.15 1.35C12.15 0.6075 12.7575 0 13.5 0C20.9385 0 27 6.0615 27 13.5C27 20.9385 20.9385 27 13.5 27Z" fill="#7047EB"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Static Template Implementation based on Screenshosts
    return (
        <div className="bg-gray-50 min-h-screen">
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        { __( 'Dokan Status', 'dokan-lite' ) }
                    </h1>
                    <p className="mt-2 text-base text-gray-600">
                        { __( 'Lorem ipsum dolor sit amet consectetur. Lorem ipsum dolor sit amet consectetur. dolor sit amet consectetur. Lorem ipsum dolor sit amet consectetur.', 'dokan-lite' ) }
                    </p>
                </div>

                <div className="space-y-6">
                    {/* First Section: Overridden Templates */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="border-b border-gray-100 pb-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                { __( 'Overridden Templates or Routes', 'dokan-lite' ) }
                            </h2>
                            <p className="text-sm text-gray-500">
                                { __( 'The listed templates or vendor dashboard routes are currently overridden, which are preventing enabling new features.', 'dokan-lite' ) }
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-2">
                                { __( 'Dokan Status', 'dokan-lite' ) }
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                { __( 'The listed templates or vendor dashboard routes are currently overridden, which are preventing enabling new features.', 'dokan-lite' ) }
                            </p>
                            
                            <div className="flex gap-4 items-center mb-6">
                                <a href="#" className="text-sm text-blue-600 underline hover:text-blue-800">
                                    { __( 'Button Link', 'dokan-lite' ) }
                                </a>
                            </div>
                            
                            <button className="bg-[#6533e3] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#5428bd] transition-colors mb-6">
                                { __( 'Primary Button', 'dokan-lite' ) }
                            </button>

                            {/* Table */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="grid grid-cols-2 bg-gray-50 px-6 py-3 border-b border-gray-200">
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{ __( 'TEMPLATE', 'dokan-lite' ) }</div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{ __( 'ACTIONS', 'dokan-lite' ) }</div>
                                </div>
                                <div className="bg-white divide-y divide-gray-200">
                                    <div className="grid grid-cols-2 px-6 py-4 items-center">
                                        <div className="text-sm text-gray-900">File.php</div>
                                        <div><a href="#" className="text-sm text-blue-600 hover:text-blue-800 underline">{ __( 'Remove', 'dokan-lite' ) }</a></div>
                                    </div>
                                    <div className="grid grid-cols-2 px-6 py-4 items-center">
                                        <div className="text-sm text-gray-900">File.php</div>
                                        <div><a href="#" className="text-sm text-blue-600 hover:text-blue-800 underline">{ __( 'Remove', 'dokan-lite' ) }</a></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Repeated Table Section from Screenshot */}
                        <div className="mt-8 pt-8 border-t border-gray-100">
                             <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="grid grid-cols-2 bg-gray-50 px-6 py-3 border-b border-gray-200">
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{ __( 'TEMPLATE', 'dokan-lite' ) }</div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{ __( 'ACTIONS', 'dokan-lite' ) }</div>
                                </div>
                                <div className="bg-white divide-y divide-gray-200">
                                    <div className="grid grid-cols-2 px-6 py-4 items-center">
                                        <div className="text-sm text-gray-900">File.php</div>
                                        <div><a href="#" className="text-sm text-blue-600 hover:text-blue-800 underline">{ __( 'Remove', 'dokan-lite' ) }</a></div>
                                    </div>
                                    <div className="grid grid-cols-2 px-6 py-4 items-center">
                                        <div className="text-sm text-gray-900">File.php</div>
                                        <div><a href="#" className="text-sm text-blue-600 hover:text-blue-800 underline">{ __( 'Remove', 'dokan-lite' ) }</a></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Second Section: Another Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            { __( 'Another Section', 'dokan-lite' ) }
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            { __( 'The listed templates or vendor dashboard routes are currently overridden, which are preventing enabling new features.', 'dokan-lite' ) }
                        </p>

                        <div className="mb-8">
                            <h3 className="text-base font-semibold text-gray-900 mb-2">
                                { __( 'Another Sub Section', 'dokan-lite' ) }
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                { __( 'The listed templates or vendor dashboard routes are currently overridden, which are preventing enabling new features.', 'dokan-lite' ) }
                            </p>
                            <button className="bg-[#6533e3] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#5428bd] transition-colors">
                                { __( 'Primary', 'dokan-lite' ) }
                            </button>
                        </div>

                         <div className="mb-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-2">
                                { __( 'Dokan Status', 'dokan-lite' ) }
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                { __( 'The listed templates or vendor dashboard routes are currently overridden, which are preventing enabling new features.', 'dokan-lite' ) }
                            </p>
                            
                            <div className="mb-6">
                                <a href="#" className="text-sm text-blue-600 underline hover:text-blue-800">
                                    { __( 'Button Link', 'dokan-lite' ) }
                                </a>
                            </div>

                             {/* Table */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="grid grid-cols-2 bg-gray-50 px-6 py-3 border-b border-gray-200">
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{ __( 'TEMPLATE', 'dokan-lite' ) }</div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{ __( 'ACTIONS', 'dokan-lite' ) }</div>
                                </div>
                                <div className="bg-white divide-y divide-gray-200">
                                    <div className="grid grid-cols-2 px-6 py-4 items-center">
                                        <div className="text-sm text-gray-900">File.php</div>
                                        <div><a href="#" className="text-sm text-blue-600 hover:text-blue-800 underline">{ __( 'Remove', 'dokan-lite' ) }</a></div>
                                    </div>
                                    <div className="grid grid-cols-2 px-6 py-4 items-center">
                                        <div className="text-sm text-gray-900">File.php</div>
                                        <div><a href="#" className="text-sm text-blue-600 hover:text-blue-800 underline">{ __( 'Remove', 'dokan-lite' ) }</a></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                         <div className="mb-6 pt-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-2">
                                { __( 'Another Sub Section', 'dokan-lite' ) }
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                { __( 'The listed templates or vendor dashboard routes are currently overridden, which are preventing enabling new features.', 'dokan-lite' ) }
                            </p>
                            <button className="bg-[#6533e3] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#5428bd] transition-colors">
                                { __( 'Primary', 'dokan-lite' ) }
                            </button>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-2">
                                { __( 'Dokan Status', 'dokan-lite' ) }
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                { __( 'The listed templates or vendor dashboard routes are currently overridden, which are preventing enabling new features.', 'dokan-lite' ) }
                            </p>
                            
                             <div className="mb-6">
                                <a href="#" className="text-sm text-blue-600 underline hover:text-blue-800">
                                    { __( 'Button Link', 'dokan-lite' ) }
                                </a>
                            </div>

                             {/* Table */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="grid grid-cols-2 bg-gray-50 px-6 py-3 border-b border-gray-200">
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{ __( 'TEMPLATE', 'dokan-lite' ) }</div>
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{ __( 'ACTIONS', 'dokan-lite' ) }</div>
                                </div>
                                <div className="bg-white divide-y divide-gray-200">
                                    <div className="grid grid-cols-2 px-6 py-4 items-center">
                                        <div className="text-sm text-gray-900">File.php</div>
                                        <div><a href="#" className="text-sm text-blue-600 hover:text-blue-800 underline">{ __( 'Remove', 'dokan-lite' ) }</a></div>
                                    </div>
                                    <div className="grid grid-cols-2 px-6 py-4 items-center">
                                        <div className="text-sm text-gray-900">File.php</div>
                                        <div><a href="#" className="text-sm text-blue-600 hover:text-blue-800 underline">{ __( 'Remove', 'dokan-lite' ) }</a></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Third Section: File Paths List */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                { __( 'Overridden Templates or Routes', 'dokan-lite' ) }
                            </h2>
                            <p className="text-sm text-gray-500">
                                { __( 'The listed templates or vendor dashboard routes are currently overridden, which are preventing enabling new features.', 'dokan-lite' ) }
                            </p>
                        </div>

                         <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{ __( 'TEMPLATE', 'dokan-lite' ) }</div>
                            </div>
                            <div className="bg-white divide-y divide-gray-200">
                                <div className="px-6 py-4 text-sm text-gray-600 font-mono break-all">
                                    /Users/abulhasanaunshon/Sites/dokan-dev/wp-content/themes/storefront/dokan/withdraw/withdraw-dashboard.php
                                </div>
                                <div className="px-6 py-4 text-sm text-gray-600 font-mono break-all">
                                    /Users/abulhasanaunshon/Sites/dokan-dev/wp-content/themes/storefront/dokan/withdraw/approved-request-listing.php
                                </div>
                                <div className="px-6 py-4 text-sm text-gray-600 font-mono break-all">
                                    /Users/abulhasanaunshon/Sites/dokan-dev/wp-content/themes/storefront/dokan/withdraw/cancelled-request-listing.php
                                </div>
                                <div className="px-6 py-4 text-sm text-gray-600 font-mono break-all">
                                    /Users/abulhasanaunshon/Sites/dokan-dev/wp-content/themes/storefront/dokan/withdraw/cancelled-request-listing.php
                                </div>
                                <div className="px-6 py-4 text-sm text-gray-600 font-mono break-all">
                                    /Users/abulhasanaunshon/Sites/dokan-dev/wp-content/themes/storefront/dokan/withdraw/cancelled-request-listing.php
                                </div>
                                <div className="px-6 py-4 text-sm text-gray-600 font-mono break-all">
                                    /Users/abulhasanaunshon/Sites/dokan-dev/wp-content/themes/storefront/dokan/withdraw/cancelled-request-listing.php
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Original Dynamic Render Logic (Hidden for now to show template) */}
                <div className="hidden">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-x-6">
                        { pages && '' !== selectedPage && pages.length > 0 && (
                            <Menu
                                key="admin-status-menu"
                                pages={ pages }
                                loading={ loading }
                                activePage={ selectedPage }
                                onMenuClick={ onMenuClick }
                            />
                        ) }

                        <div className={ twMerge( 'space-y-6', pages.length ? 'lg:col-span-9' : 'lg:col-span-12' ) }>
                            { tabs && '' !== selectedTab && (
                                <Tab
                                    key="admin-status-tab"
                                    tabs={ tabs }
                                    loading={ loading }
                                    selectedTab={ selectedTab }
                                    onTabClick={ onTabClick }
                                />
                            ) }

                            { elements.map( ( element: StatusElement ) => {
                                return (
                                    <SettingsParser
                                        key={ element.hook_key + 'admin-status-parser' }
                                        element={ element }
                                    />
                                );
                            } ) }
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
export default Status;