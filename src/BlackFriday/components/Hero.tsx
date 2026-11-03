// TODO BFCM-2026-REMOVE: seasonal Black Friday / Cyber Monday page. Remove manually after the campaign ends (Dec 5, 2026); only the menu entry auto-hides.
import { __, sprintf } from '@wordpress/i18n';
import { dateI18n } from '@wordpress/date';
import Countdown from './Countdown';
import HeroVisual from './HeroVisual';
import { EARLY_BIRD_ENDS_AT, type CampaignConfig } from '../settings';

export const COMPARE_SECTION_ID = 'dokan-black-friday-compare';

// Dark hero: offer headline, countdown and the two primary calls to action.
const Hero = ( { campaign }: { campaign: CampaignConfig } ) => {
    const scrollToCompare = () => {
        document
            .getElementById( COMPARE_SECTION_ID )
            ?.scrollIntoView( { behavior: 'smooth', block: 'start' } );
    };

    const endsLabel = sprintf(
        /* translators: %s: date the offer ends, e.g. "Nov 20" */
        __( 'Ends %s', 'dokan-lite' ),
        dateI18n( 'M j', EARLY_BIRD_ENDS_AT, 'UTC' )
    );

    return (
        <section className="dokan-bf-hero flex items-center gap-10 overflow-hidden rounded-2xl px-8 py-10 lg:px-14 lg:py-12">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-5">
                <div className="rounded-full border border-[#7047eb] bg-[#0d0235] px-4 py-2">
                    <span className="bg-linear-to-r from-white to-[#f093a6] bg-clip-text text-[15px] leading-normal text-transparent">
                        { __(
                            'Black Friday Deals · Lowest price of the year',
                            'dokan-lite'
                        ) }
                    </span>
                </div>

                <h1 className="m-0 bg-linear-to-r from-[#f4f2fa] via-[#f4f2fa] via-45% to-[#a284ff] bg-clip-text text-[40px] font-bold leading-[1.15] text-transparent lg:text-[50px] lg:leading-[57px]">
                    { __( 'Up to 60% Off Dokan Pro', 'dokan-lite' ) }
                </h1>

                <p className="m-0 text-[18px] leading-7 text-[#c9c3e6]">
                    { __(
                        "You're running Dokan Lite. Upgrade now at the lowest price of the year and unlock 42+ premium modules for your marketplace.",
                        'dokan-lite'
                    ) }
                </p>

                <Countdown endsAt={ EARLY_BIRD_ENDS_AT } />

                <div className="flex flex-wrap gap-3">
                    <a
                        href={ campaign.urls.claim_deal }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-[#7047eb] px-7 py-4 text-[16px] font-semibold leading-normal text-white no-underline transition-colors hover:bg-[#5d39c4] hover:text-white focus:text-white"
                    >
                        { __( 'Claim My Deal', 'dokan-lite' ) }
                        <span aria-hidden="true">→</span>
                    </a>
                    <button
                        type="button"
                        onClick={ scrollToCompare }
                        className="cursor-pointer rounded-full border border-white/35 bg-white/6 px-7 py-4 text-[16px] font-semibold leading-normal text-white transition-colors hover:bg-white/12"
                    >
                        { __( 'Compare Plans', 'dokan-lite' ) }
                    </button>
                </div>
            </div>

            <HeroVisual
                discount="60"
                endsLabel={ endsLabel }
                assetsUrl={ campaign.assets_url }
            />
        </section>
    );
};

export default Hero;
