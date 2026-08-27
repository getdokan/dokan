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
    // The canvas is its own iframe with no `wp` global, so detect it from the DOM.
    const isEditor = () =>
        !! document.body &&
        ( document.body.classList.contains( 'block-editor-iframe__body' ) ||
            !! document.querySelector( '.block-editor-block-list__layout' ) );

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

    /*
     * Controls added to the bar by other plugins opt into preview behaviour with
     * markup instead of script, because the editor canvas is an iframe and the
     * only script WordPress loads inside it is this block's own view script.
     *
     *   data-dokan-preview-toggle="<selector>"  show/hide that element on click
     *   data-dokan-preview-choices              marks a group of choices, with
     *     data-dokan-preview-single             one choice at a time
     *     data-dokan-preview-active-class       class marking a chosen item
     *     data-dokan-preview-label="<selector>" element listing the chosen items
     *   data-dokan-preview-choice               a choice inside such a group
     */
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
        if ( legacyDrivesPage() ) {
            return;
        }

        if ( ! isEditor() ) {
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
        }
    };

    // Extensions that draw into the listing register a starter here; the editor renders the block after their scripts have run, so this view script — the one WordPress guarantees runs against the live canvas — calls them once the markup is here. Front-end scripts already run after the markup and never need it.
    const extensions = ( window.dokanStoreListing =
        window.dokanStoreListing || {
            starters: [],
            onRender( starter ) {
                this.starters.push( starter );
            },
        } );

    const startExtensions = () => {
        // Checked at match time, not now: the canvas body class and the markup both land after this deferred script boots.
        const start = () => {
            const listing = document.querySelector(
                '.dokan-store-list-block, .dokan-store-filter-bar-block'
            );

            if ( ! isEditor() || ! listing || listing.dataset.dokanStarted ) {
                return false;
            }

            listing.dataset.dokanStarted = 'true';
            extensions.starters.forEach( ( starter ) => starter( document ) );

            return true;
        };

        if ( start() || ! window.MutationObserver ) {
            return;
        }

        // Watch the root, not the body: the canvas swaps its body while it mounts, and an observer on the old one never hears about the block. The editor re-renders the block on every attribute change, so keep watching; each new render starts once.
        new window.MutationObserver( start ).observe(
            document.documentElement,
            {
                childList: true,
                subtree: true,
            }
        );
    };

    const boot = () => {
        restoreState();

        startExtensions();
    };

    if ( document.readyState === 'loading' ) {
        document.addEventListener( 'DOMContentLoaded', boot );
    } else {
        boot();
    }
} )();
