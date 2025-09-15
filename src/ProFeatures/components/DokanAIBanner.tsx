import dokanAiBanner from '../assets/DokanAi.png';
import dokanAiBannerMobile from '../assets/DokanAiMobile.png';
import dokanAiBannerTablet from '../assets/DokanAiTablet.png';

function DokanAIBanner() {
    return (
        <div className="mt-15 relative h-[218px] md:w-full md:h-[280px] rounded overflow-hidden">
            { /* Mobile Background Image - visible on mobile only */ }
            <img
                src={ dokanAiBannerMobile }
                alt="Dokan AI Banner Mobile"
                className="block md:hidden object-cover"
                draggable={ false }
            />

            { /* Tablet Background Image - visible on tablet only */ }
            <img
                src={ dokanAiBannerTablet }
                alt="Dokan AI Banner Tablet"
                className="w-full h-full object-cover hidden md:block lg:hidden"
                draggable={ false }
            />

            { /* Desktop Background Image - visible on desktop only */ }
            <img
                src={ dokanAiBanner }
                alt="Dokan AI Banner"
                className="w-full h-full object-cover hidden lg:block"
                draggable={ false }
            />

            { /* Text Overlay */ }
            <div className="absolute inset-0 md:flex md:items-center md:pl-10 md:pr-4">
                { /* Mobile Text Layout */ }
                <div className="block md:hidden">
                    <h2
                        className="text-white font-bold absolute"
                        style={ {
                            width: '426px',
                            height: '23px',
                            top: '20px',
                            left: '20px',
                            fontSize: '18px',
                            fontWeight: '700',
                            lineHeight: '130%',
                            letterSpacing: '0%',
                            opacity: 1,
                        } }
                    >
                        Dokan AI
                    </h2>
                    <p
                        className="text-white absolute"
                        style={ {
                            width: '307px',
                            height: '48px',
                            top: '47px',
                            left: '20px',
                            fontSize: '12px',
                            fontWeight: '400',
                            lineHeight: '140%',
                            letterSpacing: '0%',
                            opacity: 0.9,
                        } }
                    >
                        Generate product titles, descriptions, and images
                        instantly with Dokan AI, powered by OpenAI and Gemini.
                        Save time, look sharp, and sell smarter.
                    </p>
                </div>

                { /* Tablet and Desktop Text Layout */ }
                <div className="hidden md:block max-w-sm text-white">
                    <h2 className="text-white text-3xl font-bold mb-2">
                        Dokan AI
                    </h2>
                    <p className="text-base leading-relaxed opacity-90">
                        Generate product titles, descriptions, and images
                        instantly with Dokan AI, powered by OpenAI and Gemini.
                        Save time, look sharp, and sell smarter.
                    </p>
                </div>
            </div>
        </div>
    );
}
export default DokanAIBanner;
