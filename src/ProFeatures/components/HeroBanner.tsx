import { aiStart, cross, crownLock } from '../Images';
import { __, sprintf } from '@wordpress/i18n';
import { RawHTML } from '@wordpress/element';
import { Crown } from 'lucide-react';

function HeroBanner() {
    return (
        <div className="relative min-h-[150px] md:min-h-[304px] lg:h-[300px] rounded-md overflow-hidden flex items-center bg-black">
            <div className="flex flex-row relative w-full">
                <span
                    style={ {
                        position: 'absolute',
                        left: '-50%',
                        width: '400%',
                        height: '400%',
                        backgroundRepeat: 'repeat',
                        transform: 'rotate(4deg)',
                        transformOrigin: 'center center',
                        opacity: 0.02,
                        backgroundSize: '15px',
                        zIndex: 9,
                        backgroundImage: `${ cross }`,
                    } }
                ></span>
                <div className="w-full md:w-3/4 lg:w-1/2 z-10">
                    <div className="flex flex-col justify-center px-4 py-6 md:px-8 md:py-10">
                        <span className="w-[800px] h-[800px] absolute left-[-400px] top-0 rounded-full inline-block bg-[radial-gradient(circle,rgba(0,133,143,.7)_0%,rgba(0,0,0,0)_70%)]"></span>
                        <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight text-white drop-shadow z-10">
                            <RawHTML>
                                { sprintf(
                                    // eslint-disable-next-line @wordpress/i18n-translator-comments
                                    __(
                                        'Unlock the Full Potential of %s Your Marketplace',
                                        'dokan-lite'
                                    ),
                                    '<br>'
                                ) }
                            </RawHTML>
                        </h2>
                        <p className="mb-6 text-sm lg:text-base text-white/90 drop-shadow block md:hidden lg:block z-10">
                            { __(
                                'Upgrade to Dokan PRO for powerful vendor management, advanced admin controls, and built-in AI assistance. Enjoy exclusive features that simplify operations, boost sales, and scale your business effortlessly.',
                                'dokan-lite'
                            ) }
                        </p>
                        <div className="flex items-center gap-4 z-10">
                            <a
                                href="https://dokan.co/wordpress/upgrade-to-pro/?utm_source=plugin&amp;utm_medium=wp-admin&amp;utm_campaign=dokan-lite"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <button className="px-4 py-2 bg-[#FFBC00] text-black font-semibold rounded shadow hover:bg-yellow-300 transition flex items-center gap-2 text-base">
                                    { __( 'Upgrade to Pro', 'dokan-lite' ) }
                                    <Crown size={ 24 } />
                                </button>
                            </a>
                            <span className="text-white/80 font-medium text-base">
                                { __( 'with 20% off', 'dokan-lite' ) }
                            </span>
                        </div>
                    </div>
                </div>
                <div className="w-0 md:w-1/4 lg:w-1/2 relative hidden md:block">
                    <span className="w-[600px] h-[500px] absolute md:left-[calc(100%-450px)] lg:left-[calc(100%-550px)] top-[30px] rounded-full inline-block bg-[radial-gradient(circle,rgba(195,21,232,.6)_1%,#000000_70%)]"></span>
                    <span className="w-80 h-80 rounded-full absolute md:left-[calc(100%-270px)] lg:left-[calc(100%-360px)] top-[37px] rotate-[13deg] inline-block bg-[linear-gradient(to_bottom,rgba(178,245,234,0.3)_0%,rgba(255,255,255,0)_100%)]"></span>
                    <img
                        src={ crownLock }
                        alt="Crownlock img"
                        className="absolute md:left-[calc(100%-185px)] lg:left-[calc(100%-260px)] top-[32px] object-contain"
                    />
                    <img
                        src={ aiStart }
                        alt="aiStart img"
                        className="absolute md:left-[calc(100%-285px)] lg:left-[calc(100%-370px)] md:top-[165px] lg:top-[210px] object-contain"
                    />
                </div>
            </div>
        </div>
    );
}

export default HeroBanner;
