import {
    dokanAiBannerTablet,
    dokanAiBanner,
    dokanAiBannerMobile,
} from '../Images';
import { __ } from '@wordpress/i18n';

function DokanAIBannerUpdate() {
    return (
        <div className="mt-15 relative h-[218px] md:w-full md:h-[280px] rounded overflow-hidden bg-[#032B75]">
            {/*<span className="bg-[linear-gradient(90deg,rgba(0,0,0,0),#B200FF_50%,#032B75_100%)]"></span>*/}
            <span className="w-[900px] h-[300px] left-[40%] absolute rounded-full inline-block bg-[radial-gradient(circle,#FFC3EC_0%,#B200FF_50%,#032B75_80%,rgba(0,0,0,0)_100%)]"></span>
            { /* Text Overlay */ }
            <div className="absolute inset-0 md:flex md:items-center md:pl-10 md:pr-4">
                { /* Mobile Text Layout */ }
                <div className="block md:hidden">
                    <h2 className="text-white absolute w-[426px] h-[23px] top-[20px] left-[20px] text-[18px] font-bold leading-[130%] tracking-[0%] opacity-100">
                        { __( 'Dokan AI', 'dokan-lite' ) }
                    </h2>
                    <p className="absolute text-white w-[307px] h-[48px] top-[47px] left-[20px] text-[12px] font-normal leading-[140%] tracking-[0%] opacity-90">
                        { __(
                            'Generate product titles, descriptions, and images instantly with Dokan AI, powered by OpenAI and Gemini. Save time, look sharp, and sell smarter.',
                            'dokan-lite'
                        ) }
                    </p>
                </div>

                { /* Tablet and Desktop Text Layout */ }
                <div className="hidden md:block max-w-sm text-white">
                    <h2 className="text-white text-3xl font-bold mb-2">
                        { __( 'Dokan AI', 'dokan-lite' ) }
                    </h2>
                    <p className="text-base leading-relaxed opacity-90">
                        { __(
                            'Generate product titles, descriptions, and images instantly with Dokan AI, powered by OpenAI and Gemini. Save time, look sharp, and sell smarter.',
                            'dokan-lite'
                        ) }
                    </p>
                </div>
            </div>
        </div>
    );
}
export default DokanAIBannerUpdate;
