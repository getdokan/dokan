// TODO BFCM-2026-REMOVE: seasonal Black Friday / Cyber Monday page. Remove manually after the campaign ends (Dec 5, 2026); nothing switches itself off.
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

type Billing = 'annual' | 'lifetime';

type Price = { sites: string; oldPrice: string; off: string; price: string };

type Plan = {
    id: string;
    name: string;
    // Shown on the Lifetime tab only, as in the design.
    badge?: [ string, string ];
    annual: Price;
    lifetime: Price;
};

const HIGHLIGHTED_PLAN = 'business';

const getPlans = (): Plan[] => [
    {
        id: 'starter',
        name: __( 'Starter', 'dokan-lite' ),
        annual: {
            sites: __( '1 site', 'dokan-lite' ),
            oldPrice: '$149/yr',
            off: __( '30% OFF', 'dokan-lite' ),
            price: '$104',
        },
        lifetime: {
            sites: __( '1 site license', 'dokan-lite' ),
            oldPrice: '$745',
            off: __( '35% OFF', 'dokan-lite' ),
            price: '$484',
        },
    },
    {
        id: 'professional',
        name: __( 'Professional', 'dokan-lite' ),
        annual: {
            sites: __( '3 sites', 'dokan-lite' ),
            oldPrice: '$249/yr',
            off: __( '35% OFF', 'dokan-lite' ),
            price: '$161',
        },
        lifetime: {
            sites: __( '3 site licenses', 'dokan-lite' ),
            oldPrice: '$1,245',
            off: __( '40% OFF', 'dokan-lite' ),
            price: '$747',
        },
    },
    {
        id: 'business',
        name: __( 'Business', 'dokan-lite' ),
        badge: [
            __( 'Most Popular', 'dokan-lite' ),
            'bg-[#f2d6fa] text-[#5e1a7a]',
        ],
        annual: {
            sites: __( '5 sites', 'dokan-lite' ),
            oldPrice: '$499/yr',
            off: __( '40% OFF', 'dokan-lite' ),
            price: '$299',
        },
        lifetime: {
            sites: __( '5 site licenses', 'dokan-lite' ),
            oldPrice: '$2,495',
            off: __( '45% OFF', 'dokan-lite' ),
            price: '$1,372',
        },
    },
    {
        id: 'enterprise',
        name: __( 'Enterprise', 'dokan-lite' ),
        badge: [
            __( 'Biggest Saving', 'dokan-lite' ),
            'bg-[#c9f8d4] text-[#14532d]',
        ],
        annual: {
            sites: __( '20 sites', 'dokan-lite' ),
            oldPrice: '$999/yr',
            off: __( '45% OFF', 'dokan-lite' ),
            price: '$549',
        },
        lifetime: {
            sites: __( '10 site licenses', 'dokan-lite' ),
            oldPrice: '$4,995',
            off: __( '60% OFF', 'dokan-lite' ),
            price: '$1,998',
        },
    },
];

// Grid lines between cells for the 1, 2 and 4 column layouts; the highlighted plan gets a purple top and left edge instead.
const cellBorderClass = ( highlighted: boolean, index: number ) =>
    highlighted
        ? 'border-t-[3px] border-[#e4e4e7] border-t-[#7047eb] xl:border-l xl:border-l-[#7047eb]'
        : `border-[#e4e4e7] ${
              index ? 'border-t' : ''
          } sm:even:border-l sm:[&:nth-child(-n+2)]:border-t-0 xl:border-l xl:border-t-0 xl:first:border-l-0`;

