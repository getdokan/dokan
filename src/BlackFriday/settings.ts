// TODO BFCM-2026-REMOVE: seasonal Black Friday / Cyber Monday page. Remove manually after the campaign ends (Dec 5, 2026); nothing switches itself off.
import getSettings from '../admin/dashboard/settings/getSettings';

// Early Bird deadline: the hero countdown, its "Ends" chip and the first timeline phase end here.
export const EARLY_BIRD_ENDS_AT = '2026-11-20T23:59:59Z';

// Shape of `BlackFriday::settings()` (PHP).
export type CampaignConfig = {
    assets_url: string;
    urls: {
        claim_deal: string;
        entrepreneur_pack: string;
        enterprise_bundle: string;
        plans: Record< string, string >;
        book_call: string;
    };
};

export const getCampaign = (): CampaignConfig => getSettings( 'black-friday' );
