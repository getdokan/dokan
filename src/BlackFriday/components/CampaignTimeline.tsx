// TODO BFCM-2026-REMOVE: seasonal Black Friday / Cyber Monday page. Remove manually after the campaign ends (Dec 5, 2026); nothing switches itself off.
import { __, sprintf } from '@wordpress/i18n';
import { dateI18n } from '@wordpress/date';
import { BLACK_FRIDAY_ENDS_AT, EARLY_BIRD_ENDS_AT } from '../settings';

type PhaseStatus = 'ended' | 'live' | 'next' | 'later';

type Phase = {
    startsAt: string;
    endsAt: string;
    title: string;
    offer: string;
    extra: string;
};

const getPhases = (): Phase[] => [
    {
        startsAt: '2026-11-05T00:00:00Z',
        endsAt: EARLY_BIRD_ENDS_AT,
        title: __( 'Early Bird', 'dokan-lite' ),
        offer: __( 'Up to 60% off', 'dokan-lite' ),
        extra: __( 'Entrepreneur Pack: $999 lifetime', 'dokan-lite' ),
    },
    {
        startsAt: '2026-11-20T00:00:00Z',
        endsAt: BLACK_FRIDAY_ENDS_AT,
        title: __( 'Black Friday', 'dokan-lite' ),
        offer: __( 'Up to 55% off', 'dokan-lite' ),
        extra: __( 'Enterprise bundle worth $8,227', 'dokan-lite' ),
    },
    {
        startsAt: '2026-11-29T00:00:00Z',
        endsAt: '2026-12-05T23:59:59Z',
        title: __( 'Cyber Monday', 'dokan-lite' ),
        offer: __( 'Up to 55% off', 'dokan-lite' ),
        extra: __( 'Last chance this year', 'dokan-lite' ),
    },
];

// Phases overlap at the edges, so the first phase not yet over is "live" (or "next" before it starts) and only the one after a live phase is "next".
const getStatuses = ( phases: Phase[], now = Date.now() ): PhaseStatus[] => {
    const open = phases.findIndex(
        ( phase ) => Date.parse( phase.endsAt ) >= now
    );
    const openIsLive =
        open !== -1 && Date.parse( phases[ open ].startsAt ) <= now;

    return phases.map( ( phase, index ) => {
        if ( open === -1 || index < open ) {
            return 'ended';
        }

        if ( index === open ) {
            return openIsLive ? 'live' : 'next';
        }

        return openIsLive && index === open + 1 ? 'next' : 'later';
    } );
};

const formatDay = ( date: string ) => dateI18n( 'M j', date, 'UTC' );

// Label, chip colours and status dot colour (none for upcoming phases).
const getChips = (): Record< PhaseStatus, [ string, string, string ] > => ( {
    live: [
        __( 'Live Now', 'dokan-lite' ),
        'bg-[#0d0235] text-white',
        'bg-[#4fffc2]',
    ],
    next: [ __( 'Next', 'dokan-lite' ), 'bg-[#f4efff] text-[#7047eb]', '' ],
    later: [ __( 'Later', 'dokan-lite' ), 'bg-[#f4efff] text-[#7047eb]', '' ],
    ended: [
        __( 'Ended', 'dokan-lite' ),
        'bg-[#0d0235] text-white',
        'bg-[#e5484d]',
    ],
} );

// Early Bird → Black Friday → Cyber Monday timeline with live status chips.
const CampaignTimeline = () => {
    const phases = getPhases();
    const statuses = getStatuses( phases );
    const chips = getChips();

    return (
        <section className="flex flex-wrap gap-4">
            { phases.map( ( phase, index ) => {
                const status = statuses[ index ];
                const isLive = status === 'live';
                const [ chipLabel, chipClass, dotClass ] = chips[ status ];

                return (
                    <article
                        key={ phase.title }
                        className={ `flex min-w-[240px] flex-1 flex-col items-start gap-1.5 rounded-xl bg-white px-6 py-[22px] ${
                            isLive
                                ? 'border-[1.5px] border-[#7047eb] shadow-[0_12px_32px_rgba(112,71,235,0.14)]'
                                : 'border border-[#ececec]'
                        }` }
                    >
                        <div className="flex w-full items-center justify-between gap-3">
                            <h3 className="m-0 text-[18px] font-semibold leading-normal text-[#1a1a1c]">
                                { phase.title }
                            </h3>
                            <span
                                className={ `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold leading-normal tracking-[0.88px] ${ chipClass }` }
                            >
                                { dotClass && (
                                    <span
                                        className={ `size-[6px] rounded-full ${ dotClass }` }
                                    />
                                ) }
                                { chipLabel }
                            </span>
                        </div>
                        <p className="m-0 text-[14px] leading-normal text-[#758598]">
                            { sprintf(
                                /* translators: 1: phase start date, 2: phase end date */
                                __( '%1$s – %2$s', 'dokan-lite' ),
                                formatDay( phase.startsAt ),
                                formatDay( phase.endsAt )
                            ) }
                        </p>
                        <p
                            className={ `m-0 text-[24px] font-bold leading-[34px] ${
                                isLive ? 'text-[#7047eb]' : 'text-[#1a1a1c]'
                            }` }
                        >
                            { phase.offer }
                        </p>
                        <p className="m-0 text-[14px] leading-normal text-[#4a5565]">
                            { phase.extra }
                        </p>
                    </article>
                );
            } ) }
        </section>
    );
};

export default CampaignTimeline;
