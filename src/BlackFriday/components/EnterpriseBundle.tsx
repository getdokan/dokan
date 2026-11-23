// TODO BFCM-2026-REMOVE: seasonal Black Friday / Cyber Monday page. Remove manually after the campaign ends (Dec 5, 2026); nothing switches itself off.
import { createInterpolateElement, Fragment } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { pad, useTimeLeft } from './Countdown';
import { ArrowRight, ShieldCheck, Sparkle } from './Icons';
import { BLACK_FRIDAY_ENDS_AT } from '../settings';

type BundleItem = {
    name: string;
    description: string;
    price: string;
    // Discount label; items without one are included for free.
    off?: string;
};

const getItems = (): BundleItem[] => [
    {
        name: __( 'Dokan Enterprise Lifetime', 'dokan-lite' ),
        description: __( '10 sites, all features and modules', 'dokan-lite' ),
        price: '$4,995',
        off: __( '55% OFF', 'dokan-lite' ),
    },
    {
        name: __( 'wePOS Starter Lifetime', 'dokan-lite' ),
        description: __( 'Point of sale for WooCommerce', 'dokan-lite' ),
        price: '$299',
    },
    {
        name: __( 'TryAura', 'dokan-lite' ),
        description: __( 'AI virtual try on', 'dokan-lite' ),
        price: '$199',
    },
    {
        name: __( 'StoreGrowth Starter Lifetime', 'dokan-lite' ),
        description: __( 'Upsells and conversion tools', 'dokan-lite' ),
        price: '$89',
    },
    {
        name: __( 'FlyAffiliate Lifetime', 'dokan-lite' ),
        description: __( 'Run your own affiliate program', 'dokan-lite' ),
        price: '$199',
    },
    {
        name: __( 'Dokan Mobile App, 1 Year', 'dokan-lite' ),
        description: __( 'Branded app for your marketplace', 'dokan-lite' ),
        price: '$1,299',
    },
    {
        name: __( 'Dokan Vendor App, 1 Year', 'dokan-lite' ),
        description: __(
            'Vendors manage their stores on the go',
            'dokan-lite'
        ),
        price: '$1,147',
    },
];

// Share of the bundle stock shown as claimed on the progress bar, as in the design.
const CLAIMED_PERCENT = 78;

