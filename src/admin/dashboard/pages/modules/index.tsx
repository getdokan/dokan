import { __ } from '@wordpress/i18n';
import getSettings from '../../settings/getSettings';
import { useEffect, useState } from '@wordpress/element';
import Card from './Card';
import UpgradeModal from './UpgradeModal';
import CategorySelector from './CategorySelector';
import SearchBox from './SearchBox';

export type DokanModule = {
    image: string;
    title: string;
    description: string;
    tags: string[];
    actions?: Record< string, string >;
    requires?: string[];
};

const ModulePage = () => {
    const [ showModal, setShowModal ] = useState( false );

    const [ modules, setModules ] = useState< DokanModule[] >( [] );
    const [ filter, setFilter ] = useState< Array< string > >( [] );
    const [ search, setSearch ] = useState< string >( '' );

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

    const allModules = getSettings( 'pro-modules' )
        .modules satisfies DokanModule[];

    const tags = allModules
        .map( ( module: DokanModule ) => module.tags )
        .flat();
    const uniqueTags = [ ...new Set( tags ) ];

    const mapedTagswithColors = uniqueTags.reduce(
        ( acc, tag, index ) => {
            acc[ tag ] = colors[ index % colors.length ];
            return acc;
        },
        {} as Record< string, string >
    ) satisfies Record< string, string >;

    // count the unique tags usage in modules
    const tagsCount = allModules.reduce(
        ( acc, module ) => {
            module.tags.forEach( ( tag ) => {
                if ( acc[ tag ] ) {
                    acc[ tag ] += 1;
                } else {
                    acc[ tag ] = 1;
                }
            } );
            return acc;
        },
        {} as Record< string, number >
    );

    useEffect( () => {
        setModules( allModules );
    }, [ allModules ] );

    const searchInModules = (
        searchTerms: string,
        searchModules: DokanModule[]
    ): DokanModule[] => {
        if ( searchTerms.length === 0 ) {
            return searchModules;
        }

        return searchModules.filter( ( module: DokanModule ) => {
            return module.title
                .toLowerCase()
                .includes( searchTerms.toLowerCase() );
        } );
    };

    useEffect( () => {
        let filteredModules: Array< DokanModule > = allModules;

        if ( filter.length === 0 ) {
            setModules( searchInModules( search, allModules ) );
            return;
        }

        filteredModules = allModules.filter( ( module: DokanModule ) => {
            return module.tags.some( ( tag ) => filter.includes( tag ) );
        } );

        setModules( searchInModules( search, filteredModules ) );
    }, [ allModules, filter, search ] );

    // Tailwind CSS classes for tags, without it we can not have dynamic classes generated in css.
    const className =
        'bg-green-100 text-green-800 bg-blue-100 text-blue-800 bg-orange-100 text-orange-800 bg-red-100 text-red-800 bg-yellow-100 text-yellow-800 bg-purple-100 text-purple-800 bg-indigo-100 text-indigo-800 bg-amber-100 text-amber-800 bg-pink-100 text-pink-800 bg-teal-100 text-teal-800 bg-gray-100 text-gray-800';

    const handleCardToggle = ( toggle: boolean ) => {
        setShowModal( toggle );
    };

    const removeTagFilter = ( tag: string ) => {
        setFilter( filter.filter( ( t ) => t !== tag ) );
    };

    return (
        <>
            <div className="header py-5">
                <h1 className="text-2xl font-semibold">
                    { __( 'Modules', 'dokan-lite' ) }
                </h1>
            </div>

            <div className="navbar flex py-3 items-center">
                <div className="navbar-left flex items-center mr-auto">
                    <div className="navbar-tabs flex items-center">
                        <div className="mr-4 py-2 border-b-2 border-blue-500 text-[#1a9ed4] font-semibold cursor-pointer">
                            { __( 'My Modules (40)', 'dokan-lite' ) }
                        </div>
                        <div
                            className="mx-4 py-2 cursor-pointer"
                            onClick={ () => setShowModal( true ) }
                        >
                            { __( 'Active (0)', 'dokan-lite' ) }
                        </div>
                        <div
                            className="mx-4 py-2 cursor-pointer"
                            onClick={ () => setShowModal( true ) }
                        >
                            { __( 'Inactive (40)', 'dokan-lite' ) }
                        </div>
                    </div>
                </div>
                <div className="navbar-right flex items-center gap-5">
                    <CategorySelector
                        categories={ tagsCount }
                        onChange={ ( cat ) => setFilter( cat ) }
                        selectedCategories={ filter }
                    />
                    <SearchBox
                        className="bg-white border border-gray-300"
                        setSearch={ ( currentState ) =>
                            setSearch( currentState )
                        }
                    />
                </div>
            </div>

            <div
                className={ `flex gap-2 ${ filter.length > 0 ? 'py-3' : '' }` }
            >
                { filter.map( ( tag, tagIndex ) => (
                    <div
                        key={ tagIndex }
                        className={ `flex gap-1.5 px-2.5 py-1 rounded-full text-xs align-middle font-semibold bg-white border border-gray-300` }
                    >
                        { tag }

                        <svg
                            className="cursor-pointer inline-block mt-0.5"
                            onClick={ () => removeTagFilter( tag ) }
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M4.84845 5.62113L8.13558 8.90826L9.0607 7.98314L5.77356 4.69601L9.4091 1.06047L8.55578 0.207151L4.92024 3.84269L1.62569 0.548139L0.700574 1.47325L3.99513 4.76781L0.294667 8.46827L1.14799 9.32159L4.84845 5.62113Z"
                                fill="#B1B1B1"
                            ></path>
                        </svg>
                    </div>
                ) ) }
                { filter.length > 0 && (
                    <button
                        onClick={ () => setFilter( [] ) }
                        className="px-2.5 py-1 text-xs font-semibold underline cursor-pointer"
                    >
                        { __( 'Clear filter', 'dokan-lite' ) }
                    </button>
                ) }
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 py-5">
                { modules.map( ( module: DokanModule, index ) => (
                    <Card
                        key={ index }
                        module={ module }
                        onChange={ handleCardToggle }
                        colors={ mapedTagswithColors }
                        onTagClick={ ( tag ) => {
                            if ( ! filter.includes( tag ) ) {
                                setFilter( [ ...filter, tag ] );
                            }
                        } }
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
