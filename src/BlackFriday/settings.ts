// TODO BFCM-2026-REMOVE: seasonal Black Friday / Cyber Monday page. Remove manually after the campaign ends (Dec 5, 2026); nothing switches itself off.
import getSettings from '../admin/dashboard/settings/getSettings';

// Black Friday deadline: the second timeline phase and every countdown on the page end here.
export const BLACK_FRIDAY_ENDS_AT = '2026-11-29T23:59:59Z';

// Shape of `BlackFriday::settings()` (PHP).
export type CampaignConfig = {
    assets_url: string;
    urls: {
        claim_deal: string;
        enterprise_bundle: string;
        plans: Record< string, string >;
        book_call: string;
    };
};

export const getCampaign = (): CampaignConfig => getSettings( 'black-friday' );
