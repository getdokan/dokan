import { photo } from '../Images';
import { __ } from '@wordpress/i18n';

function DokanAIBanner() {
    return (
        <div className="mt-15 relative h-[218px] md:w-full md:h-[280px] rounded overflow-hidden bg-[#032B75]">
            <span className="w-[2000px] h-[600px] left-[calc(100%-1200px)]  lg:left-[calc(100%-1500px)] top-[-63%] rotate-[10deg] absolute rounded-full inline-block bg-[radial-gradient(ellipse,#FFC3EC_0%,#B200FF_30%,#032B75_75%,rgba(0,0,0,0)_100%)]"></span>
            <div className="w-full h-full flex flex-col md:flex-row relative">
                <div className="w-full md:w-[47%] h-full pl-4 pt-4 md:pt-0 md:pl-8 flex flex-col justify-center ">
                    <h2 className="font-bold text-white mb-2 text-xl lg:text-3xl">
                        { __( 'Dokan AI', 'dokan-lite' ) }
                    </h2>
                    <p className="text-white max-w-xs md:max-w-[400px] text-[12px] leading-[140%] md:text-base font-normal">
                        { __(
                            'Generate product titles, descriptions, and images instantly with Dokan AI, powered by OpenAI and Gemini. Save time, look sharp, and sell smarter.',
                            'dokan-lite'
                        ) }
                    </p>
                </div>
                <div className="w-full md:w-[53%] h-full content-center">
                    { /* eslint-disable-next-line jsx-a11y/img-redundant-alt */ }
                    <img
                        src={ photo }
                        alt="photo"
                        className="mt-[-13px] scale-[.6] md:scale-[1]"
                    />
                </div>
            </div>
        </div>
    );
}
export default DokanAIBanner;
