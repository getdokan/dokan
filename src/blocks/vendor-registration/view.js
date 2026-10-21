// Front-end steps of the Vendor Registration Form block: Back / Next with a required-field check per step.
const fieldsOf = ( step ) =>
    Array.from( step.querySelectorAll( 'input, select, textarea' ) ).filter(
        ( field ) => field.willValidate && 'hidden' !== field.type
    );

// A shop URL marked "Not Available" by Dokan's check blocks its step too.
const takenShopUrl = ( step ) => {
    const status = step.querySelector( '#url-alart-mgs.text-danger' );

    return status ? step.querySelector( '#seller-url' ) : null;
};

const firstInvalid = ( step ) =>
    fieldsOf( step ).find( ( field ) => ! field.checkValidity() ) ||
    takenShopUrl( step );

const initForm = ( form ) => {
    const steps = Array.from( form.querySelectorAll( '.dokan-vreg__step' ) );
    const items = Array.from(
        form.querySelectorAll( '.dokan-vreg__step-item' )
    );
    let current = 0;

    const show = ( index ) => {
        steps.forEach( ( step, i ) => {
            step.hidden = i !== index;
            step.classList.toggle( 'is-active', i === index );
        } );
        items.forEach( ( item, i ) => {
            item.classList.toggle( 'is-active', i === index );
            item.classList.toggle( 'is-done', i < index );

            if ( i === index ) {
                item.setAttribute( 'aria-current', 'step' );
            } else {
                item.removeAttribute( 'aria-current' );
            }
        } );
        current = index;

        // Screen readers hear "Step 2 of 3: …"; an invalid field reported next takes focus from here.
        const note = steps[ index ]?.querySelector( '.dokan-vreg__step-note' );
        if ( note ) {
            note.focus( { preventScroll: true } );
        }

        const top = form.getBoundingClientRect().top;
        if ( top < 0 ) {
            form.scrollIntoView( { behavior: 'smooth', block: 'start' } );
        }
    };

    const report = ( field ) => {
        if ( field.reportValidity && ! field.checkValidity() ) {
            field.reportValidity();
        } else {
            field.focus();
        }
    };

    form.addEventListener( 'click', ( event ) => {
        if ( event.target.closest( '.dokan-vreg__next' ) ) {
            event.preventDefault();
            const invalid = firstInvalid( steps[ current ] );

            if ( invalid ) {
                report( invalid );
                return;
            }

            show( Math.min( current + 1, steps.length - 1 ) );
        }

        if ( event.target.closest( '.dokan-vreg__back' ) ) {
            event.preventDefault();
            show( Math.max( current - 1, 0 ) );
        }
    } );

    // Capture phase, so an invalid form never reaches the captcha token handler.
    form.addEventListener(
        'submit',
        ( event ) => {
            // An admin's preview never submits.
            if ( form.dataset.preview ) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return;
            }

            // Enter on an earlier step moves on instead of submitting past steps the visitor hasn't seen.
            if ( current < steps.length - 1 ) {
                event.preventDefault();
                event.stopImmediatePropagation();
                const invalid = firstInvalid( steps[ current ] );

                if ( invalid ) {
                    report( invalid );
                } else {
                    show( current + 1 );
                }

                return;
            }

            for ( let i = 0; i < steps.length; i++ ) {
                const invalid = firstInvalid( steps[ i ] );

                if ( invalid ) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    show( i );
                    report( invalid );
                    return;
                }
            }
        },
        true
    );
};

// "Already have an account? Log in" opens the login box above the form.
const initLoginToggle = ( wrapper ) => {
    const toggle = wrapper.querySelector( '.dokan-vreg__login-toggle' );
    const box = wrapper.querySelector( '.dokan-vreg__login' );

    if ( ! toggle || ! box ) {
        return;
    }

    toggle.addEventListener( 'click', () => {
        box.hidden = ! box.hidden;
        toggle.setAttribute( 'aria-expanded', String( ! box.hidden ) );

        if ( ! box.hidden ) {
            box.querySelector( 'input[name="username"]' )?.focus();
        }
    } );
};

// Dokan's address script rebuilds the state field on country change; keep the form's own "required" choice.
// Delegated, so it also covers the block's fields drawn in My Account.
document.addEventListener( 'change', ( event ) => {
    if ( ! event.target.matches( '.dokan-vreg select.country_to_state' ) ) {
        return;
    }

    const container = event.target.closest( '.dokan-vreg' );

    window.setTimeout( () => {
        const box = container.querySelector( '#dokan-states-box' );
        const state = container.querySelector( '#dokan_address_state' );

        if ( box && state ) {
            state.required =
                '1' === box.dataset.required &&
                'none' !== window.getComputedStyle( box ).display;
        }
    }, 50 );
} );

// My Account: Dokan disables the vendor inputs and selects for customers; the block's text areas follow along.
const syncVendorTextareas = () => {
    const role = document.querySelector(
        '.vendor-customer-registration input[name="role"]:checked'
    );

    document
        .querySelectorAll( '.show_if_seller.dokan-vreg textarea' )
        .forEach( ( textarea ) => {
            textarea.disabled = !! role && 'seller' !== role.value;
        } );
};

document.addEventListener( 'change', ( event ) => {
    if (
        event.target.matches(
            '.vendor-customer-registration input[name="role"]'
        )
    ) {
        syncVendorTextareas();
    }
} );

const boot = () => {
    syncVendorTextareas();
    document.querySelectorAll( '.dokan-vreg__form' ).forEach( initForm );
    document.querySelectorAll( '.dokan-vreg' ).forEach( initLoginToggle );
};

if ( 'loading' === document.readyState ) {
    document.addEventListener( 'DOMContentLoaded', boot );
} else {
    boot();
}
