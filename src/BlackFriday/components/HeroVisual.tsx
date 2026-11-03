// TODO BFCM-2026-REMOVE: seasonal Black Friday / Cyber Monday page. Remove manually after the campaign ends (Dec 5, 2026); only the menu entry auto-hides.
import { __ } from '@wordpress/i18n';

type Props = {
    /** Headline discount, e.g. "60". */
    discount: string;
    /** Rotated chip text, e.g. "Ends Nov 20". */
    endsLabel: string;
    /** Base URL of the campaign image assets. */
    assetsUrl: string;
};

// Decorative "Save up to NN% off" artwork on the right of the hero.
const HeroVisual = ( { discount, endsLabel, assetsUrl }: Props ) => (
    <div
        className="relative hidden h-[285px] w-[273px] shrink-0 lg:block"
        aria-hidden="true"
    >
        <span className="dokan-bf-hero-eyebrow absolute left-[32px] top-[6px] whitespace-nowrap text-[15.7px] font-bold tracking-[2.2px] text-white">
            { __( 'Save up to', 'dokan-lite' ) }
        </span>

        <span className="dokan-bf-hero-number absolute -left-[11px] top-[32px] whitespace-nowrap font-bold">
            { discount }
        </span>

        <div className="absolute left-[166px] top-[69px] flex h-[116px] w-[92px] items-center justify-center">
            <img
                src={ `${ assetsUrl }/starburst.svg` }
                alt=""
                width={ 94 }
                height={ 77 }
                className="h-[77px] w-[94px] max-w-none rotate-[78deg] skew-x-[7deg]"
            />
        </div>

        <span className="dokan-bf-hero-badge-text absolute left-[212px] top-[106px] -translate-x-1/2 text-center text-[26px] font-extrabold leading-[0.9] tracking-[-1.3px] text-[#0f0043]">
            %
            <br />
            { __( 'off', 'dokan-lite' ) }
        </span>

        <img
            src={ `${ assetsUrl }/hero-spark.png` }
            alt=""
            width={ 32 }
            height={ 33 }
            className="absolute left-[119px] top-[246px] h-[33px] w-[32px] max-w-none -rotate-12 rounded-2xl opacity-20 mix-blend-screen"
        />

        <span className="absolute left-[40px] top-[200px] inline-flex h-[30px] -rotate-[10deg] items-center whitespace-nowrap rounded-full bg-white px-[11px] text-[12.3px] font-bold text-[#7047eb]">
            { endsLabel }
        </span>
    </div>
);

export default HeroVisual;
