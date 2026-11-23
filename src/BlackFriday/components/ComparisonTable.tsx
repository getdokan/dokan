// TODO BFCM-2026-REMOVE: seasonal Black Friday / Cyber Monday page. Remove manually after the campaign ends (Dec 5, 2026); nothing switches itself off.
import { __ } from '@wordpress/i18n';
import { CheckBadge } from './Icons';
import { COMPARE_SECTION_ID } from './Hero';

// Each row is [ feature, Lite value, Pro value ].
const getRows = (): Array< [ string, string, string ] > => {
    const yes = __( 'Yes', 'dokan-lite' );
    const no = __( 'No', 'dokan-lite' );

    return [
        [
            __( 'Unlimited vendors and vendor dashboard', 'dokan-lite' ),
            yes,
            yes,
        ],
        [
            __( 'Premium modules', 'dokan-lite' ),
            __( 'None', 'dokan-lite' ),
            __( '42+', 'dokan-lite' ),
        ],
        [
            __( 'Stripe Connect and PayPal Marketplace payouts', 'dokan-lite' ),
            no,
            yes,
        ],
        [ __( 'Multiple commission types', 'dokan-lite' ), no, yes ],
        [ __( 'Vendor subscriptions', 'dokan-lite' ), no, yes ],
        [ __( 'Bookings and auctions', 'dokan-lite' ), no, yes ],
        [ __( 'Seller verification and badges', 'dokan-lite' ), no, yes ],
        [ __( 'Table rate shipping', 'dokan-lite' ), no, yes ],
        [ __( 'Vendor analytics and reports', 'dokan-lite' ), no, yes ],
        [
            __( 'Support', 'dokan-lite' ),
            __( 'WordPress.org', 'dokan-lite' ),
            __( 'Ticket, priority on Enterprise', 'dokan-lite' ),
        ],
    ];
};

const headingClass =
    'px-6 py-4 text-[13px] font-semibold uppercase leading-normal tracking-[0.78px]';

// Lite vs Pro feature comparison table.
const ComparisonTable = () => {
    const yes = __( 'Yes', 'dokan-lite' );

    return (
        <section
            id={ COMPARE_SECTION_ID }
            className="flex scroll-mt-10 flex-col gap-7 rounded-xl border border-[#ececec] bg-white p-6 lg:p-10"
        >
            <div className="flex flex-col gap-2">
                <h2 className="m-0 text-[32px] font-bold leading-[42px] text-[#0e0e0f]">
                    { __( 'What You Unlock with Dokan Pro', 'dokan-lite' ) }
                </h2>
                <p className="m-0 text-[18px] leading-normal text-[#575757]">
                    { __(
                        'Your marketplace runs on Lite today. Here is what Pro adds.',
                        'dokan-lite'
                    ) }
                </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#ececec]">
                <table className="m-0 w-full border-collapse">
                    <thead>
                        <tr className="border-b border-[#efeff2] bg-[#f7f7f9]">
                            <th
                                scope="col"
                                className={ `${ headingClass } text-left text-[#4a5565]` }
                            >
                                { __( 'Feature', 'dokan-lite' ) }
                            </th>
                            <th
                                scope="col"
                                className={ `${ headingClass } w-[200px] text-center text-[#4a5565]` }
                            >
                                { __( 'Lite', 'dokan-lite' ) }
                            </th>
                            <th
                                scope="col"
                                className={ `${ headingClass } w-[260px] bg-[#7047eb] text-center text-white` }
                            >
                                { __( 'Pro', 'dokan-lite' ) }
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        { getRows().map( ( [ feature, lite, pro ], index ) => (
                            <tr
                                key={ feature }
                                className={ `border-b border-[#efeff2] last:border-b-0 ${
                                    index % 2 ? 'bg-[#fcfcfd]' : 'bg-white'
                                }` }
                            >
                                <td className="px-6 py-[15px] text-[16px] leading-normal text-[#2a2a2e]">
                                    { feature }
                                </td>
                                <td
                                    className={ `px-6 py-[15px] text-center text-[15px] leading-normal ${
                                        lite === yes
                                            ? 'text-[#2a2a2e]'
                                            : 'text-[#9a9aa3]'
                                    }` }
                                >
                                    { lite }
                                </td>
                                <td className="bg-[#7047eb]/6 px-6 py-[15px] text-center text-[15px] font-bold leading-normal text-[#7047eb]">
                                    <span className="inline-flex items-center gap-2">
                                        { pro === yes && <CheckBadge /> }
                                        { pro }
                                    </span>
                                </td>
                            </tr>
                        ) ) }
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default ComparisonTable;
