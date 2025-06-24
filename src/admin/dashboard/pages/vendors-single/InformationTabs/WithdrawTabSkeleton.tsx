import { __ } from '@wordpress/i18n';
import { Card } from '@getdokan/dokan-ui';

function WithdrawTabSkeleton() {
    return (
        <Card className="bg-white shadow p-6">
            <div>
                <div className="mb-2">
                    <h4 className="text-zinc-500 text-xs font-normal">
                        { __( 'Connected', 'dokan-lite' ) }
                    </h4>
                </div>
                <div>
                    <div className="text-[35px] flex flex-wrap gap-2">
                        { [ 1, 2, 3 ].map( ( index ) => (
                            <div
                                key={ index }
                                className="h-[26px] w-[80px] bg-gray-200 rounded-[3px] animate-pulse"
                            ></div>
                        ) ) }
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <div className="mb-2">
                    <h4 className="text-zinc-500 text-xs font-normal">
                        { __( 'Not Connected', 'dokan-lite' ) }
                    </h4>
                </div>
                <div>
                    <div className="text-[35px] flex flex-wrap gap-2 grayscale">
                        { [ 1, 2, 3, 4 ].map( ( index ) => (
                            <div
                                key={ index }
                                className="h-[26px] w-[80px] bg-gray-200 rounded-[3px] animate-pulse"
                            ></div>
                        ) ) }
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default WithdrawTabSkeleton;
