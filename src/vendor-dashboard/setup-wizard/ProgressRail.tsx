import { sprintf, __ } from '@wordpress/i18n';
import type { WizardStepKey, WizardStepOrder } from './types';

type ProgressRailProps = {
    order: WizardStepOrder[];
    current: WizardStepKey;
};

// React owner of the rail; progress-rail.php paints only the server-rendered first frame.
export default function ProgressRail( { order, current }: ProgressRailProps ) {
    const numbered = order.filter( ( step ) => step.numbered );
    const total = numbered.length;
    const index = numbered.findIndex( ( step ) => step.key === current );

    if ( index < 0 || total < 1 ) {
        return null;
    }

    const position = index + 1;
    const percent =
        total > 1
            ? Math.round( ( ( position - 1 ) / ( total - 1 ) ) * 100 )
            : 100;

    return (
        <div className="dokan-vsw-rail">
            <span className="dokan-vsw-rail-label">
                { sprintf(
                    /* translators: 1: current step number 2: total step count */
                    __( 'Step %1$d of %2$d', 'dokan-lite' ),
                    position,
                    total
                ) }
            </span>
            <span className="dokan-vsw-rail-track">
                <span
                    className="dokan-vsw-rail-fill"
                    style={ { width: `${ percent }%` } }
                />
            </span>
            <span className="dokan-vsw-rail-percent">
                { sprintf(
                    /* translators: %d: completion percentage */
                    __( '%d%% Complete', 'dokan-lite' ),
                    percent
                ) }
            </span>
        </div>
    );
}
