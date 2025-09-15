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

function ProFeatures() {
    return (
        <div
            className="space-y-6"
            style={ {
                touchAction: 'pan-x pan-y',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                maxWidth: '100vw',
                overflow: 'hidden',
            } }
        >
            { /* Hero Banner */ }
            <HeroBanner />

            { /* Features Slider */ }
            <FeaturesSlider />

            { /* Exceptional Features */ }
            <div>
                <ExceptionalFeatures />
            </div>

            { /* Why Settle Section */ }
            <div>
                <WhySettle />
            </div>

            { /* Dokan AI Banner */ }
            <div>
                <DokanAIBanner />
            </div>

            { /* Dokan lite vs pro */ }
            <div>
                <FeatureComparison />
            </div>

            { /* marketplace and testimonial section */ }
            <DokanMarketplaceUI />

            { /* Pricing Section */ }
            <div>
                <PricingSection />
            </div>

            { /* Guarantee Section */ }
            <div>
                <GuaranteeSection />
            </div>

            { /* Scale Marketplace Banner */ }
            <div>
                <ScaleMarketplaceBanner />
            </div>
        </div>
    );
}

export default ProFeatures;
