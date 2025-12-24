import { SearchControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const SearchBox = ( { className, setSearch } ) => {
    const [ searchInput, setSearchInput ] = useState( '' );

    useEffect( () => {
        setSearch( searchInput );
    }, [ searchInput, setSearch ] );

    return (
        <SearchControl
            style={ { '--wp-components-color-background': '#fff' } }
            label={ __( 'Search Modules', 'dokan-lite' ) }
            size="compact"
            className={ className }
            __nextHasNoMarginBottom
            value={ searchInput }
            onChange={ setSearchInput }
            placeholder={ __( 'Search Modules', 'dokan-lite' ) }
        />
    );
};

export default SearchBox;
