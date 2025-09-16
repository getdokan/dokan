import { Crown } from 'lucide-react';
import scaleImg from '../assets/scale.png';
import scaleMobileImg from '../assets/scale-mobile.png';
import { __ } from '@wordpress/i18n';
function ScaleMarketplaceBanner() {
    return (
        <div className="w-[349px] md:w-full mx-auto">
            { /* Mobile Banner */ }
            <div
                className="md:hidden relative rounded overflow-hidden w-[349px] h-[218px] bg-cover bg-center bg-no-repeat"
                style={ { backgroundImage: `url(${ scaleMobileImg })` } }
            >
                <div className="p-5">
                    <div className="flex flex-col">
                        <h2 className="flex text-white justify-center items-center text-center w-[298px] h-[62px] text-[24px] font-bold leading-[130%] tracking-[0%] opacity-100">
                            Ready to Scale Your Marketplace?
                        </h2>

                        <p className="flex text-white/90 mt-3 justify-center items-center text-center w-[298px] h-[30px] text-[12px] font-normal leading-[130%] tracking-[0%] opacity-100">
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
                        <button className="bg-[#FFBC00] text-black font-semibold hover:bg-yellow-300 transition flex items-center justify-center w-[311px] h-[36px] rounded-[5px] px-[18px] py-[8px] gap-[6px] opacity-100">
                            <span>Upgrade to Pro</span>
                            <Crown className="w-5 h-5" />
                        </button>
                    </a>
                </div>
            </div>

            { /* Desktop Banner */ }
            <div
                className="hidden md:flex relative min-h-[200px] rounded overflow-hidden items-center justify-between px-8 py-10 bg-cover bg-center bg-no-repeat w-full"
                style={ { backgroundImage: `url(${ scaleImg })` } }
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
                        <button className="px-4 py-2 bg-[#FFBC00] text-black font-semibold rounded shadow hover:bg-yellow-300 transition flex items-center gap-2 text-base">
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
