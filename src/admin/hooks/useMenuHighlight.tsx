import { useEffect } from '@wordpress/element';
import { getQueryArg, getQueryArgs } from '@wordpress/url';

export const useMenuHighlight = ( options ) => {
    const { menuSlug = 'dokan', paths = [], queryParams = {} } = options;

    useEffect( () => {
        const menuRoot = document.getElementById(
            `toplevel_page_${ menuSlug }`
        );
        if ( ! menuRoot ) {
            return;
        }

        const highlightMenu = () => {
            const currentHash = window.location.hash.replace( '#/', '' );
            // Use WordPress URL utility instead of URLSearchParams
            getQueryArgs( window.location.href );
            const submenuItems =
                menuRoot.querySelectorAll( 'ul.wp-submenu li' );
            submenuItems.forEach( ( item ) =>
                item.classList.remove( 'current' )
            );

            // Check for hash-based paths
            if ( paths.some( ( path ) => currentHash.startsWith( path ) ) ) {
                const submenuLinks =
                    menuRoot.querySelectorAll( 'ul.wp-submenu a' );
                for ( let i = 0; i < submenuLinks.length; i++ ) {
                    const link = submenuLinks[ i ];
                    const href = link.getAttribute( 'href' ) || '';

                    if ( paths.some( ( path ) => href.includes( path ) ) ) {
                        link.parentElement?.classList.add( 'current' );
                        break;
                    }
                }
                return;
            }

            // Check for query parameter based paths
            let matchFound = false;
            for ( const [ key, value ] of Object.entries( queryParams ) ) {
                // Use getQueryArg to check if current URL has the parameter
                if ( getQueryArg( window.location.href, key ) === value ) {
                    const submenuLinks =
                        menuRoot.querySelectorAll( 'ul.wp-submenu a' );

                    for ( let i = 0; i < submenuLinks.length; i++ ) {
                        const link = submenuLinks[ i ];
                        const href = link.getAttribute( 'href' ) || '';

                        // Use getQueryArg to check menu item URL
                        const hrefParam = getQueryArg( href, key );

                        if ( hrefParam === value ) {
                            link.parentElement?.classList.add( 'current' );
                            matchFound = true;
                            break;
                        }
                    }

                    if ( matchFound ) {
                        break;
                    }
                }
            }
        };

        // Run initially
        highlightMenu();

        // Update on hash changes and history changes
        window.addEventListener( 'hashchange', highlightMenu );
        window.addEventListener( 'popstate', highlightMenu );

        // Clean up
        return () => {
            window.removeEventListener( 'hashchange', highlightMenu );
            window.removeEventListener( 'popstate', highlightMenu );
        };
    }, [ menuSlug, JSON.stringify( paths ), JSON.stringify( queryParams ) ] );
};
