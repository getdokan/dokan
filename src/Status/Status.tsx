import { useEffect, useState } from '@wordpress/element';
import Menu from './Menu';
import Tab from './Tab';
import SettingsParser from './SettingsParser';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

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
                console.log( data );
                setAllSettings( data );
                setLoading( false );
            } )
            .catch( ( error ) => {
                console.log( error );
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

    return (
        <div className="h-full">
            <main className="max-w-7xl mx-auto pb-10 lg:py-5 lg:px-0">
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

                    <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
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
                            <div className="bg-white text-center rounded-lg shadow-sm p-6 min-h-screen">
                                <svg
                                    width="269"
                                    height="190"
                                    viewBox="0 0 269 190"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="mx-auto mb-4 mt-16"
                                >
                                    <path
                                        d="M219.114 0H56.2571C48.7618 0 42.6857 6.07614 42.6857 13.5714V176.429C42.6857 183.924 48.7618 190 56.2571 190H219.114C226.61 190 232.686 183.924 232.686 176.429V13.5714C232.686 6.07614 226.61 0 219.114 0Z"
                                        fill="url(#paint0_linear_529_1266)"
                                    />
                                    <g filter="url(#filter0_d_529_1266)">
                                        <path
                                            d="M72.5428 73.2861H255.757C257.557 73.2861 259.283 74.0011 260.555 75.2736C261.828 76.5462 262.543 78.2722 262.543 80.0718V114C262.543 115.8 261.828 117.526 260.555 118.799C259.283 120.071 257.557 120.786 255.757 120.786H72.5428C70.7431 120.786 69.0171 120.071 67.7446 118.799C66.472 117.526 65.7571 115.8 65.7571 114V80.0718C65.7571 78.2722 66.472 76.5462 67.7446 75.2736C69.0171 74.0011 70.7431 73.2861 72.5428 73.2861V73.2861Z"
                                            fill="white"
                                        />
                                    </g>
                                    <path
                                        d="M172.971 84.1426H137.686C135.437 84.1426 133.614 85.9654 133.614 88.214C133.614 90.4626 135.437 92.2854 137.686 92.2854H172.971C175.22 92.2854 177.043 90.4626 177.043 88.214C177.043 85.9654 175.22 84.1426 172.971 84.1426Z"
                                        fill="#BFB5FF"
                                        fillOpacity="0.6"
                                    />
                                    <path
                                        d="M197.4 101.786H137.686C135.437 101.786 133.614 103.608 133.614 105.857C133.614 108.106 135.437 109.929 137.686 109.929H197.4C199.649 109.929 201.471 108.106 201.471 105.857C201.471 103.608 199.649 101.786 197.4 101.786Z"
                                        fill="#E8E5FF"
                                        fillOpacity="0.6"
                                    />
                                    <path
                                        d="M107.15 109.928C114.271 109.928 120.043 104.156 120.043 97.0354C120.043 89.9149 114.271 84.1426 107.15 84.1426C100.029 84.1426 94.2571 89.9149 94.2571 97.0354C94.2571 104.156 100.029 109.928 107.15 109.928Z"
                                        fill="#A244FF"
                                    />
                                    <path
                                        d="M104.746 98.6431H105.53L103.71 93.8201H102.905L101.085 98.6431H101.876L102.338 97.4391H104.284L104.746 98.6431ZM103.311 94.7511L104.032 96.7741H102.59L103.311 94.7511ZM108.13 94.5061C108.655 94.5061 108.872 94.9471 108.872 95.3531C108.872 95.7661 108.634 96.1931 108.102 96.1931H106.954V94.5061H108.13ZM106.205 98.6431H106.954V96.8721H108.144C109.18 96.8721 109.614 96.1161 109.614 95.3531C109.614 94.5901 109.18 93.8201 108.144 93.8201H106.205V98.6431Z"
                                        fill="white"
                                    />
                                    <g filter="url(#filter1_d_529_1266)">
                                        <path
                                            d="M14.1857 131.643H197.4C199.2 131.643 200.926 132.357 202.198 133.63C203.471 134.903 204.186 136.629 204.186 138.428V172.357C204.186 174.157 203.471 175.883 202.198 177.155C200.926 178.428 199.2 179.143 197.4 179.143H14.1857C12.3861 179.143 10.6601 178.428 9.38751 177.155C8.11495 175.883 7.40002 174.157 7.40002 172.357V138.428C7.40002 136.629 8.11495 134.903 9.38751 133.63C10.6601 132.357 12.3861 131.643 14.1857 131.643V131.643Z"
                                            fill="white"
                                        />
                                    </g>
                                    <path
                                        d="M114.614 142.5H79.3286C77.08 142.5 75.2571 144.323 75.2571 146.571C75.2571 148.82 77.08 150.643 79.3286 150.643H114.614C116.863 150.643 118.686 148.82 118.686 146.571C118.686 144.323 116.863 142.5 114.614 142.5Z"
                                        fill="#BFB5FF"
                                        fillOpacity="0.6"
                                    />
                                    <path
                                        d="M139.043 160.143H79.3286C77.08 160.143 75.2571 161.966 75.2571 164.214C75.2571 166.463 77.08 168.286 79.3286 168.286H139.043C141.291 168.286 143.114 166.463 143.114 164.214C143.114 161.966 141.291 160.143 139.043 160.143Z"
                                        fill="#E8E5FF"
                                        fillOpacity="0.6"
                                    />
                                    <path
                                        d="M31.1499 168.286C38.2705 168.286 44.0428 162.513 44.0428 155.393C44.0428 148.272 38.2705 142.5 31.1499 142.5C24.0294 142.5 18.2571 148.272 18.2571 155.393C18.2571 162.513 24.0294 168.286 31.1499 168.286Z"
                                        fill="#A244FF"
                                    />
                                    <path
                                        d="M26.323 157.274C27.415 157.274 27.828 156.553 27.828 155.699V150.82H27.107V155.699C27.107 156.175 26.89 156.581 26.323 156.581C26.267 156.581 25.952 156.567 25.833 156.525L25.763 157.197C25.945 157.239 26.19 157.274 26.323 157.274ZM30.5431 155.713C31.5161 155.713 32.1741 155.076 32.1741 154.271C32.1741 153.564 31.6631 153.123 30.8511 152.92L30.2421 152.766C29.6331 152.612 29.5841 152.29 29.5841 152.136C29.5841 151.695 29.9901 151.422 30.4451 151.422C30.9421 151.422 31.2991 151.73 31.2991 152.185H32.0131C32.0131 151.31 31.3341 150.764 30.4661 150.764C29.6121 150.764 28.8631 151.303 28.8631 152.15C28.8631 152.549 29.0311 153.158 30.0601 153.417L30.6761 153.571C31.0681 153.676 31.4531 153.879 31.4531 154.306C31.4531 154.705 31.1171 155.055 30.5431 155.055C29.9411 155.055 29.5561 154.656 29.5421 154.243H28.8281C28.8281 155.02 29.5141 155.713 30.5431 155.713Z"
                                        fill="white"
                                    />
                                    <g filter="url(#filter2_d_529_1266)">
                                        <path
                                            d="M197.4 14.9282H14.1857C10.4381 14.9282 7.40002 17.9663 7.40002 21.7139V55.6425C7.40002 59.3902 10.4381 62.4282 14.1857 62.4282H197.4C201.148 62.4282 204.186 59.3902 204.186 55.6425V21.7139C204.186 17.9663 201.148 14.9282 197.4 14.9282Z"
                                            fill="white"
                                        />
                                    </g>
                                    <path
                                        d="M111.9 25.7861H76.6143C74.3657 25.7861 72.5428 27.609 72.5428 29.8576C72.5428 32.1061 74.3657 33.929 76.6143 33.929H111.9C114.149 33.929 115.971 32.1061 115.971 29.8576C115.971 27.609 114.149 25.7861 111.9 25.7861Z"
                                        fill="#BFB5FF"
                                        fillOpacity="0.6"
                                    />
                                    <path
                                        d="M136.329 43.4287H76.6143C74.3657 43.4287 72.5428 45.2516 72.5428 47.5001C72.5428 49.7487 74.3657 51.5716 76.6143 51.5716H136.329C138.577 51.5716 140.4 49.7487 140.4 47.5001C140.4 45.2516 138.577 43.4287 136.329 43.4287Z"
                                        fill="#E8E5FF"
                                        fillOpacity="0.6"
                                    />
                                    <path
                                        d="M48.7929 51.5718C55.9134 51.5718 61.6857 45.7995 61.6857 38.679C61.6857 31.5585 55.9134 25.7861 48.7929 25.7861C41.6724 25.7861 35.9 31.5585 35.9 38.679C35.9 45.7995 41.6724 51.5718 48.7929 51.5718Z"
                                        fill="#A244FF"
                                    />
                                    <path
                                        d="M43.9389 39.5282C43.9389 40.3122 44.6389 40.9982 45.6399 40.9982C46.5569 40.9982 47.2079 40.4592 47.2849 39.7032C47.3619 39.0032 46.9629 38.4642 45.9829 38.2052L45.3669 38.0442C44.7929 37.8972 44.7229 37.6032 44.7229 37.4142C44.7229 37.0222 45.1079 36.7492 45.5559 36.7492C46.0599 36.7492 46.3959 37.0292 46.3959 37.4772H47.1379C47.1379 36.5952 46.4659 36.0492 45.5699 36.0492C44.7229 36.0492 43.9809 36.6022 43.9809 37.4282C43.9809 37.8552 44.1419 38.4432 45.1779 38.7232L45.7869 38.8772C46.2349 38.9822 46.5779 39.2132 46.5499 39.6612C46.5009 40.0182 46.2069 40.3192 45.6399 40.3192C45.0589 40.3192 44.7019 39.9202 44.6809 39.5282H43.9389ZM48.9805 36.7982H50.1145C51.0595 36.7982 51.5425 37.5752 51.5425 38.5272C51.5425 39.4862 51.0595 40.2422 50.1145 40.2422H48.9805V36.7982ZM50.1145 40.9282C51.4865 40.9282 52.2845 39.8992 52.2845 38.5272C52.2845 37.1552 51.4865 36.1052 50.1145 36.1052H48.2385V40.9282H50.1145Z"
                                        fill="white"
                                    />
                                    <circle
                                        cx="48.8195"
                                        cy="37.7204"
                                        r="6.05392"
                                        fill="#A244FF"
                                    />
                                    <circle
                                        cx="106.565"
                                        cy="96.3972"
                                        r="6.05392"
                                        fill="#A244FF"
                                    />
                                    <circle
                                        cx="30.192"
                                        cy="154.142"
                                        r="6.05392"
                                        fill="#A244FF"
                                    />
                                    <path
                                        d="M54.8734 35.625L47.1896 42.8819L43.697 39.5833"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M112.618 93.3701L104.935 100.627L101.442 97.3285"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M37.1773 152.047L29.4935 159.304L26.0009 156.005"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <defs>
                                        <filter
                                            id="filter0_d_529_1266"
                                            x="59.7571"
                                            y="70.2861"
                                            width="208.786"
                                            height="59.5"
                                            filterUnits="userSpaceOnUse"
                                            colorInterpolationFilters="sRGB"
                                        >
                                            <feFlood
                                                floodOpacity="0"
                                                result="BackgroundImageFix"
                                            />
                                            <feColorMatrix
                                                in="SourceAlpha"
                                                type="matrix"
                                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                                result="hardAlpha"
                                            />
                                            <feOffset dy="3" />
                                            <feGaussianBlur stdDeviation="3" />
                                            <feColorMatrix
                                                type="matrix"
                                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.161 0"
                                            />
                                            <feBlend
                                                mode="normal"
                                                in2="BackgroundImageFix"
                                                result="effect1_dropShadow_529_1266"
                                            />
                                            <feBlend
                                                mode="normal"
                                                in="SourceGraphic"
                                                in2="effect1_dropShadow_529_1266"
                                                result="shape"
                                            />
                                        </filter>
                                        <filter
                                            id="filter1_d_529_1266"
                                            x="1.40002"
                                            y="128.643"
                                            width="208.786"
                                            height="59.5"
                                            filterUnits="userSpaceOnUse"
                                            colorInterpolationFilters="sRGB"
                                        >
                                            <feFlood
                                                floodOpacity="0"
                                                result="BackgroundImageFix"
                                            />
                                            <feColorMatrix
                                                in="SourceAlpha"
                                                type="matrix"
                                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                                result="hardAlpha"
                                            />
                                            <feOffset dy="3" />
                                            <feGaussianBlur stdDeviation="3" />
                                            <feColorMatrix
                                                type="matrix"
                                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.161 0"
                                            />
                                            <feBlend
                                                mode="normal"
                                                in2="BackgroundImageFix"
                                                result="effect1_dropShadow_529_1266"
                                            />
                                            <feBlend
                                                mode="normal"
                                                in="SourceGraphic"
                                                in2="effect1_dropShadow_529_1266"
                                                result="shape"
                                            />
                                        </filter>
                                        <filter
                                            id="filter2_d_529_1266"
                                            x="0.400024"
                                            y="11.9282"
                                            width="208.786"
                                            height="59.5"
                                            filterUnits="userSpaceOnUse"
                                            colorInterpolationFilters="sRGB"
                                        >
                                            <feFlood
                                                floodOpacity="0"
                                                result="BackgroundImageFix"
                                            />
                                            <feColorMatrix
                                                in="SourceAlpha"
                                                type="matrix"
                                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                                result="hardAlpha"
                                            />
                                            <feOffset dx="-1" dy="3" />
                                            <feGaussianBlur stdDeviation="3" />
                                            <feColorMatrix
                                                type="matrix"
                                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.161 0"
                                            />
                                            <feBlend
                                                mode="normal"
                                                in2="BackgroundImageFix"
                                                result="effect1_dropShadow_529_1266"
                                            />
                                            <feBlend
                                                mode="normal"
                                                in="SourceGraphic"
                                                in2="effect1_dropShadow_529_1266"
                                                result="shape"
                                            />
                                        </filter>
                                        <linearGradient
                                            id="paint0_linear_529_1266"
                                            x1="137.686"
                                            y1="0"
                                            x2="137.686"
                                            y2="190"
                                            gradientUnits="userSpaceOnUse"
                                        >
                                            <stop
                                                stopColor="#D3CCFF"
                                                stopOpacity="0.6"
                                            />
                                            <stop
                                                offset="1"
                                                stopColor="#CFC8FB"
                                                stopOpacity="0.6"
                                            />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                <p className="text-gray-700 text-md font-medium">
                                    { __(
                                        'All are up-to-date.',
                                        'dokan-lite'
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
