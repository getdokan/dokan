/**
 * Behaviour for the store filter bar block.
 *
 * On the front end Dokan's own listing script owns these controls, so this only
 * steps in when that script is absent. In the block editor it always runs: the
 * server rendered preview is inert HTML, and the editor never loads the listing
 * script. Everything is delegated from the document because editor previews
 * replace their markup on every attribute change.
 */
( function () {
    // Set by Dokan's admin-only preview enqueue, so it is true from parse time — the
    // canvas body class only lands later, and the DOM check is the front-end fallback.
    const isEditor = () =>
        !! window.dokanBlocksEditorPreview ||
        ( !! document.body &&
            ( document.body.classList.contains( 'block-editor-iframe__body' ) ||
                !! document.querySelector(
                    '.block-editor-block-list__layout'
                ) ) );

    // Dokan's listing script binds the same controls by id; let it win.
    const legacyDrivesPage = () =>
        ! isEditor() && !! ( window.dokan && window.dokan.storeLists );

    const closestBar = ( target ) =>
        target && target.closest
            ? target.closest( '.dokan-store-filter-bar-block' )
            : null;

    const getForm = ( bar ) =>
        bar
            ? bar.querySelector( 'form[name="dokan_store_lists_filter_form"]' )
            : null;

    const toggleForm = ( bar ) => {
        const form = getForm( bar );

        if ( ! form ) {
            return;
        }

        form.style.display =
            window.getComputedStyle( form ).display === 'none'
                ? 'block'
                : 'none';
    };

    const applyLayout = ( view ) => {
        document
            .querySelectorAll(
                '.dokan-store-list-block [id="dokan-seller-listing-wrap"]'
            )
            .forEach( ( wrap ) => {
                wrap.classList.remove( 'grid-view', 'list-view' );
                wrap.classList.add( view );
            } );

        document
            .querySelectorAll(
                '.dokan-store-filter-bar-block .toggle-view span'
            )
            .forEach( ( span ) => {
                span.classList.toggle( 'active', span.dataset.view === view );
            } );

        if ( isEditor() ) {
            return; // A preview must not rewrite the visitor's saved preference.
        }

        try {
            window.localStorage.setItem( 'dokan-layout', view );
        } catch ( error ) {
            // Layout preference is optional.
        }
    };

    // Extensions opt into preview behaviour with data-dokan-preview-* markup; see Blocks\Manager for the contract.
    const togglePreviewTarget = ( trigger, bar ) => {
        const target = bar.querySelector( trigger.dataset.dokanPreviewToggle );

        if ( target ) {
            target.style.display =
                window.getComputedStyle( target ).display === 'none'
                    ? 'block'
                    : 'none';
        }
    };

    const choosePreviewItem = ( item ) => {
        const group = item.closest( '[data-dokan-preview-choices]' );

        if ( ! group ) {
            return;
        }

        const activeClass = group.dataset.dokanPreviewActiveClass || 'active';
        const wasActive = item.classList.contains( activeClass );

        if ( group.hasAttribute( 'data-dokan-preview-single' ) ) {
            group
                .querySelectorAll( '[data-dokan-preview-choice]' )
                .forEach( ( other ) => other.classList.remove( activeClass ) );
        }

        item.classList.toggle( activeClass, ! wasActive );

        const label = group.dataset.dokanPreviewLabel
            ? group.querySelector( group.dataset.dokanPreviewLabel )
            : null;

        if ( ! label ) {
            return;
        }

        if ( ! label.dataset.dokanPreviewDefault ) {
            label.dataset.dokanPreviewDefault = label.textContent.trim();
        }

        const chosen = Array.from(
            group.querySelectorAll( '[data-dokan-preview-choice]' )
        )
            .filter( ( other ) => other.classList.contains( activeClass ) )
            .map( ( other ) => other.textContent.trim() );

        label.textContent = chosen.length
            ? chosen.join( ', ' )
            : label.dataset.dokanPreviewDefault;
    };

    document.addEventListener(
        'click',
        function ( event ) {
            if ( legacyDrivesPage() ) {
                return;
            }

            const bar = closestBar( event.target );

            if ( bar ) {
                const layoutToggle =
                    event.target.closest( '.toggle-view span' );

                if ( layoutToggle ) {
                    applyLayout( layoutToggle.dataset.view );
                    return;
                }

                const previewToggle = event.target.closest(
                    '[data-dokan-preview-toggle]'
                );

                if ( previewToggle ) {
                    event.preventDefault();
                    togglePreviewTarget( previewToggle, bar );
                    return;
                }

                const previewChoice = event.target.closest(
                    '[data-dokan-preview-choice]'
                );

                if ( previewChoice ) {
                    event.preventDefault();
                    choosePreviewItem( previewChoice );
                    return;
                }

                if (
                    event.target.closest(
                        '.dokan-store-list-filter-button, .dokan-icons, #cancel-filter-btn'
                    )
                ) {
                    event.preventDefault();
                    toggleForm( bar );
                    return;
                }
            }

            if ( ! isEditor() ) {
                return;
            }

            // Store cards, pagination and Apply are real links and forms in the
            // preview; following one would navigate the editor away from the post.
            const block = event.target.closest(
                '.dokan-store-filter-bar-block, .dokan-store-list-block'
            );

            if (
                block &&
                event.target.closest( 'a[href], button[type="submit"]' )
            ) {
                event.preventDefault();
            }
        },
        true
    );

    document.addEventListener( 'change', function ( event ) {
        if ( legacyDrivesPage() || ! closestBar( event.target ) ) {
            return;
        }

        if (
            ! event.target.matches( 'select[name="stores_orderby"]' ) ||
            isEditor()
        ) {
            return; // Sorting in a preview would reload the editor.
        }

        const url = new URL( window.location.href );

        url.searchParams.set( 'stores_orderby', event.target.value );
        url.searchParams.delete( 'paged' );

        window.location.assign( url.toString() );
    } );

    const restoreState = () => {
        if ( legacyDrivesPage() || isEditor() ) {
            return; // A preview must not restore the visitor's saved state.
        }

        let storedLayout = null;

        try {
            storedLayout = window.localStorage.getItem( 'dokan-layout' );
        } catch ( error ) {
            storedLayout = null;
        }

        if ( storedLayout ) {
            applyLayout( storedLayout );
        }

        // Keep the filter form open on an active search, matching the classic page.
        if (
            new URL( window.location.href ).searchParams.get(
                'dokan_seller_search'
            )
        ) {
            document
                .querySelectorAll( '.dokan-store-filter-bar-block' )
                .forEach( ( bar ) => {
                    const form = getForm( bar );

                    if ( form ) {
                        form.style.display = 'block';
                    }
                } );
        }
    };

    // Defined by the dokan-blocks-store-listing dependency; this script only reads it.
    const extensions = ( window.dokanStoreListing =
        window.dokanStoreListing || {
            starters: [],
            onRender( starter ) {
                this.starters.push( starter );
            },
        } );

    const startExtensions = () => {
        // Each container is flagged on its own, so a re-rendered block starts again while its untouched neighbour is left alone.
        const start = () => {
            if ( ! isEditor() ) {
                return; // Checked at match time: the canvas body class lands after this script boots.
            }

            const fresh = Array.from(
                document.querySelectorAll(
                    '.dokan-store-list-block, .dokan-store-filter-bar-block'
                )
            ).filter( ( listing ) => ! listing.dataset.dokanStarted );

            if ( ! fresh.length ) {
                return;
            }

            fresh.forEach( ( listing ) => {
                listing.dataset.dokanStarted = 'true';
            } );

            // Scoped to what just appeared, so an extension need not rebuild the whole page.
            extensions.starters.forEach( ( starter ) => starter( fresh ) );
        };

        start();

        // Only the editor re-renders a block in place, so nothing to watch elsewhere.
        if ( ! isEditor() || ! window.MutationObserver ) {
            return;
        }

        // Watch the root: the canvas swaps its body while it mounts. Once the block
        // list exists, narrow to it so sidebar and toolbar churn stops waking this.
        const observer = new window.MutationObserver( () => {
            start();

            const canvas = document.querySelector(
                '.block-editor-block-list__layout'
            );

            if ( canvas && observer.takeRecords ) {
                observer.disconnect();
                observer.observe( canvas, { childList: true, subtree: true } );
            }
        } );

        observer.observe( document.documentElement, {
            childList: true,
            subtree: true,
        } );
    };

    // The bar counts what the query string asks for; the grid also applies its own
    // block settings, so where the two disagree the grid is the honest number.
    const syncStoreCount = () => {
        const grid = document.querySelector(
            '.dokan-store-list-block[data-dokan-store-count]'
        );

        if ( ! grid ) {
            return;
        }

        document
            .querySelectorAll(
                '.dokan-store-filter-bar-block .store-count-value'
            )
            .forEach( ( value ) => {
                value.textContent = grid.dataset.dokanStoreCount;
            } );
    };

    const boot = () => {
        restoreState();
        syncStoreCount();

        startExtensions();
    };

    if ( document.readyState === 'loading' ) {
        document.addEventListener( 'DOMContentLoaded', boot );
    } else {
        boot();
    }
} )();
