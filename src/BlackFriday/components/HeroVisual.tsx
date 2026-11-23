// TODO BFCM-2026-REMOVE: seasonal Black Friday / Cyber Monday page. Remove manually after the campaign ends (Dec 5, 2026); nothing switches itself off.
import { __ } from '@wordpress/i18n';

// Faint sparkles around the artwork: [ left, top, size, faded ].
const SPARKS: Array< [ number, number, number, boolean ] > = [
    [ -122, 42, 30, true ],
    [ 57, 235, 30, true ],
    [ 212, 36, 20, false ],
];

// Decorative "Save up to 55% off" artwork on the right of the hero.
const HeroVisual = ( { assetsUrl }: { assetsUrl: string } ) => (
    <div
        className="relative hidden h-[285px] w-[273px] shrink-0 lg:block"
        aria-hidden="true"
    >
        { SPARKS.map( ( [ left, top, size, faded ] ) => (
            <img
                key={ `${ left }-${ top }` }
                src={ `${ assetsUrl }/hero-spark.png` }
                alt=""
                width={ size }
                height={ size }
                className={ `absolute max-w-none -rotate-12 rounded-full mix-blend-screen ${
                    faded ? 'opacity-20' : ''
                }` }
                style={ { left, top, width: size, height: size } }
            />
        ) ) }

        { [ -67, 49 ].map( ( left ) => (
            <img
                key={ left }
                src={ `${ assetsUrl }/hero-five.webp` }
                alt=""
                width={ 184 }
                height={ 196 }
                className="absolute top-[34px] h-[196px] w-[184px] max-w-none object-cover"
                style={ { left } }
            />
        ) ) }

        <span className="dokan-bf-hero-eyebrow absolute left-[28px] top-[16px] whitespace-nowrap text-[14.3px] font-bold uppercase leading-none tracking-[2px] text-white [text-box:trim-both_cap_alphabetic]">
            { __( 'Save up to', 'dokan-lite' ) }
        </span>

        <span className="dokan-bf-hero-badge-text absolute left-[181px] top-[79px] text-[85px] font-extrabold leading-[76px] tracking-[-4.25px] text-white [text-box:trim-both_cap_alphabetic]">
            %
        </span>

        <div className="absolute left-[174px] top-[155px] flex h-[66px] w-[66px] rotate-[75deg] items-center justify-center">
            <img
                src={ `${ assetsUrl }/hero-starburst.svg` }
                alt=""
                width={ 62 }
                height={ 65 }
                className="h-[65px] w-[62px] max-w-none"
            />
        </div>

        <span className="dokan-bf-hero-badge-text absolute left-[189px] top-[177px] w-[35px] text-[23.8px] font-extrabold leading-[21.4px] tracking-[-1.2px] text-[#0f0043] [text-box:trim-both_cap_alphabetic]">
            { __( 'off', 'dokan-lite' ) }
        </span>

        <span className="absolute -left-[13px] top-[199px] inline-flex h-[27.5px] w-[157.5px] -rotate-[10.15deg] items-center whitespace-nowrap rounded-full bg-white px-[10px] text-[11.3px] font-bold leading-[1.21] text-[#7047eb]">
            { __( '+ $2,085 in free add-ons', 'dokan-lite' ) }
        </span>
    </div>
);

export default HeroVisual;
