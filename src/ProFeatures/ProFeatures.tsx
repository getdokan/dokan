import './FeatureComparison.css';
import HeroBanner from './components/HeroBanner';
import FeaturesSlider from './components/FeaturesSlider';
import ExceptionalFeatures from './components/ExceptionalFeatures';
import WhySettle from './components/WhySettle';
import DokanAIBanner from './components/DokanAIBanner';
import FeatureComparison from './components/FeatureComparison';
import DokanMarketplaceUI from './components/DokanMarketplaceUI';
import PricingSection from './components/PricingSection';
import GuaranteeSection from './components/GuaranteeSection';
import ScaleMarketplaceBanner from './components/ScaleMarketplaceBanner';
import DokanAIBannerUpdate from "./components/DokanAIBannerUpdate";

function ProFeatures() {
    return (
        <div className="flex flex-col gap-16 touch-pan-x touch-pan-y select-none overflow-hidden">
            { /* Hero Banner */ }
            <HeroBanner />

            { /* Features Slider */ }
            <FeaturesSlider />

            { /* Exceptional Features */ }
            <ExceptionalFeatures />

            { /* Why Settle Section */ }
            <WhySettle />

            { /* Dokan AI Banner */ }
            <DokanAIBanner />
            <DokanAIBannerUpdate />

            { /* Dokan lite vs pro */ }
            <FeatureComparison />

            { /* marketplace and testimonial section */ }
            <DokanMarketplaceUI />

            { /* Pricing Section */ }
            <PricingSection />

            { /* Guarantee Section */ }
            <GuaranteeSection />

            { /* Scale Marketplace Banner */ }
            <ScaleMarketplaceBanner />
        </div>
    );
}

export default ProFeatures;
