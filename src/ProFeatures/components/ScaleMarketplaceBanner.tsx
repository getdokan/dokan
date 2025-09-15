import { Crown } from 'lucide-react';
import scaleImg from '../assets/scale.png';
import scaleMobileImg from '../assets/scale-mobile.png';
import { __ } from '@wordpress/i18n';
function ScaleMarketplaceBanner() {
    return (
        <div className="w-[349px] md:w-full mx-auto">
            { /* Mobile Banner */ }
            <div
                className="md:hidden relative rounded overflow-hidden"
                style={ {
                    width: '349px',
                    height: '218px',
                    backgroundImage: `url(${ scaleMobileImg })`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                } }
            >
                <div className="p-5">
                    <div className="flex flex-col">
                        <h2
                            className="text-white"
                            style={ {
                                width: '298px',
                                height: '62px',
                                fontSize: '24px',
                                fontWeight: 700,
                                lineHeight: '130%',
                                letterSpacing: '0%',
                                opacity: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex',
                                textAlign: 'center',
                            } }
                        >
                            Ready to Scale Your Marketplace?
                        </h2>

                        <p
                            className="text-white/90 mt-3"
                            style={ {
                                width: '298px',
                                height: '30px',
                                fontSize: '12px',
                                fontWeight: 400,
                                lineHeight: '130%',
                                letterSpacing: '0%',
                                opacity: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex',
                                textAlign: 'center',
                            } }
                        >
                            With all the advanced features you get it's hard to
                            resist buying Dokan Pro.
                        </p>
                    </div>

                    <a
                        href="https://dokan.co/wordpress/upgrade-to-pro/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-8"
                    >
                        <button
                            className="bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition flex items-center justify-center"
                            style={ {
                                width: '311px',
                                height: '36px',
                                borderRadius: '5px',
                                padding: '8px 18px',
                                gap: '6px',
                                opacity: 1,
                            } }
                        >
                            <span>Upgrade to Pro</span>
                            <Crown className="w-5 h-5" />
                        </button>
                    </a>
                </div>
            </div>

            { /* Desktop Banner */ }
            <div
                className="hidden md:flex relative min-h-[200px] rounded overflow-hidden items-center justify-between px-8 py-10"
                style={ {
                    backgroundImage: `url(${ scaleImg })`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: '100%',
                } }
            >
                <div className="flex flex-col justify-center z-10 max-w-2xl">
                    <h2 className="text-3xl font-bold mb-4 leading-tight text-white drop-shadow-lg">
                        { __(
                            'Ready to Scale Your Marketplace?',
                            'dokan-lite'
                        ) }
                    </h2>
                    <p className="text-lg text-white/90 drop-shadow">
                        { __(
                            "With all the advanced features you get it's hard to resist buying Dokan Pro.",
                            'dokan-lite'
                        ) }
                    </p>
                </div>

                <div className="z-10">
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
                </div>
            </div>
        </div>
    );
}

export default ScaleMarketplaceBanner;
