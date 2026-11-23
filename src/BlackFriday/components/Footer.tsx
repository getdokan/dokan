// TODO BFCM-2026-REMOVE: seasonal Black Friday / Cyber Monday page. Remove manually after the campaign ends (Dec 5, 2026); nothing switches itself off.
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

// Expert-call link and the pricing disclaimer.
const Footer = ( { bookCallUrl }: { bookCallUrl: string } ) => (
    <footer className="flex flex-wrap items-center justify-between gap-2 px-2 text-[14px] leading-normal text-[#575757]">
        <p className="m-0">
            { createInterpolateElement(
                __(
                    'Not sure which plan fits? <a>Book a free 1:1 call with a Dokan expert</a>',
                    'dokan-lite'
                ),
                {
                    a: (
                        // eslint-disable-next-line jsx-a11y/anchor-has-content
                        <a
                            href={ bookCallUrl }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#7047eb] underline hover:text-[#5d39c4]"
                        />
                    ),
                }
            ) }
        </p>
        <p className="m-0 text-[#828282]">
            { __(
                'Discounts apply to first purchase only. Prices exclude VAT.',
                'dokan-lite'
            ) }
        </p>
    </footer>
);

export default Footer;