// Black Friday exclusive: Enterprise Lifetime plus six free add-ons, with the price card beside it.
const EnterpriseBundle = ( { url }: { url: string } ) => {
    const { days, hours, minutes } = useTimeLeft( BLACK_FRIDAY_ENDS_AT );

    const units: Array< [ number, string ] > = [
        [ days, __( 'Days', 'dokan-lite' ) ],
        [ hours, __( 'Hours', 'dokan-lite' ) ],
        [ minutes, __( 'Min', 'dokan-lite' ) ],
    ];

    return (
        <section className="dokan-bf-bundle grid grid-cols-1 gap-[13px] rounded-[21px] py-6 ps-[25px] pe-6 xl:grid-cols-[514fr_499fr]">
            <div className="flex min-w-0 flex-col items-start gap-[17px]">
                <span className="ms-0.5 inline-flex min-h-[46px] w-[419px] max-w-full items-center justify-center rounded-[19px] bg-[#ffd857] px-[19px] py-1 text-center text-[18px] font-bold uppercase leading-[1.2] tracking-[2px] text-[#080c34]">
                    { __( 'Black Friday Exclusive Bundle', 'dokan-lite' ) }
                </span>

                <div className="flex w-full flex-1 flex-col justify-between gap-[35px] rounded-[19px] bg-white/70 px-[13px] pb-[9px] pt-[14px]">
                    <ul className="m-0 flex list-none flex-col gap-[6.4px] p-0">
                        { getItems().map( ( item ) => (
                            <li
                                key={ item.name }
                                className={ `m-0 flex min-h-[55.5px] items-center rounded-[13px] border-[0.7px] border-solid py-2 ps-[34px] pe-[11px] ${
                                    item.off
                                        ? 'gap-[11px] border-[#f7eaf7] bg-[rgba(255,246,251,0.6)]'
                                        : 'gap-[18px] border-[#f0f1fa] bg-white/25'
                                }` }
                            >
                                <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                                    <span className="text-[13.3px] font-bold leading-[16.5px] text-[#080c34]">
                                        { item.name }
                                    </span>
                                    <span className="text-[11px] leading-[14px] text-[#81849f]">
                                        { item.description }
                                    </span>
                                </div>
                                <s className="w-[52px] shrink-0 text-end text-[12.8px] font-medium leading-[16.5px] text-[#81849f]">
                                    { item.price }
                                </s>
                                <span
                                    className={ `inline-flex h-[28px] shrink-0 items-center justify-center rounded-[9px] text-[11px] font-black leading-[1.2] ${
                                        item.off
                                            ? 'w-[63px] bg-[#fff4ed] text-[#ed7620]'
                                            : 'w-[50px] bg-[#e4fbf3] text-[#15ba6d]'
                                    }` }
                                >
                                    { item.off ?? __( 'FREE', 'dokan-lite' ) }
                                </span>
                            </li>
                        ) ) }
                    </ul>

                    <div className="flex min-h-[65px] items-center justify-between gap-4 rounded-[13px] bg-[#f3f2ff] ps-[34px] pe-[21px]">
                        <span className="text-[15.6px] font-bold leading-[19px] text-black">
                            { __( 'Bought separately', 'dokan-lite' ) }
                        </span>
                        <s className="text-[20px] font-semibold leading-9 text-[#7047eb]">
                            $8,227
                        </s>
                    </div>
                </div>
            </div>

            <div className="flex min-w-0 flex-col items-stretch rounded-[19px] bg-white pb-[22px] ps-[17px] pe-[27px] pt-[23px]">
                <div className="flex flex-wrap items-start justify-between gap-2 ps-[26px]">
                    <span className="mt-[15px] text-[20px] leading-[1.2] text-[#a9a3c4]">
                        { createInterpolateElement(
                            __( 'Total value $<s>8,227</s>', 'dokan-lite' ),
                            { s: <s /> }
                        ) }
                    </span>
                    <span className="-me-[10px] inline-flex h-[46px] w-[146px] items-center justify-center rounded-full bg-[#fce6fd] text-[19px] font-black leading-[1.2] text-[#92068f]">
                        { __( '72% Savings', 'dokan-lite' ) }
                    </span>
                </div>

                <span className="mt-1.5 ps-[21.5px] text-[53px] font-bold leading-[1.25] text-black">
                    $2,247.75
                </span>

                <span className="ms-[18px] mt-2 inline-flex h-12 items-center gap-2 self-start rounded-lg bg-[#e4fbf3] px-2.5 text-[24px] font-bold leading-[1.2] text-[#007d5d]">
                    <Sparkle />
                    { createInterpolateElement(
                        __( 'You save <strong>$5,979</strong>', 'dokan-lite' ),
                        { strong: <strong className="font-black" /> }
                    ) }
                </span>

                <div className="mt-4 flex flex-col gap-[10.4px] rounded-[21px] border border-solid border-[#eeebff] px-[23px] pb-[22px] pt-[22px]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="pb-2 text-[18px] font-black leading-[1.2] text-[#08051c]">
                            { __( 'Limited time offer', 'dokan-lite' ) }
                        </span>
                        <div
                            className="me-[2.5px] flex w-[159px] items-start justify-between"
                            role="timer"
                        >
                            { units.map( ( [ value, label ], index ) => (
                                <Fragment key={ label }>
                                    { index > 0 && (
                                        <span className="flex h-[42px] items-center text-[19px] font-bold leading-[1.2] text-[#8282a4]">
                                            :
                                        </span>
                                    ) }
                                    <div className="flex w-[42px] flex-col items-center gap-[5px]">
                                        <span className="flex size-[42px] items-center justify-center rounded-[10px] bg-[#f4f4f4] text-[17px] font-black leading-[1.2] text-[#08051c]">
                                            { pad( value ) }
                                        </span>
                                        <span className="text-[13.8px] leading-[1.2] text-[#8282a4]">
                                            { label }
                                        </span>
                                    </div>
                                </Fragment>
                            ) ) }
                        </div>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-linear-to-r from-[#a89bff] to-[#e9e7f8]">
                        <div
                            className="h-full rounded-full bg-linear-to-r from-[#ff4c86] to-[#ffb26f]"
                            style={ { width: `${ CLAIMED_PERCENT }%` } }
                        />
                    </div>

                    <span className="text-[14.6px] leading-[1.2] text-[#8282a4]">
                        { sprintf(
                            /* translators: %d: share of the bundle offer already claimed */
                            __( '%d%% Claimed', 'dokan-lite' ),
                            CLAIMED_PERCENT
                        ) }
                    </span>
                </div>

                <a
                    href={ url }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mx-[10.5px] mt-[26px] flex items-center justify-center gap-[9px] rounded-[4px] bg-[#7047eb] px-[39px] py-5 text-[15.5px] font-bold leading-[1.3] text-white no-underline transition-colors hover:bg-[#5d39c4] hover:text-white focus:text-white"
                >
                    { __( 'Get the Enterprise Bundle', 'dokan-lite' ) }
                    <ArrowRight />
                </a>

                <p className="m-0 mt-10 ps-[7px] text-center text-[15.5px] leading-[1.2] text-[#8282a4]">
                    { createInterpolateElement(
                        sprintf(
                            /* translators: 1: days, 2: hours, 3: minutes left, e.g. "3d 15h 16m" */
                            __(
                                'Deal ends in <time>%1$dd %2$dh %3$dm</time>',
                                'dokan-lite'
                            ),
                            days,
                            hours,
                            minutes
                        ),
                        { time: <span className="text-[#e10104]" /> }
                    ) }
                </p>

                <p className="m-0 mt-auto flex items-center justify-center gap-[17px] pt-[51px] text-[15.5px] leading-[1.2] text-[#8282a4]">
                    <ShieldCheck />
                    { __( 'One time payment', 'dokan-lite' ) }
                </p>
            </div>
        </section>
    );
};

export default EnterpriseBundle;
