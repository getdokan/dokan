// TODO BFCM-2026-REMOVE: seasonal Black Friday / Cyber Monday page. Remove manually after the campaign ends (Dec 5, 2026); nothing switches itself off.
import './black-friday.css';
import Hero from './components/Hero';
import CampaignTimeline from './components/CampaignTimeline';
import FeaturedDeals from './components/FeaturedDeals';
import ComparisonTable from './components/ComparisonTable';
import PlanPrices from './components/PlanPrices';
import Footer from './components/Footer';
import { getCampaign } from './settings';

// Black Friday offer page shown to Dokan Lite admins (buy Pro at the sale price).
const BlackFridayPage = () => {
    const campaign = getCampaign();

    return (
        <div className="dokan-black-friday flex flex-col gap-6 pb-6">
            <Hero campaign={ campaign } />
            <CampaignTimeline />
            <FeaturedDeals urls={ campaign.urls } />
            <ComparisonTable />
            <PlanPrices urls={ campaign.urls.plans } />
            <Footer bookCallUrl={ campaign.urls.book_call } />
        </div>
    );
};

export default BlackFridayPage;
