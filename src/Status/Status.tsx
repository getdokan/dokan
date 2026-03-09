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
                        <div className="flex gap-4 justify-center items-center">
                            <svg
                                width="62"
                                height="62"
                                viewBox="0 0 62 62"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <circle cx="31" cy="31" r="31" fill="#EFEAFF" />
                                <path
                                    d="M37.6396 30.473C37.6176 35.9051 35.2864 41.5131 30.4701 44.0642C27.0833 45.8675 19.0781 47.253 19.0781 41.3811C19.0781 41.3811 19.0781 19.5428 19.0781 19.5209C19.0781 16.266 21.8272 15.1884 24.5762 15.3423C28.6667 15.5623 32.5814 17.4756 34.9565 20.9943C36.474 23.2375 37.3097 25.9426 37.5736 28.6696C37.5956 29.2854 37.6396 29.8792 37.6396 30.473Z"
                                    fill="url(#paint0_linear_5284_104547)"
                                />
                                <path
                                    d="M45.225 28.5584C44.7632 24.072 42.0141 20.3114 38.2095 18.0462C35.6804 16.5287 32.5135 16.1548 30.8641 19.1898C30.8641 19.2118 19.758 39.6205 19.758 39.6205C18.7903 41.4019 19.0103 42.8754 19.89 44.085C21.2095 45.8883 23.8266 46.702 25.9598 46.922C27.9391 47.1419 29.9404 46.922 31.8537 46.4821C37.6377 45.1626 42.7619 41.226 44.4992 35.508C45.181 33.2648 45.4669 30.9116 45.225 28.5584Z"
                                    fill="url(#paint1_linear_5284_104547)"
                                />
                                <path
                                    d="M30.4715 44.0912C35.2878 41.5181 37.619 35.9101 37.641 30.5C37.641 29.9062 37.619 29.3124 37.553 28.7186C37.3111 25.9916 36.4534 23.2865 34.9359 21.0433C34.1002 19.7898 33.0666 18.7561 31.901 17.8984C31.5271 18.2283 31.1753 18.6682 30.8894 19.218C30.8894 19.24 19.7833 39.6487 19.7833 39.6487C19.0576 40.9683 19.0136 42.1339 19.3874 43.1455C19.3874 43.1675 19.4094 43.1895 19.4094 43.2115C19.4314 43.2555 19.4534 43.3214 19.4754 43.3654C19.4974 43.4094 19.4974 43.4314 19.5194 43.4754C19.5194 43.4974 19.5414 43.5194 19.5414 43.5194C21.2788 46.8622 27.5685 45.6306 30.4715 44.0912Z"
                                    fill="url(#paint2_linear_5284_104547)"
                                />
                                <defs>
                                    <linearGradient
                                        id="paint0_linear_5284_104547"
                                        x1="28.3543"
                                        y1="17.0237"
                                        x2="28.3543"
                                        y2="27.6827"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stopColor="#5711CF" />
                                        <stop offset="1" stopColor="#800BD1" />
                                    </linearGradient>
                                    <linearGradient
                                        id="paint1_linear_5284_104547"
                                        x1="41.2393"
                                        y1="20.1998"
                                        x2="28.1592"
                                        y2="45.5426"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stopColor="#FE9879" />
                                        <stop offset="1" stopColor="#FE7598" />
                                    </linearGradient>
                                    <linearGradient
                                        id="paint2_linear_5284_104547"
                                        x1="35.9388"
                                        y1="19.5876"
                                        x2="25.8016"
                                        y2="43.7859"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop
                                            offset="0.0141305"
                                            stopColor="#D8476F"
                                        />
                                        <stop
                                            offset="0.9955"
                                            stopColor="#E93083"
                                        />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <p className="text-md text-[#25252D] font-bold">
                                { __(
                                    'Checking your Dokan Status',
                                    'dokan-lite'
                                ) }
                            </p>

                            <div className="flex items-center justify-center">
                                <svg
                                    className="w-10 h-10 rounded-full animate-spin "
                                    viewBox="0 0 27 27"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M1.31724e-06 13.5C1.64239e-06 6.0615 6.0615 -9.15251e-07 13.5 -5.90104e-07C16.0245 -4.79754e-07 18.4815 0.702 20.6145 2.025C21.249 2.4165 21.438 3.2535 21.0465 3.888C20.655 4.5225 19.818 4.7115 19.1835 4.32C17.4825 3.267 15.5115 2.7 13.5 2.7C7.5465 2.7 2.7 7.5465 2.7 13.5C2.7 19.4535 7.5465 24.3 13.5 24.3C19.4535 24.3 24.3 19.4535 24.3 13.5C24.3 12.7575 24.9075 12.15 25.65 12.15C26.3925 12.15 27 12.7575 27 13.5C27 20.9385 20.9385 27 13.5 27C6.0615 27 9.92098e-07 20.9385 1.31724e-06 13.5Z"
                                        fill="#E4E4EB"
                                    />
                                    <path
                                        d="M13.5 27C6.0615 27 0 20.9385 0 13.5C0 10.9755 0.702 8.5185 2.025 6.3855C2.4165 5.751 3.2535 5.562 3.888 5.9535C4.5225 6.345 4.7115 7.18199 4.32 7.81649C3.267 9.51749 2.7 11.4885 2.7 13.5C2.7 19.4535 7.5465 24.3 13.5 24.3C19.4535 24.3 24.3 19.4535 24.3 13.5C24.3 7.5465 19.4535 2.7 13.5 2.7C12.7575 2.7 12.15 2.0925 12.15 1.35C12.15 0.6075 12.7575 0 13.5 0C20.9385 0 27 6.0615 27 13.5C27 20.9385 20.9385 27 13.5 27Z"
                                        fill="#7047EB"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="h-full">
            <h2 className="text-2xl leading-3 text-gray-900 font-bold mb-6">
                { __( 'Status', 'dokan-lite' ) }
            </h2>
            <main className="max-w-full mx-auto pb-10 lg:py-5 lg:px-0">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
                    { pages && '' !== selectedPage && pages.length > 0 && (
                        <Menu
                            key="admin-status-menu"
                            pages={ pages }
                            loading={ loading }
                            activePage={ selectedPage }
                            onMenuClick={ onMenuClick }
                        />
                    ) }

                    <div
                        className={ twMerge(
                            'space-y-6 sm:px-6 lg:px-0 ',
                            pages.length ? 'lg:col-span-9' : 'lg:col-span-12'
                        ) }
                    >
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
                                    key={
                                        element.hook_key + 'admin-status-parser'
                                    }
                                    element={ element }
                                />
                            );
                        } ) }
                        { ! loading && elements.length === 0 && (
                            <div className="bg-white text-center rounded-lg shadow-sm p-6 flex flex-col items-center justify-center min-h-screen">
                                <svg
                                    width="146"
                                    height="99"
                                    viewBox="0 0 146 99"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="mb-4"
                                >
                                    <rect
                                        y="16.4844"
                                        width="134.29"
                                        height="82.1135"
                                        rx="5.48497"
                                        fill="#EFEAFF"
                                    />
                                    <path
                                        d="M0 21.9693C0 18.9401 2.4557 16.4844 5.48497 16.4844H21.0309C24.0601 16.4844 26.5158 18.9401 26.5158 21.9693V93.1169C26.5158 96.144 24.0619 98.5979 21.0348 98.5979H5.48098C2.45392 98.5979 0 96.144 0 93.1169V21.9693Z"
                                        fill="#DFD7FA"
                                    />
                                    <rect
                                        x="46.1914"
                                        y="43.8438"
                                        width="54.7424"
                                        height="5.1321"
                                        rx="2.56605"
                                        fill="white"
                                    />
                                    <rect
                                        x="46.1914"
                                        y="54.1094"
                                        width="54.7424"
                                        height="5.1321"
                                        rx="2.56605"
                                        fill="white"
                                    />
                                    <rect
                                        x="46.1914"
                                        y="64.375"
                                        width="54.7424"
                                        height="5.1321"
                                        rx="2.56605"
                                        fill="white"
                                    />
                                    <rect
                                        x="46.1914"
                                        y="74.6406"
                                        width="54.7424"
                                        height="5.1321"
                                        rx="2.56605"
                                        fill="white"
                                    />
                                    <path
                                        d="M117.279 64.2304C117.279 61.7085 119.324 59.6641 121.846 59.6641H141.434C143.956 59.6641 146.001 61.7085 146.001 64.2304V81.8607C146.001 84.3826 143.956 86.4271 141.434 86.4271H121.846C119.324 86.4271 117.279 84.3827 117.279 81.8607V64.2304Z"
                                        fill="#7047EB"
                                    />
                                    <path
                                        d="M137.591 73.5331C137.591 77.2536 134.987 79.1139 131.891 80.1928C131.729 80.2477 131.553 80.2451 131.393 80.1854C128.29 79.1139 125.686 77.2536 125.686 73.5331V68.3244C125.686 68.127 125.764 67.9378 125.903 67.7982C126.043 67.6587 126.232 67.5803 126.43 67.5803C127.918 67.5803 129.778 66.6874 131.073 65.5563C131.23 65.4217 131.431 65.3477 131.638 65.3477C131.846 65.3477 132.046 65.4217 132.204 65.5563C133.506 66.6948 135.359 67.5803 136.847 67.5803C137.044 67.5803 137.234 67.6587 137.373 67.7982C137.513 67.9378 137.591 68.127 137.591 68.3244V73.5331Z"
                                        stroke="white"
                                        strokeWidth="1.30504"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <rect
                                        x="117.279"
                                        y="59.3516"
                                        width="28.7213"
                                        height="27.3854"
                                        rx="4.67256"
                                        fill="#7047EB"
                                    />
                                    <path
                                        d="M138.118 68.5918L129.743 76.9673L125.936 73.1602"
                                        stroke="white"
                                        strokeWidth="1.33539"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <rect
                                        x="42.3242"
                                        width="28.7213"
                                        height="27.3854"
                                        rx="4.67256"
                                        fill="#7047EB"
                                    />
                                    <path
                                        d="M63.1591 9.24023L54.7836 17.6157L50.9766 13.8087"
                                        stroke="white"
                                        strokeWidth="1.33539"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>

                                <p className="text-gray-700 text-lg font-bold">
                                    { __(
                                        'Your Dokan is up-to-date.',
                                        'dokan-lite'
                                    ) }
                                </p>
                                <p className="text-center text-[#828282] text-[14px] font-normal leading-[140%] mt-2">
                                    { __( 'Latest Version:', 'dokan-lite' ) }{ ' ' }
                                    <span className="text-[#7047EB]">
                                        { __( 'Lite:', 'dokan-lite' ) }{ ' ' }
                                        { dokanAdminDashboardSettings?.header_info?.lite_version }
                                    </span>
                                    { dokanAdminDashboardSettings?.header_info?.is_pro_exists && (
                                        <>
                                            <span className="mx-1 text-[#7047EB]">|</span>
                                            <span className="text-[#7047EB]">
                                                { dokanAdminDashboardSettings?.header_info?.license_plan
                                                    ? __( dokanAdminDashboardSettings.header_info.license_plan, 'dokan-lite' )
                                                    : __( 'Pro:', 'dokan-lite' ) }{ ' ' }
                                                { dokanAdminDashboardSettings?.header_info?.pro_version }
                                            </span>
                                        </>
                                    ) }
                                </p>
                            </div>
                        ) }
                    </div>
                </div>
            </main>
        </div>
    );
};
export default Status;
