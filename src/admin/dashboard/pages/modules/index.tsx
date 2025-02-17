import { __ } from '@wordpress/i18n';
import getSettings from '../../settings/getSettings';
import { Modal } from '@getdokan/dokan-ui';
import { useEffect, useState } from '@wordpress/element';
import Card from './Card';
import UpgradeModal from './UpgradeModal';

export type DokanModule = {
    image: string;
    title: string;
    description: string;
    tags: string[];
    actions?: Record< string, string >;
    requires?: string[];
};

const ModulePage = () => {
    const [ showModal, setShowModal ] = useState( true );

    const [ modules, setModules ] = useState< DokanModule[] >( [] );
    const [ filter, setFilter ] = useState< Array< string > >( [] );

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
    ) satisfies Record< string, string >;

    useEffect( () => {
        const allModules = getSettings( 'pro-modules' )
            .modules satisfies DokanModule[];

        setModules( allModules );
    }, [] );

    // Tailwind CSS classes for tags, without it we can not have dynamic classes generated in css.
    const className =
        'bg-green-100 text-green-800 bg-blue-100 text-blue-800 bg-orange-100 text-orange-800 bg-red-100 text-red-800 bg-yellow-100 text-yellow-800 bg-purple-100 text-purple-800 bg-indigo-100 text-indigo-800 bg-amber-100 text-amber-800 bg-pink-100 text-pink-800 bg-teal-100 text-teal-800 bg-gray-100 text-gray-800';

    const handleCardToggle = ( toggle: boolean ) => {
        setShowModal( toggle );
    };

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
                    <Card
                        key={ index }
                        module={ module }
                        onChange={ handleCardToggle }
                        colors={ mapedTagswithColors }
                    />
                ) ) }
            </div>

            <UpgradeModal
                isOpen={ showModal }
                onClose={ () => setShowModal( false ) }
            />
        </>
    );
};

export default ModulePage;
