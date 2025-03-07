import { __ } from '@wordpress/i18n';

const Forbidden = () => {
    // @ts-ignore
    const dashBoardUrl = window.dokan?.urls?.dashboardUrl ?? '#';

    return (
        <div className="text-center">
            <p className="text-lg font-semibold text-indigo-600">
                { __( '403', 'dokan' ) }
            </p>
            <h1 className="mt-4 text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
                { __( 'Access Forbidden', 'dokan' ) }
            </h1>
            <p className="mt-6 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
                { __(
                    'Sorry, You have no permission to view this page',
                    'dokan'
                ) }
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                    href={ dashBoardUrl }
                    className="rounded-md bg-dokan-btn px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-dokan-btn-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    { __( 'Go back home', 'dokan' ) }
                </a>
            </div>
        </div>
    );
};

export default Forbidden;
