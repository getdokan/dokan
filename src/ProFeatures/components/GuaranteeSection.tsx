import { CircleCheck } from 'lucide-react';
import { __ } from '@wordpress/i18n';

function GuaranteeSection() {
    return (
        <div
            className="w-full max-w-7xl mx-auto pt-10 pb-10"
            style={ { fontFamily: 'Inter, sans-serif' } }
        >
            { /* What Makes Dokan Stand Out */ }
            <div>
                <h3 className="text-[24px] font-bold mb-8 text-gray-900">
                    What Makes Dokan Stand Out
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex items-start gap-2">
                        <div>
                            <CircleCheck
                                size="20"
                                className="text-dokan-primary"
                            />
                        </div>
                        <div>
                            <h4 className="text-[14px] font-semibold text-gray-600 mb-2">
                                { __(
                                    '14 Days Money Back Guarantee',
                                    'dokan-lite'
                                ) }
                            </h4>
                            <p className="text-[12px] font-regular text-gray-400">
                                { __(
                                    "Get a full refund within 14 days if our plugin doesn't meet your needs—no questions asked!",
                                    'dokan-lite'
                                ) }
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <div>
                            <CircleCheck
                                size="20"
                                className="text-dokan-primary"
                            />
                        </div>
                        <div>
                            <h4 className="text-[14px] font-semibold text-gray-600 mb-2">
                                { __(
                                    'Help Is Just a Click Away, Day or Night!',
                                    'dokan-lite'
                                ) }
                            </h4>
                            <p className="text-[12px] font-regular text-gray-400">
                                { __(
                                    'Receive expert support 24/7 to keep your business running smoothly, anytime you need help.',
                                    'dokan-lite'
                                ) }
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <div>
                            <CircleCheck
                                size="20"
                                className="text-dokan-primary"
                            />
                        </div>
                        <div>
                            <h4 className="text-[14px] font-semibold text-gray-600 mb-2">
                                { __( 'Regular Releases', 'dokan-lite' ) }
                            </h4>
                            <p className="text-[12px] font-regular text-gray-400">
                                { __(
                                    'Stay ahead with frequent updates, new features, and enhancements to keep your marketplace running at its best.',
                                    'dokan-lite'
                                ) }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GuaranteeSection;
