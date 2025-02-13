import { __ } from '@wordpress/i18n';
import getSettings from '../../settings/getSettings';
import { twMerge } from 'tailwind-merge';

type DokanModule = {
    image: string;
    title: string;
    description: string;
    tags: string[];
    actions?: Record< string, string >;
    requires?: string[];
};

const ModulePage = () => {
    const modules = getSettings( 'pro-modules' ) satisfies DokanModule[];

    const colors = [
        'green',
        'blue',
        'orange',
        'red',
        'yellow',
        'purple',
        'indigo',
        'amber',
        'pink',
        'teal',
        'gray',
    ];

    const tags = modules.map( ( module: DokanModule ) => module.tags ).flat();
    const uniqueTags = [ ...new Set( tags ) ];

    const mapedTagswithColors = uniqueTags.reduce(
        ( acc, tag, index ) => {
            acc[ tag ] = colors[ index % colors.length ];
            return acc;
        },
        {} as Record< string, string >
    );

    return (
        <>
            <div className="header p-5">
                <h1 className="text-2xl font-semibold">
                    { __( 'Modules', 'dokan-lite' ) }
                </h1>
            </div>

            <div className="navbar flex px-5 pl-0 py-3 items-center">
                <div className="navbar-left flex items-center mr-auto">
                    <div className="navbar-tabs flex items-center ml-4">
                        <div className="px-4 py-2 border-b-2 border-blue-500 font-semibold">
                            { __( 'My Modules (40)', 'dokan-lite' ) }
                        </div>
                        <div className="px-4 py-2 cursor-pointer">
                            { __( 'Active (0)', 'dokan-lite' ) }
                        </div>
                        <div className="px-4 py-2 cursor-pointer">
                            { __( 'Inactive (40)', 'dokan-lite' ) }
                        </div>
                    </div>
                </div>
                <div className="navbar-right flex items-center"></div>
            </div>

            <div className="modules-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-6">
                { modules.map( ( module: DokanModule, index ) => (
                    <div
                        key={ index }
                        className="module-card border border-gray-300 rounded-md p-4 bg-white shadow"
                    >
                        <img
                            src={ module.image }
                            alt={ module.title }
                            className="module-image w-24 object-cover rounded-sm mb-4 aspect-3/2"
                        />

                        <h3 className="mt-0 mb-2 text-lg font-semibold">
                            { module.title }
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            { module.description }
                        </p>
                        <div className="module-tags flex gap-2 mb-3">
                            { module.tags.map( ( tag, tagIndex ) => (
                                <span
                                    key={ tagIndex }
                                    className={ twMerge(
                                        'module-tag px-2.5 py-1 rounded-full text-xs font-semibold',
                                        `bg-${ mapedTagswithColors[ tag ] }-100 text-${ mapedTagswithColors[ tag ] }-800`
                                    ) }
                                >
                                    { tag }
                                </span>
                            ) ) }
                        </div>
                        <div className="module-actions flex gap-4 items-center mt-4">
                            { module.actions &&
                                Object.entries( module.actions ).map(
                                    ( [ action, value ], actionIndex ) => (
                                        <a
                                            key={ actionIndex }
                                            href={ value }
                                            className="text-gray-500 text-sm no-underline"
                                        >
                                            { 'docs' === action
                                                ? __( 'Docs', 'dokan-lite' )
                                                : __( 'Video', 'dokan-lite' ) }
                                        </a>
                                    )
                                ) }
                            <div className="toggle-container ml-auto">
                                <label className="toggle-switch relative inline-block w-10 h-5">
                                    <input
                                        type="checkbox"
                                        className="opacity-0 w-0 h-0"
                                        defaultChecked
                                    />
                                    <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 transition-all duration-400 rounded-full before:absolute before:content-[''] before:h-4 before:w-4 before:left-0.5 before:bottom-0.5 before:bg-white before:transition-all before:duration-400 before:rounded-full checked:bg-blue-500 checked:before:translate-x-5"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                ) ) }
            </div>
        </>
    );
};

export default ModulePage;
