import {
    createPortal,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from '@wordpress/element';
import IntroCard from './IntroCard';
import ReadyCard from './ReadyCard';
import SchemaStep from './SchemaStep';
import ProgressRail from './ProgressRail';
import registerWizardFields from './register-fields';
import { StepNavContext } from './step-nav';
import type { WizardBootstrap, WizardStepKey, WizardStepOrder } from './types';

registerWizardFields();

// Only the two cards are bespoke; anything carrying a schema renders through
// the shared engine shell, so a Pro or third-party step needs no Lite release.
const stepCards: Record<
    string,
    ( props: { payload: never } ) => JSX.Element
> = {
    intro: IntroCard,
    ready: ReadyCard,
};

export default function Wizard( { boot }: { boot: WizardBootstrap } ) {
    const shell = boot.shell;
    const order = useMemo( () => shell?.order ?? [], [ shell ] );

    const [ current, setCurrent ] = useState< WizardStepKey >(
        ( shell?.initialStep as WizardStepKey ) ?? 'intro'
    );

    // Claim the rail host once, dropping PHP's first frame so React owns it from here.
    const [ railHost ] = useState( () => {
        const host = document.getElementById( 'dokan-vsw-rail-mount' );

        if ( host ) {
            host.innerHTML = '';
        }

        return host;
    } );

    const indexOf = useCallback(
        ( step: WizardStepKey ) => order.findIndex( ( s ) => s.key === step ),
        [ order ]
    );

    // The body classes drive the wizard chrome, so they follow the step like the PHP shell did.
    useEffect( () => {
        const { body } = document;
        const entry = order.find( ( s ) => s.key === current );
        const centred = !! entry?.centred;

        Array.from( body.classList ).forEach( ( name ) => {
            if ( name.startsWith( 'dokan-vsw-step-' ) ) {
                body.classList.remove( name );
            }
        } );

        body.classList.add( `dokan-vsw-step-${ entry?.stepArg ?? current }` );
        body.classList.toggle( 'dokan-vsw-center', centred );
        body.classList.toggle( 'dokan-vsw-form', ! centred );
    }, [ current, order ] );

    const go = useCallback(
        ( entry: WizardStepOrder, push = true ) => {
            const step = entry.key as WizardStepKey;

            // A step this bundle can't mount — an older Pro's verification view,
            // a third-party step — still belongs in the flow: hand it its page.
            if ( ! boot.steps[ step ] ) {
                window.location.assign( entry.url );
                return;
            }

            if ( push ) {
                // The same server-minted link the fallback navigates to, so the two can't drift.
                window.history.pushState(
                    { dokanWizardStep: step },
                    '',
                    entry.url
                );
            }

            setCurrent( step );
            window.scrollTo( { top: 0 } );
        },
        [ boot.steps ]
    );

    // The landing entry is browser-made and carries no state, so Back would strand the wizard on the step it reached.
    useEffect( () => {
        window.history.replaceState(
            { ...window.history.state, dokanWizardStep: current },
            ''
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [] );

    // Back/forward must move the wizard, not leave the browser on a stale step.
    useEffect( () => {
        const onPop = ( event: PopStateEvent ) => {
            const step = ( event.state as { dokanWizardStep?: WizardStepKey } )
                ?.dokanWizardStep;
            const entry = order.find( ( s ) => s.key === step );

            if ( entry && step && boot.steps[ step ] ) {
                go( entry, false );
            }
        };

        window.addEventListener( 'popstate', onPop );
        return () => window.removeEventListener( 'popstate', onPop );
    }, [ boot.steps, go, order ] );

    const neighbour = ( relative: number ): WizardStepOrder | undefined =>
        order[ indexOf( current ) + relative ];

    const nav = {
        next: neighbour( 1 ),
        previous: neighbour( -1 ),
        goTo: go,
    };

    const payload = boot.steps[ current ];
    const Step = stepCards[ current ] ?? ( payload?.schema && SchemaStep );

    if ( ! payload || ! Step ) {
        return null;
    }

    return (
        <StepNavContext.Provider value={ nav }>
            { railHost &&
                createPortal(
                    <ProgressRail order={ order } current={ current } />,
                    railHost
                ) }

            { /* Keyed by step: schema steps share one component, and each needs its own mount to seed from its own payload. */ }
            <Step key={ current } payload={ payload } />
        </StepNavContext.Provider>
    );
}
