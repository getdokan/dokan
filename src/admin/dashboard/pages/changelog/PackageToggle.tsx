import { __ } from '@wordpress/i18n';
import { Crown } from 'lucide-react';

const PackageToggle = ( {
    activePackage,
    hasPro,
    onToggle,
}: {
    activePackage: 'lite' | 'pro';
    hasPro: boolean;
    onToggle: ( pkg: 'lite' | 'pro' ) => void;
} ) => {
    if ( ! hasPro ) {
        return null;
    }

    return (
        <div className="inline-flex">
            <button
                onClick={ () => onToggle( 'lite' ) }
                className={ `flex flex-col justify-center items-end px-[22px] py-2 text-sm font-semibold transition-colors rounded-l-[5px] border ${
                    activePackage === 'lite'
                        ? 'bg-[#7047EB] border-[#7047EB] text-white'
                        : 'bg-white border-[#E9E9E9] text-black'
                }` }
            >
                { __( 'Lite', 'dokan-lite' ) }
            </button>
            <button
                onClick={ () => onToggle( 'pro' ) }
                className={ `flex flex-col justify-center items-end px-[22px] py-2 text-sm font-medium transition-colors rounded-r-[5px] border ${
                    activePackage === 'pro'
                        ? 'bg-[#7047EB] border-[#7047EB] text-white'
                        : 'bg-white border-[#E9E9E9] text-black'
                }` }
            >
                <span className="flex items-center font-semibold gap-2">
                    { __( 'Pro', 'dokan-lite' ) }
                    <Crown size={ 16 } />
                </span>
            </button>
        </div>
    );
};

export default PackageToggle;
