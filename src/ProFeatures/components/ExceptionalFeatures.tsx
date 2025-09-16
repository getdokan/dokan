import fcmImg from '../assets/FCM.png';
import aerImg from '../assets/AER.png';
import awdImg from '../assets/AWD.png';
import fcsImg from '../assets/FCS.png';
import iaImg from '../assets/IA.png';
import rrwImg from '../assets/RRW.png';
import { __ } from '@wordpress/i18n';
import { ChartPie, CreditCard, Megaphone, Pen, Percent, TicketPercent } from "lucide-react";

function ExceptionalFeatures() {
    const exceptional = [
        {
            icon: Percent,
            title: __( 'Flexible Commission Structure', 'dokan-lite' ),
            description: __(
                'Set commissions globally or customize them for vendors, categories, or products.',
                'dokan-lite'
            ),
        },
        {
            icon: ChartPie,
            title: __( 'Admin & Earning Reports', 'dokan-lite' ),
            description: __(
                'Track daily, yearly, and vendor specific earnings from a single dashboard.',
                'dokan-lite'
            ),
        },
        {
            icon: Megaphone,
            title: __( 'Instant Announcements', 'dokan-lite' ),
            description: __(
                "Send important announcements directly to sellers' dashboards for seamless communication.",
                'dokan-lite'
            ),
        },
        {
            icon: CreditCard,
            title: __( 'Automatic Withdrawal Disbursement', 'dokan-lite' ),
            description: __(
                'Automate vendor withdrawals by setting a scheduled disbursement time for seamless transactions.',
                'dokan-lite'
            ),
        },
        {
            icon: Pen,
            title: __( 'Return , Refund & Warranty System', 'dokan-lite' ),
            description: __(
                'Allow vendors to set up customized refund and warranty policies for their customers.',
                'dokan-lite'
            ),
        },
        {
            icon: TicketPercent,
            title: __( 'Flexible Coupon Management', 'dokan-lite' ),
            description: __(
                'Admins and vendors can create product or vendor-specific coupons with ease.',
                'dokan-lite'
            ),
        },
    ];

    return (
        <div>
            <h3 className="text-2xl font-bold mb-8">
                { __( 'What Makes Pro Exceptional', 'dokan-lite' ) }
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                { exceptional.map( ( item, idx ) => (
                    <div key={ idx } className="flex items-start space-x-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-[#F7F5FF] text-dokan-primary rounded border border-neutral-200 flex-shrink-0">
                            <item.icon size={ 16 } />
                        </div>
                        <div>
                            <h4 className="text-[18px] font-bold text-gray-700 mb-2">
                                { item.title }
                            </h4>
                            <p className="text-gray-600 font-regular text-[14px]">
                                { item.description }
                            </p>
                        </div>
                    </div>
                ) ) }
            </div>
        </div>
    );
}

export default ExceptionalFeatures;
