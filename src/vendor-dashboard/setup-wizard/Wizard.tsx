import {
    createPortal,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from '@wordpress/element';
import IntroCard from './IntroCard';
import StoreStep from './StoreStep';
import PaymentStep from './PaymentStep';
import VerificationStep from './VerificationStep';
import ReadyCard from './ReadyCard';
import ProgressRail from './ProgressRail';
import { StepNavContext } from './step-nav';
import type { WizardBootstrap, WizardStepKey } from './types';

const stepComponents = {
    intro: IntroCard,
    store: StoreStep,
    payment: PaymentStep,
    verification: VerificationStep,
    ready: ReadyCard,
} as const;

// Centred cards get no form chrome; the PHP shell keys the same classes off the landing step.
const centredSteps: WizardStepKey[] = [ 'intro', 'ready' ];

export default function Wizard( { boot }: { boot: WizardBootstrap } ) {
    const shell = boot.shell;
    const order = useMemo( () => shell?.order ?? [], [ shell ] );

    const [ current, setCurrent ] = useState< WizardStepKey >(
        shell?.initialStep ?? 'intro'
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
        const stepArg =
            order.find( ( s ) => s.key === current )?.stepArg ?? current;

        Array.from( body.classList ).forEach( ( name ) => {
            if ( name.startsWith( 'dokan-vsw-step-' ) ) {
                body.classList.remove( name );
            }
        } );

        body.classList.add( `dokan-vsw-step-${ stepArg }` );
        body.classList.toggle(
            'dokan-vsw-center',
            centredSteps.includes( current )
        );
        body.classList.toggle(
            'dokan-vsw-form',
            ! centredSteps.includes( current )
        );
    }, [ current, order ] );

    const go = useCallback(
        ( step: WizardStepKey, push = true ) => {
            if ( ! boot.steps[ step ] ) {
                return;
            }

            if ( push && shell ) {
                const entry = order.find( ( s ) => s.key === step );
                const url = `${ shell.baseUrl }&step=${ encodeURIComponent(
                    entry?.stepArg ?? step
                ) }&_admin_sw_nonce=${ encodeURIComponent( shell.nonce ) }`;

                window.history.pushState( { dokanWizardStep: step }, '', url );
            }

            setCurrent( step );
            window.scrollTo( { top: 0 } );
        },
        [ boot.steps, order, shell ]
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

            if ( step && boot.steps[ step ] ) {
                go( step, false );
            }
        };

        window.addEventListener( 'popstate', onPop );
        return () => window.removeEventListener( 'popstate', onPop );
    }, [ boot.steps, go ] );

    const neighbour = ( relative: number ): WizardStepKey | undefined => {
        const found = order[ indexOf( current ) + relative ];

        return found && boot.steps[ found.key ] ? found.key : undefined;
    };

    const nextStep = neighbour( 1 );
    const nav = {
        next: nextStep,
        previous: neighbour( -1 ),
        goTo: go,
        isNextReady: 'ready' === nextStep,
    };

    const payload = boot.steps[ current ];
    const Step = stepComponents[ current ];

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

            <Step payload={ payload } />
        </StepNavContext.Provider>
    );
}
