import { Crown } from 'lucide-react';
import unlockBanner from '../assets/unlock-banner.png';
import unlockBannerMobile from '../assets/unlock-banner-mobile.png';
import unlockBannerTablet from '../assets/unlock-banner-tablet.png';
import { __, sprintf } from '@wordpress/i18n';
import { RawHTML } from '@wordpress/element';

function HeroBanner() {
    return (
        <div className="relative min-h-[150px] md:min-h-[304px] lg:h-[350px] rounded overflow-hidden flex items-center">
            { /* Mobile Banner */ }
            <div
                className="absolute inset-0 md:hidden"
                style={ {
                    background: `url(${ unlockBannerMobile }) center center / cover no-repeat`,
                } }
            />

            { /* Tablet Banner */ }
            <div
                className="absolute inset-0 hidden md:block lg:hidden"
                style={ {
                    background: `url(${ unlockBannerTablet }) center center / cover no-repeat`,
                } }
            />

            { /* Desktop Banner */ }
            <div
                className="absolute inset-0 hidden lg:block"
                style={ {
                    background: `url(${ unlockBanner }) center center / cover no-repeat`,
                } }
            />
            <div className="flex flex-col justify-center px-4 py-6 md:px-8 md:py-10 z-10 max-w-xl">
                { /* Mobile: text-2xl, Desktop: text-4xl */ }
                <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight text-white drop-shadow">
                    <RawHTML>
                        { sprintf(
                            // eslint-disable-next-line @wordpress/i18n-translator-comments
                            __(
                                'Unlock the Full Potential of %s Your Marketplace',
                                'dokan-lite'
                            ),
                            ' <br />'
                        ) }
                    </RawHTML>
                </h2>

                { /* Mobile and Desktop Text */ }
                <p className="mb-6 text-sm lg:text-base text-white/90 drop-shadow block md:hidden lg:block">
                    { __(
                        'Upgrade to Dokan PRO for powerful vendor management, advanced admin controls, and built-in AI assistance. Enjoy exclusive features that simplify operations, boost sales, and scale your business effortlessly.',
                        'dokan-lite'
                    ) }
                </p>

                { /* Tablet Text with Custom Line Breaks */ }
                <p className="mb-6 text-base text-white/90 drop-shadow hidden md:block lg:hidden">
                    <RawHTML>
                        { sprintf(
                            // eslint-disable-next-line @wordpress/i18n-translator-comments
                            __(
                                'Upgrade to Dokan PRO for powerful vendor management,%1$sadvanced admin controls, and built-in AI assistance. Enjoy %2$sexclusive features that simplify operations, boost sales,%3$sand scale your business effortlessly.'
                            ),
                            '<br />',
                            '<br />',
                            '<br />'
                        ) }
                    </RawHTML>
                </p>

                { /* Button and text remain horizontal on both mobile and desktop */ }
                <div className="flex items-center gap-4">
                    <a
                        href="https://dokan.co/wordpress/upgrade-to-pro/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <button className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded shadow hover:bg-yellow-300 transition flex items-center gap-2 text-base">
                            { __( 'Upgrade to Pro', 'dokan-lite' ) }
                            <Crown className="inline-block w-5 h-5 ml-1" />
                        </button>
                    </a>
                    <span className="text-white/80 font-medium text-base">
                        { __( 'with 20% off', 'dokan-lite' ) }
                    </span>
                </div>
            </div>
        </div>
    );
}

export default HeroBanner;
