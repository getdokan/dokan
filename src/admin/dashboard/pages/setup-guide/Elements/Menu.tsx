import { SettingsElement } from '../StepSettings';

function classNames( ...classes ) {
    return classes.filter( Boolean ).join( ' ' );
}

const Menu = ( {
    pages,
    loading,
    activePage,
    onMenuClick,
}: {
    pages: SettingsElement[];
    loading: boolean;
    activePage: string;
    onMenuClick: ( page: string ) => void;
} ): JSX.Element => {
    return (
        <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
            <nav className="bg-white rounded-md">
                { ! loading &&
                    pages.map( ( item: SettingsElement ) => {
                        if ( ! item.display ) {
                            return <></>;
                        }
                        return (
                            <a
                                key={ item.id }
                                href={ item.id }
                                onClick={ ( e ) => {
                                    e.preventDefault();
                                    onMenuClick( item.id );
                                } }
                                className={ classNames(
                                    item.id === activePage
                                        ? 'bg-gray-50 text-orange-600 hover:bg-white'
                                        : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50',
                                    'group rounded-md px-6 py-3 flex items-center text-sm font-medium'
                                ) }
                                aria-current={
                                    item.id === activePage ? 'page' : undefined
                                }
                            >
                                <span className="truncate">{ item.title }</span>
                            </a>
                        );
                    } ) }
            </nav>
        </aside>
    );
};

export default Menu;
