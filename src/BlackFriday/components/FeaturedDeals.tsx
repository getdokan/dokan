// TODO BFCM-2026-REMOVE: seasonal Black Friday / Cyber Monday page. Remove manually after the campaign ends (Dec 5, 2026); only the menu entry auto-hides.
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { CircleCheck } from './Icons';
import type { CampaignConfig } from '../settings';

type Deal = {
    id: string;
    backgroundClass: string;
    pill: string;
    title: string;
    bestFor: string;
    price: string;
    oldPrice: string;
    off: string;
    period: string;
    cta: string;
    url: string;
    features: string[];
};

const getDeals = ( urls: CampaignConfig[ 'urls' ] ): Deal[] => [
    {
        id: 'entrepreneur-pack',
        backgroundClass: 'dokan-bf-deal-bg-purple',
        pill: __( 'Early Bird exclusive · Limited time', 'dokan-lite' ),
        title: __( 'The Entrepreneur Pack', 'dokan-lite' ),
        bestFor: __(
            'launching your marketplace without a yearly bill',
            'dokan-lite'
        ),
        price: '$999',
        oldPrice: '$2,495',
        off: __( '60% OFF', 'dokan-lite' ),
        period: __( 'one time', 'dokan-lite' ),
        cta: __( 'Grab the Entrepreneur Pack', 'dokan-lite' ),
        url: urls.entrepreneur_pack,
        features: [
            __(
                '<strong>Dokan Business</strong>, lifetime license for 1 site',
                'dokan-lite'
            ),
            __( 'All Pro features unlocked', 'dokan-lite' ),
            __(
                '42+ premium modules: bookings, auctions, RFQ, vendor staff',
                'dokan-lite'
            ),
            __( 'Lifetime updates and ticket support', 'dokan-lite' ),
        ],
    },
    {
        id: 'enterprise-bundle',
        backgroundClass: 'dokan-bf-deal-bg-pink',
        pill: __( 'Black Friday bundle · Save $8,000+', 'dokan-lite' ),
        title: __( 'Enterprise Lifetime + 6 Add-ons', 'dokan-lite' ),
        bestFor: __(
            'agencies and operators running serious marketplaces',
            'dokan-lite'
        ),
        price: '$1,998',
        oldPrice: '$8,080',
        off: __( 'SAVE $8,000+', 'dokan-lite' ),
        period: __( 'one time', 'dokan-lite' ),
        cta: __( 'Save $8,000 & Unlock Pro', 'dokan-lite' ),
        url: urls.enterprise_bundle,
        features: [
            __(
                '<strong>Dokan Enterprise</strong> lifetime, 10 sites',
                'dokan-lite'
            ),
            __(
                'wePOS, TryAura, StoreGrowth, FlyAffiliate lifetime',
                'dokan-lite'
            ),
            __( 'Dokan Customer App & Vendor App for 1 year', 'dokan-lite' ),
            __( '$8,080 in total value', 'dokan-lite' ),
        ],
    },
];

// The two headline bundles (Entrepreneur Pack, Enterprise Lifetime + add-ons).
const FeaturedDeals = ( { urls }: { urls: CampaignConfig[ 'urls' ] } ) => (
    <section className="flex flex-wrap gap-6">
        { getDeals( urls ).map( ( deal ) => (
            <article
                key={ deal.id }
                className="flex min-w-[300px] flex-1 flex-col gap-6 rounded-xl border border-[#ececec] bg-white px-3 pb-8 pt-3 shadow-[0_12px_40px_rgba(26,26,38,0.06)]"
            >
                <div
                    className={ `${ deal.backgroundClass } flex flex-col items-start gap-[18px] rounded-[10px] p-7` }
                >
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#1a1a1c]/8 bg-white/70 px-3.5 py-2 text-[13px] font-semibold leading-normal text-[#1a1a1c]">
                        <span className="size-[7px] shrink-0 rounded-full bg-[#e5484d]" />
                        { deal.pill }
                    </span>

                    <h3 className="m-0 max-w-[330px] text-[34px] font-extrabold leading-10 text-[#1a1a1c]">
                        { deal.title }
                    </h3>

                    <p className="m-0 text-[16px] leading-6 text-[#3a3a3e]">
                        <strong className="font-semibold text-[#1a1a1c]">
                            { __( 'Best for:', 'dokan-lite' ) }
                        </strong>{ ' ' }
                        { deal.bestFor }
                    </p>

                    <div className="flex items-center gap-3.5">
                        <span className="text-[64px] font-extrabold leading-[70px] text-[#1a1a1c]">
                            { deal.price }
                        </span>
                        <div className="flex flex-col items-start gap-1">
                            <s className="text-[18px] leading-normal text-[#a9a3c4]">
                                { deal.oldPrice }
                            </s>
                            <span className="rounded-md bg-white px-2 py-1 text-[13px] font-extrabold leading-normal text-[#b2340f]">
                                { deal.off }
                            </span>
                            <span className="text-[15px] leading-normal text-[#7a748f]">
                                { deal.period }
                            </span>
                        </div>
                    </div>

                    <a
                        href={ deal.url }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center rounded-full bg-linear-to-b from-[#2a2a2e] to-[#141416] py-[18px] text-[17px] font-semibold leading-normal text-white no-underline hover:from-[#3a3a3e] hover:to-[#1f1f22] hover:text-white focus:text-white"
                    >
                        { deal.cta }
                    </a>
                </div>

                <ul className="m-0 flex list-none flex-col gap-3.5 p-0 px-[22px]">
                    { deal.features.map( ( feature, index ) => (
                        <li
                            key={ index }
                            className="m-0 flex items-start gap-3 text-[16px] leading-[22px] text-[#2a2a2e]"
                        >
                            <CircleCheck className="shrink-0" />
                            <span>
                                { createInterpolateElement( feature, {
                                    strong: (
                                        <strong className="font-semibold" />
                                    ),
                                } ) }
                            </span>
                        </li>
                    ) ) }
                </ul>
            </article>
        ) ) }
    </section>
);

export default FeaturedDeals;