// Early Bird prices for every plan with an Annual / Lifetime switch.
const PlanPrices = ( { urls }: { urls: Record< string, string > } ) => {
    const [ billing, setBilling ] = useState< Billing >( 'lifetime' );

    const toggles: Array< [ Billing, string ] > = [
        [ 'annual', __( 'Annual', 'dokan-lite' ) ],
        [ 'lifetime', __( 'Lifetime · Save up to 60%', 'dokan-lite' ) ],
    ];
    const period =
        billing === 'annual'
            ? __( '/yr', 'dokan-lite' )
            : __( 'one time', 'dokan-lite' );

    return (
        <section className="flex flex-col gap-7 rounded-xl border border-[#ececec] bg-white p-6 lg:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h2 className="m-0 text-[32px] font-bold leading-[42px] text-[#0e0e0f]">
                        { __(
                            'Early Bird Prices on Every Dokan Plan',
                            'dokan-lite'
                        ) }
                    </h2>
                    <p className="m-0 text-[18px] leading-normal text-[#575757]">
                        { __(
                            'The bigger the plan, the bigger the discount. Prices go up on Nov 20.',
                            'dokan-lite'
                        ) }
                    </p>
                </div>

                <div
                    role="group"
                    aria-label={ __( 'Billing period', 'dokan-lite' ) }
                    className="flex items-center gap-1 rounded-full border border-[#e4e4e7] bg-white p-[5px] shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                >
                    { toggles.map( ( [ value, label ] ) => (
                        <button
                            key={ value }
                            type="button"
                            aria-pressed={ billing === value }
                            onClick={ () => setBilling( value ) }
                            className={ `cursor-pointer rounded-full border-0 px-5 py-2.5 text-[15px] leading-normal transition-colors ${
                                billing === value
                                    ? 'bg-[#7047eb] font-bold text-white'
                                    : 'bg-transparent text-[#575757]'
                            }` }
                        >
                            { label }
                        </button>
                    ) ) }
                </div>
            </div>

            <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#e4e4e7] sm:grid-cols-2 xl:grid-cols-4">
                { getPlans().map( ( plan, index ) => {
                    const highlighted = plan.id === HIGHLIGHTED_PLAN;
                    const price = plan[ billing ];
                    const badge = billing === 'lifetime' && plan.badge;

                    return (
                        <div
                            key={ plan.id }
                            className={ `flex flex-col items-start gap-3 bg-white px-6 py-7 ${ cellBorderClass(
                                highlighted,
                                index
                            ) }` }
                        >
                            <div className="flex items-center gap-2">
                                <h3 className="m-0 text-[18px] font-semibold leading-normal text-[#0e0e0f]">
                                    { plan.name }
                                </h3>
                                { badge && (
                                    <span
                                        className={ `rounded-full px-2 py-[3px] text-[11px] font-medium leading-normal ${ badge[ 1 ] }` }
                                    >
                                        { badge[ 0 ] }
                                    </span>
                                ) }
                            </div>

                            <p className="m-0 text-[14px] leading-normal text-[#575757]">
                                { price.sites }
                            </p>

                            <div className="flex items-center gap-2">
                                <s className="text-[16px] leading-normal text-[#828282]">
                                    { price.oldPrice }
                                </s>
                                <span className="rounded-full bg-[#e7e1fd] px-2.5 py-[3px] text-[13px] font-bold leading-normal text-[#2a1a6e]">
                                    { price.off }
                                </span>
                            </div>

                            <div className="flex items-baseline gap-1.5">
                                <span className="text-[30px] font-bold leading-10 text-[#0e0e0f]">
                                    { price.price }
                                </span>
                                <span className="text-[14px] leading-normal text-[#575757]">
                                    { period }
                                </span>
                            </div>

                            <a
                                href={ urls[ plan.id ] }
                                target="_blank"
                                rel="noopener noreferrer"
                                className={ `mt-auto flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg border py-3 text-[14px] font-medium leading-normal no-underline transition-colors ${
                                    highlighted
                                        ? 'border-[#7047eb] bg-[#7047eb] text-white hover:bg-[#5d39c4] hover:text-white focus:text-white'
                                        : 'border-[#d4d4d8] bg-white text-[#0e0e0f] hover:bg-[#f4efff] hover:text-[#0e0e0f] focus:text-[#0e0e0f]'
                                }` }
                            >
                                { sprintf(
                                    /* translators: %s: plan name, e.g. "Business" */
                                    __( 'Upgrade to %s', 'dokan-lite' ),
                                    plan.name
                                ) }
                                <span aria-hidden="true">→</span>
                            </a>
                        </div>
                    );
                } ) }
            </div>
        </section>
    );
};

export default PlanPrices;
