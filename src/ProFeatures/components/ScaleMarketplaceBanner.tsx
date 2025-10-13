import { Crown } from 'lucide-react';
import { dokanLarge, dokanSmall } from '../Images';
import { __ } from '@wordpress/i18n';
function ScaleMarketplaceBanner() {
    return (
        <div className="w-full relative overflow-hidden rounded-md">
            <span className="absolute w-full h-full bg-[rgba(8,21,39,1)]"></span>
            <span className="w-[500px] h-[500px] left-[-190px] top-0 rounded-full absolute overflow-hidden inline-block bg-[radial-gradient(circle,rgba(118,75,227,.3)_0%,rgba(0,0,0,0)_70%)]"></span>
            <span className="md:w-[200px] lg:w-[500px] h-full bg-[linear-gradient(270deg,rgba(219,100,190,.3)_0%,rgba(0,0,0,0)_100%)] absolute right-0 z-10"></span>
            <img
                src={ dokanSmall }
                alt="dokan small"
                className="absolute hidden md:inline-block md:left-[calc(100%-190px)] lg:left-[calc(100%-643px)] top-[calc(100%-114px)] scale-[1.6] opacity-[.10]"
            />
            <img
                src={ dokanLarge }
                alt="dokan large"
                className="absolute hidden lg:inline-block left-[calc(100%-213px)] top-[-83px] scale-[1.5] opacity-[.5]"
            />

            <div
                className="flex flex-col lg:!flex-row gap-4 lg:gap-0 justify-center lg:!justify-between p-4 lg:!p-8 relative min-h-[200px] rounded overflow-hidden items-center w-full"
            >
                <div className="flex flex-col justify-center z-10 text-center lg:!text-left">
                    <h2 className="font-bold text-white mb-2 text-xl lg:text-3xl">
                        { __(
                            'Ready to Scale Your Marketplace?',
                            'dokan-lite'
                        ) }
                    </h2>
                    <p className="text-white text-[12px] leading-[140%] md:text-base font-normal">
                        { __(
                            "With all the advanced features you get it's hard to resist buying Dokan Pro.",
                            'dokan-lite'
                        ) }
                    </p>
                </div>

                <div className="z-10 w-full lg:!w-auto md:!w-[311px] text-center">
                    <a
                        href="https://dokan.co/wordpress/upgrade-to-pro/?utm_source=plugin&utm_medium=wp-admin&utm_campaign=dokan-lite"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 w-full py-2 bg-[#FFBC00] !text-black font-semibold rounded shadow hover:bg-yellow-300 transition items-center gap-2 text-base flex justify-center"
                    >
                        { __( 'Upgrade to Pro', 'dokan-lite' ) }
                        <Crown className="inline-block w-5 h-5 ml-1" />
                    </a>
                </div>
            </div>
        </div>
    );
}

export default ScaleMarketplaceBanner;
